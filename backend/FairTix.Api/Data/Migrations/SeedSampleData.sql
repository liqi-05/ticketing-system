-- Seed Sample Data for FairTix
-- Run this after InitialCreate.sql

-- Insert sample users
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "CreatedAt") VALUES
('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'hashed_password_1', NOW()),
('22222222-2222-2222-2222-222222222222', 'user2@example.com', 'hashed_password_2', NOW()),
('33333333-3333-3333-3333-333333333333', 'user3@example.com', 'hashed_password_3', NOW());

-- Insert sample events
INSERT INTO "Events" ("Id", "Name", "TotalSeats", "SaleStartTime", "IsActive") VALUES
('00000000-0000-0000-0000-000000000001', 'Summer Concert 2024', 1000, NOW() - INTERVAL '1 day', true),
('00000000-0000-0000-0000-000000000002', 'Rock Festival 2024', 5000, NOW() - INTERVAL '2 days', true),
('00000000-0000-0000-0000-000000000003', 'Jazz Night', 500, NOW() + INTERVAL '1 day', false);

-- Insert sample seats for Summer Concert (Event 1)
-- Section A: Rows 1-10, Seats 1-20
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000001';
    section_name VARCHAR := 'A';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section B: Rows 1-10, Seats 1-20
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000001';
    section_name VARCHAR := 'B';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section C: Rows 1-10, Seats 1-20
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000001';
    section_name VARCHAR := 'C';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Insert some sample orders
INSERT INTO "Orders" ("Id", "UserId", "TotalAmount", "PaymentStatus", "CreatedAt") VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 100.00, 'Completed', NOW() - INTERVAL '1 hour'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 150.00, 'Pending', NOW() - INTERVAL '30 minutes');





