@echo off
REM Executive Dashboard Startup Script for Windows

echo ================================================
echo   Executive Business Performance Dashboard
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo Python found
echo.

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
if not exist ".installed" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo. > .installed
    echo Dependencies installed
) else (
    echo Dependencies already installed
)

echo.
echo Starting Executive Dashboard...
echo.
echo ================================================
echo   Dashboard will be available at:
echo   http://localhost:5000
echo ================================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the Flask application
python app.py

pause
