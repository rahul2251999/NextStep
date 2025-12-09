-- Migration: Add application_status and resume_id to jobs table
-- Run this to update existing database schema

-- Add application_status column with default value
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS application_status VARCHAR(50) DEFAULT 'applied';

-- Add resume_id column (nullable, for linking resume to job)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS resume_id INTEGER REFERENCES resumes(resume_id) ON DELETE SET NULL;

-- Add updated_at column for tracking updates
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create index on application_status for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_application_status ON jobs(application_status);

-- Create index on resume_id
CREATE INDEX IF NOT EXISTS idx_jobs_resume_id ON jobs(resume_id);

-- Add comment
COMMENT ON COLUMN jobs.application_status IS 'Job application status: applied, interviewing, offer_received, rejected';

