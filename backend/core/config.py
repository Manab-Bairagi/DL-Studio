"""
Application configuration settings
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

# Get the backend directory (where .env file is located)
BACKEND_DIR = Path(__file__).parent.parent
ENV_FILE = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    # MongoDB
    DATABASE_URL: str = "mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority"
    DATABASE_NAME: str = "dl_model_builder"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Application
    PROJECT_NAME: str = "DL Model Builder & Visualizer"
    API_V1_STR: str = "/api/v1"

    # External Services
    GEMINI_API_KEY: str | None = None
    
    class Config:
        env_file = str(ENV_FILE) if ENV_FILE.exists() else ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
