namespace FairTix.Api.DTOs;

public record ReserveSeatsRequest(
    Guid UserId,
    Guid EventId,
    List<long> SeatIds
);

public record PurchaseSeatsRequest(
    Guid UserId,
    List<long> SeatIds
);

public record JoinQueueRequest(
    Guid UserId,
    Guid EventId
);




