using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FairTix.Api.Data;
using FairTix.Api.Models;

namespace FairTix.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly FairTixDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(FairTixDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("sample-data")]
    public async Task<IActionResult> SeedSampleData()
    {
        try
        {
            // Check if data already exists
            if (await _context.Events.AnyAsync())
            {
                return BadRequest("Sample data already exists. Use /api/seed/clear to remove existing data first.");
            }

            // Create sample users
            var users = new List<User>
            {
                new User { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Email = "user1@example.com", PasswordHash = "hashed_password_1" },
                new User { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Email = "user2@example.com", PasswordHash = "hashed_password_2" },
                new User { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Email = "user3@example.com", PasswordHash = "hashed_password_3" }
            };
            _context.Users.AddRange(users);

            // Create sample events
            var events = new List<Event>
            {
                new Event 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), 
                    Name = "Summer Concert 2024", 
                    TotalSeats = 600, 
                    SaleStartTime = DateTime.UtcNow.AddDays(-1),
                    IsActive = true
                },
                new Event 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), 
                    Name = "Rock Festival 2024", 
                    TotalSeats = 5000, 
                    SaleStartTime = DateTime.UtcNow.AddDays(-2),
                    IsActive = true
                },
                new Event 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), 
                    Name = "Jazz Night", 
                    TotalSeats = 500, 
                    SaleStartTime = DateTime.UtcNow.AddDays(1),
                    IsActive = false
                }
            };
            _context.Events.AddRange(events);

            // Create sample seats for Summer Concert (Event 1)
            var event1Id = Guid.Parse("00000000-0000-0000-0000-000000000001");
            var seats = new List<Seat>();
            
            foreach (var section in new[] { "A", "B", "C" })
            {
                for (int row = 1; row <= 10; row++)
                {
                    for (int seatNum = 1; seatNum <= 20; seatNum++)
                    {
                        seats.Add(new Seat
                        {
                            EventId = event1Id,
                            Section = section,
                            RowNumber = row.ToString(),
                            SeatNumber = seatNum.ToString(),
                            Status = SeatStatus.Available,
                            Version = 0
                        });
                    }
                }
            }
            _context.Seats.AddRange(seats);

            // Create sample orders
            var orders = new List<Order>
            {
                new Order
                {
                    Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    TotalAmount = 100.00m,
                    PaymentStatus = "Completed"
                },
                new Order
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                    UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    TotalAmount = 150.00m,
                    PaymentStatus = "Pending"
                }
            };
            _context.Orders.AddRange(orders);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Sample data seeded successfully");
            return Ok(new
            {
                message = "Sample data seeded successfully",
                users = users.Count,
                events = events.Count,
                seats = seats.Count,
                orders = orders.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding sample data");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("clear")]
    public async Task<IActionResult> ClearAllData()
    {
        try
        {
            _context.Orders.RemoveRange(_context.Orders);
            _context.Seats.RemoveRange(_context.Seats);
            _context.Events.RemoveRange(_context.Events);
            _context.Users.RemoveRange(_context.Users);
            
            await _context.SaveChangesAsync();

            _logger.LogInformation("All data cleared");
            return Ok(new { message = "All data cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing data");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}





