using FairTix.Api.Services;

namespace FairTix.Api.Workers;

public class QueueProcessorWorker : BackgroundService
{
    private readonly QueueService _queueService;
    private readonly ILogger<QueueProcessorWorker> _logger;
    private const int ADMISSION_RATE = 500; // Users per second
    private const int PROCESS_INTERVAL_MS = 1000; // Check every second

    public QueueProcessorWorker(QueueService queueService, ILogger<QueueProcessorWorker> logger)
    {
        _queueService = queueService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Queue Processor Worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Process queues for all active events
                // In production, you'd fetch active events from database
                // For now, we'll process a default event
                var eventId = Guid.Empty; // Replace with actual event ID from config/db
                
                // Calculate dynamic admission rate based on system load
                var admissionRate = CalculateAdmissionRate();
                
                var admitted = await _queueService.AdmitUsersFromQueueAsync(eventId, admissionRate);
                
                if (admitted > 0)
                {
                    _logger.LogInformation("Admitted {Count} users from queue", admitted);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing queue");
            }

            await Task.Delay(PROCESS_INTERVAL_MS, stoppingToken);
        }

        _logger.LogInformation("Queue Processor Worker stopped");
    }

    private int CalculateAdmissionRate()
    {
        // Simple implementation - in production, monitor DB load, response times, etc.
        // For now, use a fixed rate
        return ADMISSION_RATE;
    }
}




