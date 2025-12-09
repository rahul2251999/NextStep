import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StorageService:
    _instance = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StorageService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._init_client()
    
    def _init_client(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Warning: Supabase credentials not set. File storage will not work.")
            return
        
        try:
            self._client = create_client(supabase_url, supabase_key)
            print("Supabase client initialized")
        except Exception as e:
            print(f"Failed to initialize Supabase client: {str(e)}")
    
    def upload_file(self, file_content: bytes, file_path: str, bucket: str = "resumes") -> str:
        """
        Upload a file to Supabase Storage.
        Returns the public URL or path to the file.
        """
        if not self._client:
            raise RuntimeError("Supabase client not initialized")
        
        try:
            # Upload file
            response = self._client.storage.from_(bucket).upload(
                file_path,
                file_content,
                file_options={"content-type": "application/pdf" if file_path.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
            )
            
            if response:
                # Get public URL
                public_url = self._client.storage.from_(bucket).get_public_url(file_path)
                return public_url
            else:
                raise RuntimeError("Failed to upload file")
        except Exception as e:
            raise RuntimeError(f"Storage upload error: {str(e)}")
    
    def get_file_url(self, file_path: str, bucket: str = "resumes") -> str:
        """Get a signed URL for a private file."""
        if not self._client:
            raise RuntimeError("Supabase client not initialized")
        
        try:
            # For private files, create a signed URL
            response = self._client.storage.from_(bucket).create_signed_url(
                file_path,
                3600  # 1 hour expiry
            )
            return response.get("signedURL", "")
        except Exception as e:
            raise RuntimeError(f"Failed to get file URL: {str(e)}")
    
    def delete_file(self, file_path: str, bucket: str = "resumes") -> bool:
        """Delete a file from storage."""
        if not self._client:
            return False
        
        try:
            self._client.storage.from_(bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"Failed to delete file: {str(e)}")
            return False


# Singleton instance
storage_service = StorageService()

