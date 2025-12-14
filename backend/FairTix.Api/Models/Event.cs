namespace FairTix.Api.Models;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int TotalSeats { get; set; }
    public DateTime SaleStartTime { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation property
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}




