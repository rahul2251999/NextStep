# NextStep Platform

AI-powered job search and resume optimization platform.

## Architecture

- **Frontend**: Next.js with NextAuth, Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL with pgvector (Supabase)
- **Storage**: Supabase Storage
- **AI Models**: E5-large/Instructor for embeddings, Llama-2/3 via Groq/HuggingFace for generation

## Project Structure

```
NextStep/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── README.md
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (via Supabase)
- Supabase account

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your environment variables
uvicorn main:app --reload
```

## Environment Variables

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=resumes
NEXTAUTH_SECRET=your-secret-here
GROQ_API_KEY=your-groq-api-key
HUGGINGFACE_API_KEY=your-hf-api-key
EMBEDDING_MODEL=e5-large-v2
LLM_PROVIDER=groq  # or huggingface
```

## Features

1. **Resume Upload & Parsing**: Extract structured data from PDF/DOCX resumes
2. **Job Matching**: Semantic similarity scoring between resume and job descriptions
3. **Resume Improvement**: AI-powered suggestions following STAR/RIC format
4. **LinkedIn Messages**: Generate personalized recruiter and referral messages
5. **Vector Search**: Fast semantic search using pgvector

## Deployment

- Frontend: Vercel
- Backend: Railway/Render
- Database: Supabase

## License

MIT


