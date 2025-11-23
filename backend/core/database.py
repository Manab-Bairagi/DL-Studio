"""
MongoDB connection and database initialization
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.core.config import settings
from backend.db.models import User, Model, ModelVersion

class MongoDB:
    client: AsyncIOMotorClient = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    mongodb.client = AsyncIOMotorClient(settings.DATABASE_URL)
    
    # Initialize Beanie with the database and document models
    await init_beanie(
        database=mongodb.client[settings.DATABASE_NAME],
        document_models=[User, Model, ModelVersion]
    )
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        print("Disconnected from MongoDB")
