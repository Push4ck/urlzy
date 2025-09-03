@echo off
echo Starting URLzy Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js version:
node --version

REM Kill any existing processes on ports 3000 and 5000
echo Cleaning up existing processes...
npx kill-port 3000 >nul 2>&1
npx kill-port 5000 >nul 2>&1

REM Clear Vite cache
echo Clearing Vite cache...
if exist "client\node_modules\.vite" rmdir /s /q "client\node_modules\.vite"
if exist "client\dist" rmdir /s /q "client\dist"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    npm install
    cd ..
)

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    npm install
    cd ..
)

REM Start the development servers
echo.
echo ========================================
echo  URLzy Development Environment Ready!
echo ========================================
echo.
echo Please open TWO terminal windows:
echo.
echo Terminal 1 - Backend Server:
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 - Frontend Client:
echo   cd client  
echo   npm run dev
echo.
echo Then visit: http://localhost:3000
echo ========================================
echo.
pause