"""
Database initialization script.
Run this to create tables and enable pgvector extension.
"""
from app.database import engine, Base
from sqlalchemy import text
import app.models  # Import models to register them with Base


def init_db():
    """Initialize database with tables and pgvector extension."""
    # Enable pgvector extension
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
            print("pgvector extension enabled")
        except Exception as e:
            print(f"Note: pgvector extension may already exist or require admin privileges: {str(e)}")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    # Create vector indexes
    with engine.connect() as conn:
        try:
            # Index for resume embeddings
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS resume_embeddings_vector_idx 
                ON resume_embeddings 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """))
            
            # Index for job embeddings
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS job_embeddings_vector_idx 
                ON job_embeddings 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """))
            
            # Index for bullet embeddings
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS bullets_vector_idx 
                ON bullets 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """))
            
            conn.commit()
            print("Vector indexes created")
        except Exception as e:
            print(f"Note: Index creation may have failed (this is okay if they already exist): {str(e)}")

if __name__ == "__main__":
    init_db()

