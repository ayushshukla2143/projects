@echo off
chcp 65001 > nul
echo ========================================
echo    AI Blog Platform - Frontend Server
echo    Windows 10 Compatible Version
echo ========================================
echo.

:: Check if frontend directory exists
if not exist "frontend" (
    echo Error: Frontend directory not found!
    echo Please make sure you're in the correct project folder.
    pause
    exit /b 1
)

:: Navigate to frontend
cd frontend

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting Next.js development server...
echo Frontend will be available at: http://localhost:3000
echo.

:: Start the development server
npm run dev

pause