@echo off
chcp 65001 > nul
echo ========================================
echo    AI Blog Platform - Backend Server
echo    Windows 10 Compatible Version
echo ========================================
echo.

:: Check if backend directory exists
if not exist "backend" (
    echo Error: Backend directory not found!
    echo Please make sure you're in the correct project folder.
    pause
    exit /b 1
)

:: Navigate to backend
cd backend

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment!
        echo Please check your Python installation.
        pause
        exit /b 1
    )
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

:: Check if .env file exists
if not exist ".env" (
    echo.
    echo Warning: .env file not found!
    echo Creating default .env file...
    copy .env.example .env > nul 2>&1
    if errorlevel 1 (
        echo Please create a .env file with your configuration.
    )
)

echo.
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

:: Start the server
python main.py

pause