#!/bin/bash

# NextStep Platform - Local Development Startup Script

echo "🚀 Starting NextStep Platform..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the NextStep root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi

# Check for .env files
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found. Please create it from .env.example"
    echo "   You can still proceed, but the backend may not work correctly."
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Warning: frontend/.env.local not found. Please create it from .env.example"
    echo "   You can still proceed, but the frontend may not work correctly."
fi

# Start backend
echo ""
echo "🔧 Starting backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📦 Installing Python dependencies..."
    if ! pip install -r requirements.txt; then
        echo "❌ Failed to install backend dependencies. Check your internet connection and try again."
        exit 1
    fi
    touch venv/.installed
fi

# Ensure uvicorn is available before trying to start the server
if ! command_exists uvicorn; then
    echo "❌ uvicorn not found in the virtual environment. Try re-running installation: source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Start backend in background
echo "🚀 Starting FastAPI backend on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting Next.js frontend on http://localhost:3000"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

cd ..

echo ""
echo "✅ NextStep Platform is starting!"
echo ""
echo "📊 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or run: ./stop.sh"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID $FRONTEND_PID" > .pids

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .pids; exit" INT TERM

echo "Press Ctrl+C to stop all services"
wait
