"""
Inference schemas
"""
from pydantic import BaseModel
from typing import List, Any, Dict, Optional
from datetime import datetime

class InferenceRequest(BaseModel):
    version_id: str  # ObjectId as string
    input_data: List[Any]  # Can be image array or text data
    input_shape: Optional[List[int]] = None  # Optional reshape information
    class_labels: Optional[List[str]] = None  # Class labels for classification
    segmentation_labels: Optional[List[str]] = None  # Labels for segmentation masks

class LayerOutput(BaseModel):
    layer_name: str
    layer_type: str
    output_shape: List[int]
    activation_stats: Dict[str, float]  # min, max, mean, std, median
    output_data: List[Any]  # Flattened output for visualization (limited size)

class InferenceResponse(BaseModel):
    version_id: str  # ObjectId as string
    output: List[Any]  # Final model output
    output_shape: List[int]  # Shape of final output
    predicted_class: Optional[int] = None  # For classification models
    predicted_class_label: Optional[str] = None  # Human-readable class name
    confidence: Optional[float] = None  # For classification models
    top_k_predictions: Optional[List[Dict[str, Any]]] = None  # Top-k classes with confidence
    layer_outputs: List[LayerOutput]  # Layer-wise outputs for visualization
    processing_time: float  # Time taken for inference
    
    class Config:
        from_attributes = True

class ModelConfig(BaseModel):
    """Model configuration and metadata"""
    architecture: Dict[str, Any]
    input_shape: List[int]
    model_summary: str
    total_parameters: int
    trainable_parameters: int

class InferenceHistoryItem(BaseModel):
    """Item in inference history"""
    id: str
    model_id: str
    version_id: str
    timestamp: datetime
    input_file_name: Optional[str] = None
    predicted_class: Optional[int] = None
    confidence: Optional[float] = None
    processing_time: float
