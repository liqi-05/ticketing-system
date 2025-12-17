using Microsoft.EntityFrameworkCore;
using FairTix.Api.Services;

namespace FairTix.Api.Workers;

public class QueueProcessorWorker : BackgroundService
{
    private readonly QueueService _queueService;
    private readonly ILogger<QueueProcessorWorker> _logger;
    private const int ADMISSION_RATE = 500; // Users per second
    private const int PROCESS_INTERVAL_MS = 1000; // Check every second

    private readonly IServiceScopeFactory _scopeFactory;

    public QueueProcessorWorker(QueueService queueService, ILogger<QueueProcessorWorker> logger, IServiceScopeFactory scopeFactory)
    {
        _queueService = queueService;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Queue Processor Worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<Data.FairTixDbContext>();
                    
                    // Fetch all active events
                    var activeEvents = await dbContext.Events
                        .Where(e => e.IsActive)
                        .Select(e => e.Id)
                        .ToListAsync(stoppingToken);

                    foreach (var eventId in activeEvents)
                    {
                        var admissionRate = CalculateAdmissionRate();
                        var admitted = await _queueService.AdmitUsersFromQueueAsync(eventId, admissionRate);
                        
                        if (admitted > 0)
                        {
                            _logger.LogInformation("Admitted {Count} users from queue for event {EventId}", admitted, eventId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing queues");
            }

            await Task.Delay(PROCESS_INTERVAL_MS, stoppingToken);
        }

        _logger.LogInformation("Queue Processor Worker stopped");
    }

    private int CalculateAdmissionRate()
    {
        return ADMISSION_RATE;
    }
}





