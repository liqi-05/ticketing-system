using StackExchange.Redis;
using System.Text.Json;

namespace FairTix.Api.Services;

public class QueueService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<QueueService> _logger;
    private const string WAITING_ROOM_KEY = "event:queue:waiting";
    private const string ACTIVE_SET_KEY = "event:queue:active";

    public QueueService(IConnectionMultiplexer redis, ILogger<QueueService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    /// <summary>
    /// Add a user to the waiting room queue
    /// </summary>
    public async Task<bool> JoinWaitingRoomAsync(Guid userId, Guid eventId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var queueKey = $"{WAITING_ROOM_KEY}:{eventId}";
            
            // Add to end of queue (FIFO)
            await db.ListRightPushAsync(queueKey, userId.ToString());
            
            _logger.LogInformation("User {UserId} joined waiting room for event {EventId}", userId, eventId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user {UserId} to waiting room", userId);
            return false;
        }
    }

    /// <summary>
    /// Get user's position in the waiting room
    /// </summary>
    public async Task<int?> GetQueuePositionAsync(Guid userId, Guid eventId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var queueKey = $"{WAITING_ROOM_KEY}:{eventId}";
            
            // Find position in queue (0-based)
            // ListPositionAsync returns -1 if not found, or the 0-based index if found
            var position = await db.ListPositionAsync(queueKey, userId.ToString());
            if (position < 0)
                return null;
            return (int)position;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting queue position for user {UserId}", userId);
            return null;
        }
    }

    /// <summary>
    /// Process queue and admit users to active session (called by background worker)
    /// </summary>
    public async Task<int> AdmitUsersFromQueueAsync(Guid eventId, int admissionRate)
    {
        try
        {
            var db = _redis.GetDatabase();
            var queueKey = $"{WAITING_ROOM_KEY}:{eventId}";
            var admitted = 0;

            // Pop batch of users from waiting room
            for (int i = 0; i < admissionRate; i++)
            {
                var userId = await db.ListLeftPopAsync(queueKey);
                if (userId.IsNullOrEmpty)
                    break;

                // Add to active set with TTL (5 minutes to complete purchase)
                var activeKey = $"session:{eventId}:{userId}";
                await db.StringSetAsync(activeKey, "active", TimeSpan.FromMinutes(5));
                admitted++;
            }

            if (admitted > 0)
            {
                _logger.LogInformation("Admitted {Count} users from queue for event {EventId}", admitted, eventId);
            }

            return admitted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing queue for event {EventId}", eventId);
            return 0;
        }
    }

    /// <summary>
    /// Check if user is in active session (can make reservations)
    /// </summary>
    public async Task<bool> IsUserActiveAsync(Guid userId, Guid eventId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var activeKey = $"session:{eventId}:{userId}";
            return await db.KeyExistsAsync(activeKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking active status for user {UserId}", userId);
            return false;
        }
    }

    /// <summary>
    /// Remove user from active session (after purchase or timeout)
    /// </summary>
    public async Task<bool> RemoveActiveSessionAsync(Guid userId, Guid eventId)
    {
        try
        {
            var db = _redis.GetDatabase();
            var activeKey = $"session:{eventId}:{userId}";
            return await db.KeyDeleteAsync(activeKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing active session for user {UserId}", userId);
            return false;
        }
    }
}

