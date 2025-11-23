"""
Model and version schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class ModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: str  # 'classification' or 'segmentation'

class ModelResponse(BaseModel):
    id: str  # ObjectId as string
    name: str
    description: Optional[str]
    model_type: str
    owner_id: str  # ObjectId as string
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ModelVersionCreate(BaseModel):
    architecture: Dict[str, Any]  # Layer configuration
    custom_loss: Optional[str] = None
    input_shape: List[int]
    output_shape: Optional[List[int]] = None
    notes: Optional[str] = None
    class_labels: Optional[List[str]] = None
    segmentation_labels: Optional[List[str]] = None
    layer_auto_config: bool = True

class ModelVersionResponse(BaseModel):
    id: str  # ObjectId as string
    model_id: str  # ObjectId as string
    version_number: int
    architecture: Dict[str, Any]
    custom_loss: Optional[str]
    input_shape: List[int]
    output_shape: Optional[List[int]]
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

