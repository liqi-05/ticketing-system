namespace FairTix.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}




