using Microsoft.EntityFrameworkCore;
using FairTix.Api.Models;

namespace FairTix.Api.Data;

public class FairTixDbContext : DbContext
{
    public FairTixDbContext(DbContextOptions<FairTixDbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Seat> Seats { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Event
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.SaleStartTime).HasColumnType("timestamptz");
            entity.HasIndex(e => e.IsActive);
        });

        // Configure Seat - Critical for optimistic concurrency
        modelBuilder.Entity<Seat>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Id).UseIdentityAlwaysColumn(); // BIGSERIAL in PostgreSQL
            entity.Property(s => s.Section).HasMaxLength(50).IsRequired();
            entity.Property(s => s.RowNumber).HasMaxLength(10).IsRequired();
            entity.Property(s => s.SeatNumber).HasMaxLength(10).IsRequired();
            entity.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(s => s.ReservedAt).HasColumnType("timestamptz");
            
            // Use PostgreSQL xmin for optimistic concurrency
            // xmin is a system column - we'll use a computed column approach
            // For now, use a regular version column that gets updated via trigger
            entity.Property(s => s.Version)
                .IsConcurrencyToken();
            
            // Foreign keys
            entity.HasOne(s => s.Event)
                .WithMany(e => e.Seats)
                .HasForeignKey(s => s.EventId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(s => s.User)
                .WithMany(u => u.Seats)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Indexes for performance
            entity.HasIndex(s => new { s.EventId, s.Status });
            entity.HasIndex(s => s.UserId);
        });

        // Configure User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).HasMaxLength(255).IsRequired();
            entity.Property(u => u.CreatedAt).HasColumnType("timestamptz");
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Configure Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(o => o.PaymentStatus).HasMaxLength(50).IsRequired();
            entity.Property(o => o.CreatedAt).HasColumnType("timestamptz");
            
            entity.HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(o => o.UserId);
        });
    }
}

