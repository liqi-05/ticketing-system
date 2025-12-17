namespace FairTix.Api.Models;

public class Seat
{
    public long Id { get; set; }
    public Guid EventId { get; set; }
    public string Section { get; set; } = string.Empty;
    public string RowNumber { get; set; } = string.Empty;
    public string SeatNumber { get; set; } = string.Empty;
    public SeatStatus Status { get; set; } = SeatStatus.Available;
    public Guid? UserId { get; set; }
    public DateTime? ReservedAt { get; set; }
    
    // Optimistic concurrency control using PostgreSQL xmin
    // This will be mapped to PostgreSQL's xmin system column
    public uint Version { get; set; }
    
    // Navigation properties
    public Event Event { get; set; } = null!;
    public User? User { get; set; }
}

