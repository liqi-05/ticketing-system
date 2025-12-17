-- ============================================
-- FairTix Database Setup Script
-- Complete schema and sample data
-- ============================================

-- Drop existing objects if they exist (for clean setup)
DROP TABLE IF EXISTS "Orders" CASCADE;
DROP TABLE IF EXISTS "Seats" CASCADE;
DROP TABLE IF EXISTS "Events" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TYPE IF EXISTS seat_status CASCADE;
DROP FUNCTION IF EXISTS update_seat_version() CASCADE;

-- ============================================
-- CREATE SCHEMA
-- ============================================

-- Create enum type for seat status
CREATE TYPE seat_status AS ENUM ('Available', 'Reserved', 'Sold');

-- Events table
CREATE TABLE "Events" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(255) NOT NULL,
    "TotalSeats" INTEGER NOT NULL,
    "SaleStartTime" TIMESTAMPTZ NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX "IX_Events_IsActive" ON "Events" ("IsActive");

-- Users table
CREATE TABLE "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_Users_Email" ON "Users" ("Email");

-- Seats table (Critical for optimistic concurrency)
CREATE TABLE "Seats" (
    "Id" BIGSERIAL PRIMARY KEY,
    "EventId" UUID NOT NULL,
    "Section" VARCHAR(50) NOT NULL,
    "RowNumber" VARCHAR(10) NOT NULL,
    "SeatNumber" VARCHAR(10) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK ("Status" IN ('Available', 'Reserved', 'Sold')),
    "UserId" UUID,
    "ReservedAt" TIMESTAMPTZ,
    "Version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FK_Seats_Events_EventId" FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Seats_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE SET NULL
);

CREATE INDEX "IX_Seats_EventId_Status" ON "Seats" ("EventId", "Status");
CREATE INDEX "IX_Seats_UserId" ON "Seats" ("UserId");

-- Create trigger to update version on UPDATE (for optimistic concurrency)
CREATE OR REPLACE FUNCTION update_seat_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW."Version" = OLD."Version" + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seat_version_trigger
    BEFORE UPDATE ON "Seats"
    FOR EACH ROW
    EXECUTE FUNCTION update_seat_version();

