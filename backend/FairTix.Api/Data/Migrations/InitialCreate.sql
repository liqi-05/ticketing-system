-- FairTix Database Schema
-- Run this script in PostgreSQL to create the initial schema

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
    "Status" seat_status NOT NULL DEFAULT 'Available',
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




