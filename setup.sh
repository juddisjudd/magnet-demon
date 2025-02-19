#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "\033[0;31mError: Docker is not running. Please start Docker first.\033[0m"
    exit 1
fi

echo -e "\033[0;33mStopping existing containers...\033[0m"
docker-compose down

echo -e "\033[0;32mStarting Docker containers...\033[0m"
docker-compose up -d

echo -e "\033[0;33mChecking container status...\033[0m"
sleep 5

TRACKER_RUNNING=$(docker ps --filter "name=magnet-demon-torrust-tracker" --format "{{.Names}}" | grep -c .)
INDEX_RUNNING=$(docker ps --filter "name=magnet-demon-torrust-index" --format "{{.Names}}" | grep -c .)

EXISTING_TMDB_KEY=""
if [ -f .env.local ]; then
    EXISTING_TMDB_KEY=$(grep "TMDB_API_KEY=" .env.local | sed 's/TMDB_API_KEY=//')
    if [ ! -z "$EXISTING_TMDB_KEY" ]; then
        echo -e "\033[0;32mPreserving existing TMDB API key\033[0m"
    fi
fi

if [ "$TRACKER_RUNNING" -eq 0 ] || [ "$INDEX_RUNNING" -eq 0 ]; then
    echo -e "\033[0;31mWarning: Some containers are not running properly. Using mock data mode.\033[0m"
    
    # Create .env.local to use mock data
    if [ ! -z "$EXISTING_TMDB_KEY" ]; then
        TMDB_KEY_LINE="TMDB_API_KEY=$EXISTING_TMDB_KEY"
    else
        TMDB_KEY_LINE="TMDB_API_KEY=your-tmdb-api-key"
    fi
    
    cat > .env.local << EOF
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_TORRUST_INDEX_URL=http://localhost:3001/api
NEXT_PUBLIC_TORRUST_TRACKER_URL=http://localhost:7070/api
TORRUST_TRACKER_USERNAME=admin
TORRUST_TRACKER_PASSWORD=password
JWT_SECRET=development-jwt-secret-key-change-in-production
$TMDB_KEY_LINE
EOF
else
    # Create .env.local to use real API
    if [ ! -z "$EXISTING_TMDB_KEY" ]; then
        TMDB_KEY_LINE="TMDB_API_KEY=$EXISTING_TMDB_KEY"
    else
        TMDB_KEY_LINE="TMDB_API_KEY=your-tmdb-api-key"
    fi
    
    cat > .env.local << EOF
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_TORRUST_INDEX_URL=http://localhost:3001/api
NEXT_PUBLIC_TORRUST_TRACKER_URL=http://localhost:7070/api
TORRUST_TRACKER_USERNAME=admin
TORRUST_TRACKER_PASSWORD=password
JWT_SECRET=development-jwt-secret-key-change-in-production
$TMDB_KEY_LINE
EOF
fi

echo -e "\033[0;32mInstalling dependencies...\033[0m"
bun install

echo -e "\033[0;32mStarting Next.js application...\033[0m"
bun run dev