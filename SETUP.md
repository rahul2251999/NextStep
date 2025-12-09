# NextStep Platform - Setup Guide

Complete setup instructions for the NextStep platform.

## Prerequisites

- Node.js 18+ installed
- Python 3.10+ installed
- PostgreSQL database (via Supabase recommended)
- Supabase account (for storage and database)
- API keys for:
  - Groq (for LLM) OR OpenAI OR HuggingFace
  - Google OAuth (for authentication)
  - GitHub OAuth (optional, for authentication)

## Step 1: Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to Settings > Database and copy your connection string
3. Enable the `pgvector` extension:
   - Go to SQL Editor in Supabase
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`
4. Run the schema migration:
   - Copy the contents of `database_schema.sql`
   - Paste and run in Supabase SQL Editor

## Step 2: Storage Setup

1. In Supabase, go to Storage
2. Create a new bucket named `resumes`
3. Set it to private (not public)
4. Copy your Supabase URL and service role key from Settings > API

## Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (from Supabase)
# - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - GROQ_API_KEY or other LLM provider keys
# - EMBEDDING_MODEL (default: intfloat/e5-large-v2)

# Initialize database
python app/db_init.py

# Run the server
uvicorn main:app --reload
```

Backend will run at `http://localhost:8000`

## Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with:
# - NEXTAUTH_URL=http://localhost:3000
# - NEXTAUTH_SECRET (same as backend)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# - GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (optional)
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## Step 5: OAuth Setup

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### GitHub OAuth (Optional)

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

## Step 6: AI/ML API Keys

### Groq (Recommended - Free)

1. Sign up at https://groq.com
2. Get your API key from the dashboard
3. Add to backend `.env`: `GROQ_API_KEY=your-key`

### OpenAI (Alternative)

1. Sign up at https://platform.openai.com
2. Get your API key
3. Add to backend `.env`: `OPENAI_API_KEY=your-key` and `LLM_PROVIDER=openai`

### HuggingFace (Alternative)

1. Sign up at https://huggingface.co
2. Create an access token
3. Add to backend `.env`: `HUGGINGFACE_API_KEY=your-key` and `LLM_PROVIDER=huggingface`

## Step 7: Test the Application

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:3000`
4. Sign in with Google or GitHub
5. Upload a resume (PDF or DOCX)
6. Submit a job description
7. View match score and improvements

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if pgvector extension is enabled
- Ensure database is accessible from your IP (Supabase allows all by default)

### Authentication Issues

- Ensure NEXTAUTH_SECRET matches in both frontend and backend
- Verify OAuth redirect URIs are correct
- Check that OAuth credentials are valid

### Embedding Model Issues

- First run will download the model (may take time)
- If memory is limited, use a smaller model: `EMBEDDING_MODEL=all-MiniLM-L6-v2`
- For CPU-only systems, expect slower performance

### LLM Generation Issues

- Verify API keys are correct
- Check rate limits on free tiers
- Try a different provider if one fails

### File Upload Issues

- Verify Supabase storage bucket exists and is accessible
- Check file size limits (default: 5MB)
- Ensure service role key has storage permissions

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Render)

1. Push code to GitHub
2. Create new service in Railway/Render
3. Connect repository
4. Set environment variables
5. Deploy

### Database (Supabase)

- Already hosted, just update connection strings in production

## Production Checklist

- [ ] Update NEXTAUTH_URL to production domain
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Set up CORS properly for production
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Review security settings
- [ ] Test all features end-to-end

## Support

For issues or questions, refer to the main README.md or check the code comments.

