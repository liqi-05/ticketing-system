using StackExchange.Redis;
using Microsoft.EntityFrameworkCore;
using FairTix.Api.Data;
using FairTix.Api.Models;
using System.Text.Json;
using FairTix.Api.Services;
using FairTix.Api.Workers;
using FairTix.Api.DTOs;

// #region agent log
void LogDebug(string location, string message, object? data = null, string hypothesisId = "")
{
    try
    {
        var logEntry = new
        {
            id = $"log_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}",
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            location = location,
            message = message,
            data = data,
            sessionId = "debug-session",
            runId = "run1",
            hypothesisId = hypothesisId
        };
        // Use absolute path from workspace root
        var logPath = @"C:\Users\leeli\OneDrive\Documents\GitHub\liqi-05\ticketing-system\ticketing-system\.cursor\debug.log";
        var logDir = Path.GetDirectoryName(logPath);
        if (!string.IsNullOrEmpty(logDir) && !Directory.Exists(logDir))
        {
            Directory.CreateDirectory(logDir);
        }
        File.AppendAllText(logPath, JsonSerializer.Serialize(logEntry) + Environment.NewLine);
        // Also log to console as backup
        Console.WriteLine($"[DEBUG] {location}: {message}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DEBUG LOG ERROR] {ex.Message}");
    }
}
// #endregion agent log

LogDebug("Program.cs:1", "Application startup beginning", null, "C");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register Redis ConnectionMultiplexer - connection will be established on first use
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    // #region agent log
    LogDebug("Program.cs:40", "Creating Redis ConnectionMultiplexer factory", new { host = "localhost", port = 6379 }, "A");
    // #endregion agent log
    
    // Use configuration for Redis connection string
    var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    var configuration = ConfigurationOptions.Parse(redisConnectionString);
    configuration.ConnectTimeout = 2000; // 2 second timeout - fail fast
    configuration.ConnectRetry = 1;
    configuration.AbortOnConnectFail = false; // Don't throw on connect fail
    configuration.AsyncTimeout = 5000;
    
    // #region agent log
    LogDebug("Program.cs:48", "Calling ConnectionMultiplexer.Connect", null, "A");
    // #endregion agent log
    
    try
    {
        var redis = ConnectionMultiplexer.Connect(configuration);
        // #region agent log
        LogDebug("Program.cs:52", "Redis ConnectionMultiplexer created", new { isConnected = redis.IsConnected }, "A");
        // #endregion agent log
        return redis;
    }
    catch (Exception ex)
    {
        // #region agent log
        LogDebug("Program.cs:52", "Redis connection failed during service registration", new { error = ex.Message, stackTrace = ex.StackTrace }, "A");
        // #endregion agent log
        // Re-throw to see the actual error, but this will prevent app startup
        throw;
    }
});

// Register PostgreSQL DbContext
// #region agent log
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=fairtix;Username=postgres;Password=password";
LogDebug("Program.cs:19", "Registering Postgres DbContext", new { host = "localhost", port = 5432, database = "fairtix" }, "B");
// #endregion agent log
builder.Services.AddDbContext<FairTixDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register application services
builder.Services.AddScoped<ReservationService>();
// QueueService is singleton because it only uses singleton dependencies (Redis, Logger)
// and is used by the background worker (which is also singleton)
builder.Services.AddSingleton<QueueService>();

// Register background workers
builder.Services.AddHostedService<QueueProcessorWorker>();

// Register controllers for SeedController
builder.Services.AddControllers();

var app = builder.Build();

// #region agent log
var configuredUrls = builder.Configuration["Urls"] ?? builder.Configuration["ASPNETCORE_URLS"] ?? "not configured";
var launchUrls = builder.Configuration["applicationUrl"] ?? "not in launchSettings";
var environment = app.Environment.EnvironmentName;
var urlsList = app.Urls.ToList();
LogDebug("Program.cs:111", "Application built successfully", new { 
    configuredUrls = configuredUrls, 
    launchUrls = launchUrls,
    environment = environment,
    actualUrls = string.Join(", ", urlsList),
    urlCount = urlsList.Count
}, "B");
// #endregion agent log

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Skip HTTPS redirection in development to avoid certificate issues
}
else
{
    app.UseHttpsRedirection();
}

