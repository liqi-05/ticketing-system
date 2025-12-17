# Database Migrations

## Option 1: Using Entity Framework Core (Recommended)

If you have `dotnet-ef` tool installed, run:

```bash
cd backend/FairTix.Api
dotnet ef migrations add InitialCreate --output-dir Data/Migrations
dotnet ef database update
```

## Option 2: Manual SQL Script

If EF Core tools are not available, run the SQL script manually:

1. Connect to your PostgreSQL database:
```bash
docker exec -it fairtix-postgres psql -U postgres -d fairtix
```

2. Run the migration script:
```bash
\i /path/to/Data/Migrations/InitialCreate.sql
```

Or copy and paste the contents of `Data/Migrations/InitialCreate.sql` into the psql prompt.

## Option 3: Using psql from host

```bash
docker exec -i fairtix-postgres psql -U postgres -d fairtix < backend/FairTix.Api/Data/Migrations/InitialCreate.sql
```

## Verifying the Migration

After running the migration, verify the tables were created:

```sql
\dt
SELECT * FROM "Events";
SELECT * FROM "Seats";
SELECT * FROM "Users";
SELECT * FROM "Orders";
```





