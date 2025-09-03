# URLzy Development Startup Script
Write-Host "Starting URLzy Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Kill any existing processes on ports 3000 and 5000
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3000 2>$null
    npx kill-port 5000 2>$null
} catch {
    # Ignore errors if ports are not in use
}

# Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "client\node_modules\.vite") {
    Remove-Item -Recurse -Force "client\node_modules\.vite"
}
if (Test-Path "client\dist") {
    Remove-Item -Recurse -Force "client\dist"
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

# Start the development servers
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Client will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers concurrently
npm run dev