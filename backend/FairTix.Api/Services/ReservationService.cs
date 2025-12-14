using Microsoft.EntityFrameworkCore;
using FairTix.Api.Data;
using FairTix.Api.Models;

namespace FairTix.Api.Services;

public class ReservationService
{
    private readonly FairTixDbContext _context;
    private readonly ILogger<ReservationService> _logger;

    public ReservationService(FairTixDbContext context, ILogger<ReservationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ReservationResult> ReserveSeatsAsync(Guid userId, List<long> seatIds, Guid eventId)
    {
        // Start transaction for atomicity
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Fetch seats with tracking (for EF Core concurrency check)
            var seats = await _context.Seats
                .Where(s => seatIds.Contains(s.Id) && s.EventId == eventId)
                .ToListAsync();

            // Validate all seats exist
            if (seats.Count != seatIds.Count)
            {
                return ReservationResult.InvalidSeats;
            }

            // Check if seats are actually available
            if (seats.Any(s => s.Status != SeatStatus.Available))
            {
                return ReservationResult.AlreadyTaken;
            }

            // Update state
            foreach (var seat in seats)
            {
                seat.Status = SeatStatus.Reserved;
                seat.UserId = userId;
                seat.ReservedAt = DateTime.UtcNow;
            }

            // Attempt save - EF Core will check Version (concurrency token) automatically
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Successfully reserved {Count} seats for user {UserId}", seatIds.Count, userId);
            return ReservationResult.Success;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Race condition detected - another user reserved these seats
            await transaction.RollbackAsync();
            _logger.LogWarning("Concurrency conflict detected for seats {SeatIds}", string.Join(", ", seatIds));
            return ReservationResult.ConcurrencyConflict;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error reserving seats for user {UserId}", userId);
            return ReservationResult.Error;
        }
    }

    public async Task<PurchaseResult> PurchaseReservedSeatsAsync(Guid userId, List<long> seatIds)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var seats = await _context.Seats
                .Where(s => seatIds.Contains(s.Id) && s.UserId == userId && s.Status == SeatStatus.Reserved)
                .ToListAsync();

            if (seats.Count != seatIds.Count)
            {
                return PurchaseResult.InvalidSeats;
            }

            // Update to sold status
            foreach (var seat in seats)
            {
                seat.Status = SeatStatus.Sold;
            }

            // Create order
            var totalAmount = seats.Count * 50.00m; // Example pricing
            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                PaymentStatus = "Completed"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Successfully purchased {Count} seats for user {UserId}", seatIds.Count, userId);
            return PurchaseResult.Success(order.Id);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error purchasing seats for user {UserId}", userId);
            return PurchaseResult.Failed;
        }
    }
}

public enum ReservationResult
{
    Success,
    InvalidSeats,
    AlreadyTaken,
    ConcurrencyConflict,
    Error
}

public class PurchaseResult
{
    public bool IsSuccess { get; set; }
    public Guid? OrderId { get; set; }
    public string? Error { get; set; }

    public static PurchaseResult Success(Guid orderId) => new() { IsSuccess = true, OrderId = orderId };
    public static PurchaseResult InvalidSeats => new() { IsSuccess = false, Error = "Invalid seats" };
    public static PurchaseResult Failed => new() { IsSuccess = false, Error = "Purchase failed" };
}

