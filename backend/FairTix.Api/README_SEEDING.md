# Seeding Sample Data

## Option 1: Using API Endpoint (Recommended)

1. Make sure your backend is running: `dotnet run`
2. Seed the data by calling:
   ```bash
   curl -X POST http://localhost:5089/api/seed/sample-data
   ```
   Or use PowerShell:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:5089/api/seed/sample-data -Method POST -UseBasicParsing
   ```

3. To clear all data and reseed:
   ```bash
   curl -X POST http://localhost:5089/api/seed/clear
   curl -X POST http://localhost:5089/api/seed/sample-data
   ```

## Option 2: Using SQL Script

1. Connect to PostgreSQL:
   ```bash
   docker exec -it fairtix-postgres psql -U postgres -d fairtix
   ```

2. Run the seed script:
   ```sql
   \i /path/to/Data/Migrations/SeedSampleData.sql
   ```

   Or using PowerShell:
   ```powershell
   Get-Content backend\FairTix.Api\Data\Migrations\SeedSampleData.sql | docker exec -i fairtix-postgres psql -U postgres -d fairtix
   ```

## Sample Data Created

- **3 Users**: user1@example.com, user2@example.com, user3@example.com
- **3 Events**: 
  - Summer Concert 2024 (600 seats, active)
  - Rock Festival 2024 (5000 seats, active)
  - Jazz Night (500 seats, not active)
- **600 Seats** for Summer Concert (Sections A, B, C, 10 rows each, 20 seats per row)
- **2 Sample Orders**

## Verify Data

After seeding, you can verify by:
- Checking events: `GET http://localhost:5089/api/events`
- Or querying the database directly