-- Orders table
CREATE TABLE "Orders" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID NOT NULL,
    "TotalAmount" DECIMAL(18,2) NOT NULL,
    "PaymentStatus" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Orders_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX "IX_Orders_UserId" ON "Orders" ("UserId");

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample users
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "CreatedAt") VALUES
('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'hashed_password_1', NOW()),
('22222222-2222-2222-2222-222222222222', 'user2@example.com', 'hashed_password_2', NOW()),
('33333333-3333-3333-3333-333333333333', 'user3@example.com', 'hashed_password_3', NOW()),
('44444444-4444-4444-4444-444444444444', 'user4@example.com', 'hashed_password_4', NOW()),
('55555555-5555-5555-5555-555555555555', 'user5@example.com', 'hashed_password_5', NOW());

-- Insert sample events
INSERT INTO "Events" ("Id", "Name", "TotalSeats", "SaleStartTime", "IsActive") VALUES
('00000000-0000-0000-0000-000000000001', 'Summer Concert 2024', 1000, NOW() - INTERVAL '1 day', true),
('00000000-0000-0000-0000-000000000002', 'Rock Festival 2024', 5000, NOW() - INTERVAL '2 days', true),
('00000000-0000-0000-0000-000000000003', 'Jazz Night', 500, NOW() + INTERVAL '1 day', false),
('00000000-0000-0000-0000-000000000004', 'Electronic Music Festival', 3000, NOW() - INTERVAL '3 hours', true),
('00000000-0000-0000-0000-000000000005', 'Classical Symphony', 800, NOW() + INTERVAL '2 days', true);

-- Insert seats for Summer Concert (Event 1) - 1000 seats
-- Section A: Rows 1-10, Seats 1-20 (200 seats)
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

-- Section B: Rows 1-10, Seats 1-20 (200 seats)
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

-- Section C: Rows 1-10, Seats 1-20 (200 seats)
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

-- Section D: Rows 1-10, Seats 1-20 (200 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000001';
    section_name VARCHAR := 'D';
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

-- Section E: Rows 1-10, Seats 1-20 (200 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000001';
    section_name VARCHAR := 'E';
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

-- Insert seats for Rock Festival (Event 2) - 5000 seats
-- Section A: Rows 1-50, Seats 1-20 (1000 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000002';
    section_name VARCHAR := 'A';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..50 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section B: Rows 1-50, Seats 1-20 (1000 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000002';
    section_name VARCHAR := 'B';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..50 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section C: Rows 1-50, Seats 1-20 (1000 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000002';
    section_name VARCHAR := 'C';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..50 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section D: Rows 1-50, Seats 1-20 (1000 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000002';
    section_name VARCHAR := 'D';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..50 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section E: Rows 1-50, Seats 1-20 (1000 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000002';
    section_name VARCHAR := 'E';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..50 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Insert seats for Jazz Night (Event 3) - 500 seats
-- Section A: Rows 1-10, Seats 1-10 (100 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000003';
    section_name VARCHAR := 'A';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section B: Rows 1-10, Seats 1-10 (100 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000003';
    section_name VARCHAR := 'B';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section C: Rows 1-10, Seats 1-10 (100 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000003';
    section_name VARCHAR := 'C';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section D: Rows 1-10, Seats 1-10 (100 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000003';
    section_name VARCHAR := 'D';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section E: Rows 1-10, Seats 1-10 (100 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000003';
    section_name VARCHAR := 'E';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Insert seats for Electronic Music Festival (Event 4) - 3000 seats
-- Section A: Rows 1-30, Seats 1-20 (600 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000004';
    section_name VARCHAR := 'A';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section B: Rows 1-30, Seats 1-20 (600 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000004';
    section_name VARCHAR := 'B';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section C: Rows 1-30, Seats 1-20 (600 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000004';
    section_name VARCHAR := 'C';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section D: Rows 1-30, Seats 1-20 (600 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000004';
    section_name VARCHAR := 'D';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section E: Rows 1-30, Seats 1-20 (600 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000004';
    section_name VARCHAR := 'E';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..30 LOOP
        FOR seat_num IN 1..20 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Insert seats for Classical Symphony (Event 5) - 800 seats
-- Section A: Rows 1-10, Seats 1-16 (160 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000005';
    section_name VARCHAR := 'A';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..16 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section B: Rows 1-10, Seats 1-16 (160 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000005';
    section_name VARCHAR := 'B';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..16 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section C: Rows 1-10, Seats 1-16 (160 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000005';
    section_name VARCHAR := 'C';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..16 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section D: Rows 1-10, Seats 1-16 (160 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000005';
    section_name VARCHAR := 'D';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..16 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Section E: Rows 1-10, Seats 1-16 (160 seats)
DO $$
DECLARE
    event_id UUID := '00000000-0000-0000-0000-000000000005';
    section_name VARCHAR := 'E';
    row_num INT;
    seat_num INT;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_num IN 1..16 LOOP
            INSERT INTO "Seats" ("EventId", "Section", "RowNumber", "SeatNumber", "Status", "Version")
            VALUES (event_id, section_name, row_num::VARCHAR, seat_num::VARCHAR, 'Available', 0);
        END LOOP;
    END LOOP;
END $$;

-- Insert some sample orders
INSERT INTO "Orders" ("Id", "UserId", "TotalAmount", "PaymentStatus", "CreatedAt") VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 100.00, 'Completed', NOW() - INTERVAL '1 hour'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 150.00, 'Pending', NOW() - INTERVAL '30 minutes'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 200.00, 'Completed', NOW() - INTERVAL '2 hours');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data counts
SELECT 'Events' as table_name, COUNT(*) as count FROM "Events"
UNION ALL
SELECT 'Users', COUNT(*) FROM "Users"
UNION ALL
SELECT 'Seats', COUNT(*) FROM "Seats"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Orders";

-- Verify seats per event
SELECT 
    e."Name" as event_name,
    COUNT(s."Id") as total_seats,
    COUNT(CASE WHEN s."Status" = 'Available' THEN 1 END) as available_seats,
    COUNT(CASE WHEN s."Status" = 'Reserved' THEN 1 END) as reserved_seats,
    COUNT(CASE WHEN s."Status" = 'Sold' THEN 1 END) as sold_seats
FROM "Events" e
LEFT JOIN "Seats" s ON e."Id" = s."EventId"
GROUP BY e."Id", e."Name"
ORDER BY e."Name";

