-- ============================================
-- FairTix Common Database Queries
-- Quick reference for common operations
-- ============================================

-- ============================================
-- VIEW DATA
-- ============================================

-- List all events with seat availability
SELECT 
    e."Id",
    e."Name",
    e."TotalSeats",
    e."SaleStartTime",
    e."IsActive",
    COUNT(s."Id") as total_seats,
    COUNT(CASE WHEN s."Status" = 'Available' THEN 1 END) as available_seats,
    COUNT(CASE WHEN s."Status" = 'Reserved' THEN 1 END) as reserved_seats,
    COUNT(CASE WHEN s."Status" = 'Sold' THEN 1 END) as sold_seats
FROM "Events" e
LEFT JOIN "Seats" s ON e."Id" = s."EventId"
GROUP BY e."Id", e."Name", e."TotalSeats", e."SaleStartTime", e."IsActive"
ORDER BY e."SaleStartTime" DESC;

-- Get all seats for a specific event
SELECT 
    s."Id",
    s."Section",
    s."RowNumber",
    s."SeatNumber",
    s."Status",
    s."UserId",
    s."ReservedAt",
    s."Version"
FROM "Seats" s
WHERE s."EventId" = '00000000-0000-0000-0000-000000000001'  -- Replace with actual EventId
ORDER BY s."Section", s."RowNumber"::INTEGER, s."SeatNumber"::INTEGER;

-- Get available seats for an event
SELECT 
    s."Id",
    s."Section",
    s."RowNumber",
    s."SeatNumber"
FROM "Seats" s
WHERE s."EventId" = '00000000-0000-0000-0000-000000000001'  -- Replace with actual EventId
  AND s."Status" = 'Available'
ORDER BY s."Section", s."RowNumber"::INTEGER, s."SeatNumber"::INTEGER;

-- Get user's reservations
SELECT 
    s."Id",
    s."Section",
    s."RowNumber",
    s."SeatNumber",
    s."Status",
    s."ReservedAt",
    e."Name" as event_name
FROM "Seats" s
JOIN "Events" e ON s."EventId" = e."Id"
WHERE s."UserId" = '11111111-1111-1111-1111-111111111111'  -- Replace with actual UserId
ORDER BY s."ReservedAt" DESC;

-- Get user's orders
SELECT 
    o."Id",
    o."TotalAmount",
    o."PaymentStatus",
    o."CreatedAt",
    COUNT(s."Id") as seat_count
FROM "Orders" o
LEFT JOIN "Seats" s ON s."UserId" = o."UserId" AND s."Status" = 'Sold'
WHERE o."UserId" = '11111111-1111-1111-1111-111111111111'  -- Replace with actual UserId
GROUP BY o."Id", o."TotalAmount", o."PaymentStatus", o."CreatedAt"
ORDER BY o."CreatedAt" DESC;

-- ============================================
-- RESET DATA (for testing)
-- ============================================

-- Reset all seats to Available for an event
UPDATE "Seats"
SET "Status" = 'Available',
    "UserId" = NULL,
    "ReservedAt" = NULL,
    "Version" = 0
WHERE "EventId" = '00000000-0000-0000-0000-000000000001';  -- Replace with actual EventId

-- Delete all orders (be careful!)
-- DELETE FROM "Orders";

-- Delete all reservations (set seats back to available)
UPDATE "Seats"
SET "Status" = 'Available',
    "UserId" = NULL,
    "ReservedAt" = NULL
WHERE "Status" = 'Reserved';

-- ============================================
-- ANALYTICS QUERIES
-- ============================================

-- Event popularity (by reserved seats)
SELECT 
    e."Name",
    COUNT(CASE WHEN s."Status" = 'Reserved' THEN 1 END) as reserved_count,
    COUNT(CASE WHEN s."Status" = 'Sold' THEN 1 END) as sold_count,
    COUNT(CASE WHEN s."Status" = 'Available' THEN 1 END) as available_count,
    ROUND(100.0 * COUNT(CASE WHEN s."Status" IN ('Reserved', 'Sold') THEN 1 END) / COUNT(s."Id"), 2) as occupancy_percent
FROM "Events" e
LEFT JOIN "Seats" s ON e."Id" = s."EventId"
WHERE e."IsActive" = true
GROUP BY e."Id", e."Name"
ORDER BY reserved_count + sold_count DESC;

-- Revenue by event
SELECT 
    e."Name",
    COUNT(DISTINCT o."Id") as order_count,
    SUM(o."TotalAmount") as total_revenue,
    AVG(o."TotalAmount") as avg_order_value
FROM "Events" e
JOIN "Seats" s ON e."Id" = s."EventId"
JOIN "Users" u ON s."UserId" = u."Id"
JOIN "Orders" o ON u."Id" = o."UserId"
WHERE s."Status" = 'Sold'
GROUP BY e."Id", e."Name"
ORDER BY total_revenue DESC;

-- User activity
SELECT 
    u."Email",
    COUNT(DISTINCT s."EventId") as events_participated,
    COUNT(CASE WHEN s."Status" = 'Reserved' THEN 1 END) as active_reservations,
    COUNT(CASE WHEN s."Status" = 'Sold' THEN 1 END) as purchased_seats,
    COUNT(DISTINCT o."Id") as total_orders,
    COALESCE(SUM(o."TotalAmount"), 0) as total_spent
FROM "Users" u
LEFT JOIN "Seats" s ON u."Id" = s."UserId"
LEFT JOIN "Orders" o ON u."Id" = o."UserId"
GROUP BY u."Id", u."Email"
ORDER BY total_spent DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Find seats reserved for more than 5 minutes (potential cleanup)
SELECT 
    s."Id",
    s."EventId",
    s."UserId",
    s."ReservedAt",
    NOW() - s."ReservedAt" as reservation_age
FROM "Seats" s
WHERE s."Status" = 'Reserved'
  AND s."ReservedAt" < NOW() - INTERVAL '5 minutes'
ORDER BY s."ReservedAt" ASC;

-- Count seats by status for all events
SELECT 
    e."Name",
    s."Status",
    COUNT(*) as count
FROM "Events" e
JOIN "Seats" s ON e."Id" = s."EventId"
GROUP BY e."Name", s."Status"
ORDER BY e."Name", s."Status";

-- Check for orphaned seats (seats with UserId but status is Available)
SELECT 
    s."Id",
    s."EventId",
    s."UserId",
    s."Status"
FROM "Seats" s
WHERE s."UserId" IS NOT NULL 
  AND s."Status" = 'Available';

-- Check for data integrity issues
SELECT 
    'Seats with invalid EventId' as issue,
    COUNT(*) as count
FROM "Seats" s
LEFT JOIN "Events" e ON s."EventId" = e."Id"
WHERE e."Id" IS NULL
UNION ALL
SELECT 
    'Seats with invalid UserId',
    COUNT(*)
FROM "Seats" s
LEFT JOIN "Users" u ON s."UserId" = u."Id"
WHERE s."UserId" IS NOT NULL AND u."Id" IS NULL
UNION ALL
SELECT 
    'Orders with invalid UserId',
    COUNT(*)
FROM "Orders" o
LEFT JOIN "Users" u ON o."UserId" = u."Id"
WHERE u."Id" IS NULL;

