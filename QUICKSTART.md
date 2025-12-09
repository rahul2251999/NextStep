# Quick Start Guide

Get NextStep running locally in minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.10+ installed
- PostgreSQL database (or Supabase account)

## Quick Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/nextstep
NEXTAUTH_SECRET=your-secret-here
GROQ_API_KEY=your-groq-key
EMBEDDING_MODEL=intfloat/e5-large-v2
LLM_PROVIDER=groq
```

**Frontend** (`frontend/.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Initialize Database

```bash
cd backend
source venv/bin/activate
python app/db_init.py
```

### 4. Start Services

**Option A: Use the startup script (recommended)**
```bash
./start.sh
```

**Option B: Manual start**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check if pgvector extension is enabled

### Module Not Found Errors
- Reinstall dependencies: `npm install` (frontend) or `pip install -r requirements.txt` (backend)
- Clear cache: `rm -rf node_modules/.cache` (frontend)

### Authentication Issues
- Ensure NEXTAUTH_SECRET matches in both frontend and backend
- Verify OAuth credentials are correct
- Check redirect URIs in OAuth provider settings

## Next Steps

1. Set up OAuth providers (Google/GitHub) - see SETUP.md
2. Get API keys for AI services (Groq recommended)
3. Upload a test resume
4. Try the job matching feature

For detailed setup, see [SETUP.md](./SETUP.md)

