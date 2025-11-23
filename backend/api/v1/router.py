"""
Main API router that includes all v1 endpoints
"""
from fastapi import APIRouter
from backend.api.v1.endpoints import auth, models, inference, export, optimization

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(inference.router, prefix="/inference", tags=["inference"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(optimization.router, prefix="/optimize", tags=["optimization"])

