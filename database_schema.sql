-- NextStep Database Schema
-- Run this after enabling pgvector extension

-- Enable pgvector extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    auth_provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    resume_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    parsed_json JSONB,
    text_content TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Bullets table (for resume bullet points with embeddings)
CREATE TABLE IF NOT EXISTS bullets (
    bullet_id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    embedding vector(768)
);

CREATE INDEX IF NOT EXISTS idx_bullets_resume_id ON bullets(resume_id);
CREATE INDEX IF NOT EXISTS idx_bullets_vector ON bullets USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Resume embeddings table
CREATE TABLE IF NOT EXISTS resume_embeddings (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL,
    embedding vector(768) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_embeddings_resume_id ON resume_embeddings(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_embeddings_vector ON resume_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    job_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    description_text TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- Job embeddings table
CREATE TABLE IF NOT EXISTS job_embeddings (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL,
    embedding vector(768) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_embeddings_job_id ON job_embeddings(job_id);
CREATE INDEX IF NOT EXISTS idx_job_embeddings_vector ON job_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Recommendations table (stores generated improvements and messages)
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    improved_resume_json JSONB,
    recruiter_message_text TEXT,
    referral_message_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_job_id ON recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_resume_id ON recommendations(resume_id);

-- Row Level Security (if using Supabase)
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your auth setup)
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = auth_provider_id);

CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_provider_id = auth.uid()::text));

CREATE POLICY "Users can view own jobs" ON jobs
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_provider_id = auth.uid()::text));

-- Note: Adjust RLS policies based on your authentication setup
-- If using NextAuth with JWT, you may need different policies

