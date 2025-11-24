#!/bin/bash

# Executive Dashboard Startup Script

echo "================================================"
echo "  Executive Business Performance Dashboard"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
if [ ! -f ".installed" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
    touch .installed
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting Executive Dashboard..."
echo ""
echo "================================================"
echo "  Dashboard will be available at:"
echo "  👉 http://localhost:5000"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
python app.py
