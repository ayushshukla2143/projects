@echo off
echo Starting AI Blog Platform Backend...
echo.

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install requirements
echo Installing dependencies...
pip install -r requirements.txt

:: Start the server
echo Starting FastAPI server...
python main.py

pause