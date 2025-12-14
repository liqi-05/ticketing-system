# 🚀 FairTix Startup Guide

## Current Status ✅
- ✅ Database setup complete (PostgreSQL with sample data)
- ✅ 5 events, 5 users, 10,300 seats ready
- ✅ Helper scripts created

## Next Steps to Run the Application

### Step 1: Start Docker Services

```powershell
# Start Redis (required for queue system)
docker start fairtix-redis

# Verify both services are running
docker ps --filter "name=fairtix"
```

**Expected output:** Both `fairtix-postgres` and `fairtix-redis` should show as "Up"

---

### Step 2: Start the Backend API

Open a **new PowerShell terminal** and run:

```powershell
cd backend\FairTix.Api
dotnet run
```

**Expected output:**
- API will start on `http://localhost:5089` and `https://localhost:7025`
- You should see: "Application started and listening"

**Keep this terminal open!**

---

### Step 3: Start the Frontend

Open **another PowerShell terminal** and run:

```powershell
# From project root
npm install  # Only needed first time
npm run dev
```

**Expected output:**
- Frontend will start on `http://localhost:3000`
- Open browser to: http://localhost:3000

**Note:** If you want to use the ArchitectChat feature, create `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

---

### Step 4: Test the Application

1. **Open browser:** http://localhost:3000
2. **Browse Events:** Click on "Events" to see available concerts
3. **Join Queue:** Select an event and join the waiting room
4. **Reserve Seats:** Once active, select and reserve seats
5. **Purchase:** Complete the purchase flow

---

## Quick Commands Reference

### Check Services Status
```powershell
docker ps --filter "name=fairtix"
```

### View Database
```powershell
.\run-sql.ps1 'SELECT * FROM "Events";'
```

### Check API Health
```powershell
Invoke-WebRequest -Uri http://localhost:5089/health -UseBasicParsing
```

### View Events API
```powershell
Invoke-WebRequest -Uri http://localhost:5089/api/events -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## Troubleshooting

### Backend won't start?
- Check if PostgreSQL is running: `docker ps --filter "name=fairtix-postgres"`
- Check if Redis is running: `docker ps --filter "name=fairtix-redis"`
- Check connection strings in `Program.cs`

### Frontend won't connect?
- Make sure backend is running on port 5089
- Check browser console for errors
- Verify API calls in Network tab

### Database connection errors?
- Start PostgreSQL: `docker start fairtix-postgres`
- Verify connection: `.\run-sql.ps1 'SELECT 1;'`

### Redis connection errors?
- Start Redis: `docker start fairtix-redis`
- Test connection: `docker exec fairtix-redis redis-cli ping`

---

## Architecture Overview

- **Frontend:** React + TypeScript (port 3000)
- **Backend:** ASP.NET Core 9 (port 5089)
- **Database:** PostgreSQL (port 5432)
- **Cache/Queue:** Redis (port 6379)

All services must be running for the application to work properly!



