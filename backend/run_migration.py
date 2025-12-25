#!/usr/bin/env python3
"""
Run migration to add application_status column to jobs table
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not set in environment or .env file")
    sys.exit(1)

# Read migration SQL
migration_file = Path(__file__).parent.parent / "migration_add_job_status.sql"
if not migration_file.exists():
    print(f"Error: Migration file not found at {migration_file}")
    sys.exit(1)

print(f"Running migration from {migration_file}...")
print(f"Database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        migration_sql = migration_file.read_text()
        # Execute each statement separately
        for statement in migration_sql.split(';'):
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    conn.execute(text(statement))
                    print(f"✓ Executed: {statement[:50]}...")
                except Exception as e:
                    # Ignore "already exists" errors
                    if "already exists" not in str(e).lower() and "duplicate" not in str(e).lower():
                        print(f"⚠ Warning: {e}")
        conn.commit()
    print("\n✅ Migration completed successfully!")
except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    sys.exit(1)

