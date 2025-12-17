# FairTix - High-Concurrency Ticketing System Architecture

A demonstration of a high-performance concert ticketing system designed to handle massive traffic spikes (e.g., ticket drops for major artists).

<div align="center">
  <h3>.NET 9 • React • PostgreSQL • Redis • Docker</h3>
</div>

## Project Structure

The project source code is located in the `ticketing-system/` subdirectory.

```
root/
├── README.md               # This file
└── ticketing-system/       # Project Source Code
    ├── backend/            # ASP.NET Core 9 Web API
    ├── ticketing-system/   # React + Vite Frontend (wait, actually the root context is mixed in the subfolder, see below)
    ├── docker-compose.yml  # Container orchestration
    └── ...
```

## 🚀 Quick Start (Docker)

The easiest way to run the entire system is using Docker Compose.

1. **Navigate to the project directory:**
   ```bash
   cd ticketing-system
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5089
   - **Database:** Postgres (5432)
   - **Redis:** Redis (6379)

## 🏗️ Architecture Highlights

### 1. Data Integrity (PostgreSQL)
- **Optimistic Concurrency:** Uses a `Version` column on seats to prevent double-booking.
- **Transactional Consistency:** Order creation and seat status updates happen atomically.

### 2. Traffic Control (Redis)
- **Waiting Room:** Users are placed in a Redis queue before accessing sale pages.
- **Active Session:** Only users with an active token can attempt reservations.

### 3. Frontend (React)
- **Real-time Status:** Polling for queue position and seat availability.
- **Interactive UI:** Visual seat map and queue simulation.

## 🛠️ Data Seeding

The database is automatically seeded with sample data (5 events, ~10k seats) when the container starts for the first time.

If you need to reset the data:
1. Stop containers: `docker-compose down`
2. Remove volumes: `docker volume rm ticketing-system_postgres_data`
3. Restart: `docker-compose up --build`
