import os
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer
import torch

class EmbeddingService:
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        pass

    
    def _load_model(self):
        """Load the embedding model. Uses E5-large by default."""
        model_name = os.getenv("EMBEDDING_MODEL", "intfloat/e5-large-v2")
        
        try:
            # Try to load model, use CPU if no GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = SentenceTransformer(model_name, device=device)
            print(f"Loaded embedding model {model_name} on {device}")
        except Exception as e:
            print(f"Failed to load {model_name}, falling back to smaller model")
            # Fallback to a smaller model
            try:
                self._model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
            except Exception as e2:
                raise RuntimeError(f"Failed to load any embedding model: {str(e2)}")
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts.
        Returns numpy array of shape (n_texts, embedding_dim)
        """
        if not self._model:
            self._load_model()
        
        if isinstance(texts, str):
            texts = [texts]
        
        # E5 models require specific prefixes for different tasks
        # For general text, we can use "passage: " prefix
        if "e5" in str(self._model).lower() or "e5" in os.getenv("EMBEDDING_MODEL", "").lower():
            # E5 models work better with prefixes
            texts = [f"passage: {text}" for text in texts]
        
        embeddings = self._model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,  # Normalize for cosine similarity
            show_progress_bar=False,
        )
        
        return embeddings
    
    def encode_single(self, text: str) -> List[float]:
        """Generate embedding for a single text. Returns list of floats."""
        embeddings = self.encode([text])
        return embeddings[0].tolist()
    
    def cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))


# Singleton instance
embedding_service = EmbeddingService()

