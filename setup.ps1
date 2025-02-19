try {
    docker info | Out-Null
}
catch {
    Write-Error "Docker is not running. Please start Docker Desktop first."
    exit 1
}

Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "Starting Docker containers..." -ForegroundColor Green
docker-compose up -d

Write-Host "Checking container status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$trackerRunning = $null -ne (docker ps --filter "name=magnet-demon-torrust-tracker" --format "{{.Names}}")
$indexRunning = $null -ne (docker ps --filter "name=magnet-demon-torrust-index" --format "{{.Names}}")

$existingTmdbKey = ""
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    $match = [regex]::Match($envContent, 'TMDB_API_KEY=([^\r\n]+)')
    if ($match.Success) {
        $existingTmdbKey = $match.Groups[1].Value
        Write-Host "Preserving existing TMDB API key" -ForegroundColor Green
    }
}

if (-not $trackerRunning -or -not $indexRunning) {
    Write-Host "Warning: Some containers are not running properly. Using mock data mode." -ForegroundColor Red
    
    # Create .env.local to use mock data
    $tmdbKeyLine = if ($existingTmdbKey) { "TMDB_API_KEY=$existingTmdbKey" } else { "TMDB_API_KEY=your-tmdb-api-key" }
    @"
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_TORRUST_INDEX_URL=http://localhost:3001/api
NEXT_PUBLIC_TORRUST_TRACKER_URL=http://localhost:7070/api
TORRUST_TRACKER_USERNAME=admin
TORRUST_TRACKER_PASSWORD=password
JWT_SECRET=development-jwt-secret-key-change-in-production
$tmdbKeyLine
"@ | Out-File -FilePath ".env.local" -Encoding utf8
} else {
    # Create .env.local to use real API
    $tmdbKeyLine = if ($existingTmdbKey) { "TMDB_API_KEY=$existingTmdbKey" } else { "TMDB_API_KEY=your-tmdb-api-key" }
    @"
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_TORRUST_INDEX_URL=http://localhost:3001/api
NEXT_PUBLIC_TORRUST_TRACKER_URL=http://localhost:7070/api
TORRUST_TRACKER_USERNAME=admin
TORRUST_TRACKER_PASSWORD=password
JWT_SECRET=development-jwt-secret-key-change-in-production
$tmdbKeyLine
"@ | Out-File -FilePath ".env.local" -Encoding utf8
}

Write-Host "Installing dependencies..." -ForegroundColor Green
bun install

Write-Host "Starting Next.js application..." -ForegroundColor Green
bun run dev