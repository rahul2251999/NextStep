# Running NextStep Locally

## Quick Start

### Option 1: Use the Startup Script (Easiest)

```bash
./start.sh
```

This will:
- Check prerequisites
- Set up virtual environments if needed
- Install dependencies
- Start both backend and frontend
- Show you the URLs and log locations

To stop:
```bash
./stop.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Setup

Before running, make sure you have:

1. **Backend `.env` file** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/nextstep
NEXTAUTH_SECRET=your-secret-here
GROQ_API_KEY=your-groq-key
EMBEDDING_MODEL=intfloat/e5-large-v2
LLM_PROVIDER=groq
```

2. **Frontend `.env.local` file** (`frontend/.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Setup

If using a local PostgreSQL database:

```bash
# Create database
createdb nextstep

# Enable pgvector extension
psql nextstep -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run schema
psql nextstep < database_schema.sql

# Or use the Python script
cd backend
source venv/bin/activate
python app/db_init.py
```

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Module Not Found

**Frontend:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running: `pg_isready`
- Check if database exists: `psql -l | grep nextstep`

### Authentication Issues

- Ensure `NEXTAUTH_SECRET` matches in both frontend and backend
- Verify OAuth credentials are correct
- Check browser console for errors

### Embedding Model Download

On first run, the embedding model will be downloaded (can take several minutes and ~1GB). This is normal and only happens once.

## Development Tips

1. **Backend logs**: Check terminal or `backend.log` file
2. **Frontend logs**: Check terminal or `frontend.log` file
3. **API testing**: Use http://localhost:8000/docs for interactive API testing
4. **Hot reload**: Both frontend and backend support hot reload on file changes

## Next Steps

1. Set up OAuth providers (see SETUP.md)
2. Get API keys for AI services
3. Test the application with a sample resume

For detailed setup instructions, see [SETUP.md](./SETUP.md)

