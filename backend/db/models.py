"""
MongoDB document models using Beanie ODM
"""
from beanie import Document
from pydantic import Field, EmailStr, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from bson import ObjectId

class User(Document):
    """User model"""
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        protected_namespaces=()
    )
    
    class Settings:
        name = "users"
        indexes = ["email"]

class Model(Document):
    """Model document"""
    name: str
    description: Optional[str] = None
    model_type: str  # 'classification' or 'segmentation'
    owner_id: ObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        protected_namespaces=()  # Allow model_type field
    )
    
    class Settings:
        name = "models"
        indexes = ["owner_id"]

class ModelVersion(Document):
    """Model version document"""
    model_id: ObjectId
    version_number: int
    architecture: Dict[str, Any]  # Store layer configuration
    custom_loss: Optional[str] = None  # Store custom loss function code
    input_shape: List[int]  # e.g., [1, 3, 224, 224]
    output_shape: Optional[List[int]] = None
    notes: Optional[str] = None
    class_labels: Optional[List[str]] = None  # e.g., ['cat', 'dog', 'bird'] for classification
    segmentation_labels: Optional[List[str]] = None  # e.g., ['person', 'car', 'building'] for segmentation
    layer_auto_config: bool = True  # Auto-adjust layer configs when connecting
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        protected_namespaces=()  # Allow model_id field
    )
    
    class Settings:
        name = "model_versions"
        indexes = ["model_id"]