// Map controllers
app.MapControllers();

// Serve static files from the frontend dist folder
var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "dist");
if (Directory.Exists(frontendPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath),
        RequestPath = ""
    });
}

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// API endpoints - mapped before SPA fallback
app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// Events endpoints
app.MapGet("/api/events", async (FairTixDbContext dbContext) =>
{
    var events = await dbContext.Events
        .Where(e => e.IsActive)
        .Select(e => new
        {
            e.Id,
            e.Name,
            e.TotalSeats,
            SaleStartTime = e.SaleStartTime,
            e.IsActive,
            AvailableSeats = dbContext.Seats.Count(s => s.EventId == e.Id && s.Status == SeatStatus.Available)
        })
        .ToListAsync();
    
    return Results.Ok(events);
})
.WithName("GetEvents");

// Get Seats for Event
app.MapGet("/api/events/{eventId}/seats", async (Guid eventId, FairTixDbContext dbContext) =>
{
    var seats = await dbContext.Seats
        .Where(s => s.EventId == eventId)
        .OrderBy(s => s.Section)
        .ThenBy(s => s.RowNumber)
        .ThenBy(s => s.SeatNumber)
        .Select(s => new
        {
            s.Id,
            s.Section,
            s.RowNumber,
            s.SeatNumber,
            Status = s.Status.ToString()
        })
        .ToListAsync();

    return Results.Ok(seats);
})
.WithName("GetSeats");

// Health check endpoint
app.MapGet("/health", async (IConnectionMultiplexer redis, FairTixDbContext dbContext) =>
{
    var errors = new List<string>();
    
    // Test Redis connection
    try
    {
        var db = redis.GetDatabase();
        await db.PingAsync();
    }
    catch (Exception ex)
    {
        errors.Add($"Redis error: {ex.Message}");
    }
    
    // Test Postgres connection
    try
    {
        await dbContext.Database.CanConnectAsync();
    }
    catch (Exception ex)
    {
        errors.Add($"Postgres error: {ex.Message}");
    }
    
    if (errors.Count > 0)
    {
        return Results.Problem(
            detail: string.Join("; ", errors),
            statusCode: 503
        );
    }
    
    return Results.Ok("System Healthy");
})
.WithName("HealthCheck");

// Auth Endpoint for Demo
app.MapPost("/api/auth/login", async (FairTixDbContext dbContext) =>
{
    var userId = Guid.NewGuid();
    var email = $"user_{userId:N}@example.com";
    
    var user = new User
    {
        Id = userId,
        Email = email,
        PasswordHash = "demo_hash",
        CreatedAt = DateTime.UtcNow
    };

    dbContext.Users.Add(user);
    await dbContext.SaveChangesAsync();

    return Results.Ok(new { userId, email });
})
.WithName("Login");

// Ticket Reservation Endpoints
app.MapPost("/api/events/{eventId}/queue/join", async (
    Guid eventId,
    JoinQueueRequest request,
    QueueService queueService) =>
{
    // #region agent log
    LogDebug("Program.cs:195", "Join queue endpoint called", new { eventId, requestUserId = request.UserId, requestEventId = request.EventId }, "A");
    // #endregion agent log
    
    if (request.UserId == Guid.Empty || request.EventId != eventId)
    {
        // #region agent log
        LogDebug("Program.cs:197", "Invalid request validation failed", new { requestUserId = request.UserId, requestEventId = request.EventId, eventId }, "A");
        // #endregion agent log
        return Results.BadRequest("Invalid request");
    }

    var success = await queueService.JoinWaitingRoomAsync(request.UserId, eventId);
    return success 
        ? Results.Ok(new { message = "Joined waiting room", eventId, userId = request.UserId })
        : Results.Problem("Failed to join waiting room", statusCode: 500);
})
.WithName("JoinQueue");

app.MapGet("/api/events/{eventId}/queue/position/{userId}", async (
    Guid eventId,
    Guid userId,
    QueueService queueService) =>
{
    var position = await queueService.GetQueuePositionAsync(userId, eventId);
    if (position.HasValue)
    {
        return Results.Ok(new { position = position.Value, eventId, userId });
    }
    return Results.NotFound("User not in queue");
})
.WithName("GetQueuePosition");

