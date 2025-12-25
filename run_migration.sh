#!/bin/bash
# Run the migration to add missing columns to jobs table

echo "Running migration to add application_status column..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set. Checking backend/.env..."
    if [ -f "backend/.env" ]; then
        export $(grep -v '^#' backend/.env | xargs)
    else
        echo "Error: DATABASE_URL not found. Please set it in backend/.env"
        exit 1
    fi
fi

# Run the migration
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f migration_add_job_status.sql
    echo "Migration completed!"
else
    echo "psql not found. Please run the migration manually:"
    echo "psql \$DATABASE_URL -f migration_add_job_status.sql"
    echo ""
    echo "Or if using Python:"
    echo "cd backend && source venv/bin/activate && python -c \"from app.database import engine; from sqlalchemy import text; with engine.connect() as conn: conn.execute(text(open('../migration_add_job_status.sql').read())); conn.commit()\""
fi
