# Backend Restart Instructions

The CORS configuration has been updated. Please restart the backend:

## Option 1: If using start.sh
1. Stop the current backend: `./stop.sh` or `kill $(lsof -ti:8000)`
2. Start again: `./start.sh`

## Option 2: Manual restart
1. Stop the backend (Ctrl+C in the terminal running it, or):
   ```bash
   kill $(lsof -ti:8000)
   ```

2. Start the backend:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Verify it's working:
1. Check http://localhost:8000/health in your browser
2. Should see: {"status":"healthy"}
3. Try adding a job again

The CORS configuration now allows all origins in development mode.
