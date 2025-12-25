-- Migration: Add application_status and resume_id columns to jobs table
-- Run this migration to update your database schema

-- Add application_status column if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS application_status VARCHAR(50) DEFAULT 'applied';

-- Add resume_id column if it doesn't exist (for linking resumes to jobs)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES resumes(resume_id) ON DELETE SET NULL;

-- Add updated_at column if it doesn't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing jobs to have 'applied' status if NULL
UPDATE jobs 
SET application_status = 'applied' 
WHERE application_status IS NULL;

-- Create index on application_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_application_status ON jobs(application_status);

-- Create index on resume_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_resume_id ON jobs(resume_id);

