# PowerShell script to run SQL queries against FairTix PostgreSQL database
# Usage: .\run-sql.ps1 "SELECT * FROM `"Events`";"

param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

# Check if container is running
$containerStatus = docker ps --filter "name=fairtix-postgres" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
    docker start fairtix-postgres
    Start-Sleep -Seconds 3
}

# Execute query using here-string to avoid quote issues
$Query | docker exec -i fairtix-postgres psql -U postgres -d fairtix



