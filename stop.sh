#!/bin/bash

# Stop NextStep Platform services

if [ -f ".pids" ]; then
    PIDS=$(cat .pids)
    echo "🛑 Stopping NextStep services (PIDs: $PIDS)..."
    kill $PIDS 2>/dev/null
    rm -f .pids
    echo "✅ Services stopped"
else
    echo "⚠️  No running services found (no .pids file)"
    # Try to kill by port
    echo "🔍 Attempting to kill processes on ports 3000 and 8000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✅ Done"
fi