app.MapGet("/api/events/{eventId}/queue/active/{userId}", async (
    Guid eventId,
    Guid userId,
    QueueService queueService) =>
{
    var isActive = await queueService.IsUserActiveAsync(userId, eventId);
    return Results.Ok(new { isActive, eventId, userId });
})
.WithName("CheckActiveStatus");

app.MapPost("/api/reservations/reserve", async (
    ReserveSeatsRequest request,
    ReservationService reservationService,
    QueueService queueService) =>
{
    // Check if user is in active session
    var isActive = await queueService.IsUserActiveAsync(request.UserId, request.EventId);
    if (!isActive)
    {
        return Results.Problem(
            detail: "User must be in active session to reserve seats",
            statusCode: 403
        );
    }

    var result = await reservationService.ReserveSeatsAsync(
        request.UserId,
        request.SeatIds,
        request.EventId
    );

    return result switch
    {
        ReservationResult.Success => Results.Ok(new { message = "Seats reserved successfully" }),
        ReservationResult.InvalidSeats => Results.Problem(detail: "Invalid seats selected", statusCode: 400),
        ReservationResult.AlreadyTaken => Results.Problem(detail: "Some of these seats are already taken", statusCode: 409),
        ReservationResult.ConcurrencyConflict => Results.Problem(detail: "Seats were just reserved by another user", statusCode: 409),
        _ => Results.Problem(detail: "Reservation failed", statusCode: 500)
    };
})
.WithName("ReserveSeats");

app.MapPost("/api/reservations/purchase", async (
    PurchaseSeatsRequest request,
    ReservationService reservationService) =>
{
    var result = await reservationService.PurchaseReservedSeatsAsync(request.UserId, request.SeatIds);

    if (result.IsSuccess && result.OrderId.HasValue)
    {
        return Results.Ok(new { message = "Purchase successful", orderId = result.OrderId });
    }

    return Results.BadRequest(new { error = result.Error ?? "Purchase failed" });
})
.WithName("PurchaseSeats");

// SPA fallback - serve index.html for all non-API routes (must be last)
if (Directory.Exists(frontendPath))
{
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath)
    });
}

    // #region agent log
    var urlsBeforeListening = app.Urls.ToList();
    LogDebug("Program.cs:331", "About to start listening", new { 
        environment = app.Environment.EnvironmentName, 
        urls = string.Join(", ", urlsBeforeListening) 
    }, "C");
    // #endregion agent log

// Log when app actually starts listening
app.Lifetime.ApplicationStarted.Register(() =>
{
    // #region agent log
    var listeningUrls = app.Urls.ToList();
    LogDebug("Program.cs:328", "Application started and listening", new { 
        urls = string.Join(", ", listeningUrls),
        urlCount = listeningUrls.Count
    }, "D");
    // #endregion agent log
});

// Log application stopping
app.Lifetime.ApplicationStopping.Register(() =>
{
    // #region agent log
    LogDebug("Program.cs:340", "Application is stopping", null, "E");
    // #endregion agent log
});

// Log application stopped
app.Lifetime.ApplicationStopped.Register(() =>
{
    // #region agent log
    LogDebug("Program.cs:347", "Application has stopped", null, "E");
    // #endregion agent log
});

try
{
    // #region agent log
    var urlsBeforeRun = app.Urls.ToList();
    LogDebug("Program.cs:344", "About to start server with app.Run()", new { 
        urls = string.Join(", ", urlsBeforeRun),
        environment = app.Environment.EnvironmentName 
    }, "A");
    // #endregion agent log
    
    // Note: app.Run() is blocking, so code after it won't execute until server stops
    app.Run();
}
catch (Exception ex)
{
    // #region agent log
    LogDebug("Program.cs:345", "Application crashed during Run()", new { 
        error = ex.Message, 
        stackTrace = ex.StackTrace,
        innerException = ex.InnerException?.Message 
    }, "C");
    // #endregion agent log
    throw;
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
