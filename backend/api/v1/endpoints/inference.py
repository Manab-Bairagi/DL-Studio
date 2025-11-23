"""
Inference endpoints for running models and visualizing outputs
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from backend.db.models import User, Model, ModelVersion
from backend.api.v1.dependencies import get_current_user, validate_object_id
from backend.services.inference_engine import InferenceEngine
from backend.api.v1.schemas.inference import (
    InferenceRequest,
    InferenceResponse,
    LayerOutput,
    ModelConfig,
)
import numpy as np
from PIL import Image
import io
from typing import List

router = APIRouter()

@router.post("/run", response_model=InferenceResponse)
async def run_inference(
    request: InferenceRequest,
    current_user: User = Depends(get_current_user)
):
    """Run inference on a model version with sample input"""
    try:
        version_obj_id = validate_object_id(request.version_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid version ID: {str(e)}"
        )
    
    # Get model version
    version = await ModelVersion.find_one(ModelVersion.id == version_obj_id)
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model version not found"
        )
    
    # Get model and verify ownership
    model = await Model.find_one(Model.id == version.model_id)
    if not model or model.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this model"
        )
    
    # Initialize inference engine
    try:
        engine = InferenceEngine(version)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build model: {str(e)}"
        )
    
    # Run inference
    try:
        result = engine.run_inference(
            request.input_data,
            input_shape=request.input_shape
        )
        
        # Convert layer outputs to response format
        layer_outputs = [
            LayerOutput(
                layer_name=output["layer_name"],
                layer_type=output["layer_type"],
                output_shape=output["output_shape"],
                activation_stats=output["activation_stats"],
                output_data=output["output_data"],
            )
            for output in result["layer_outputs"]
        ]
        
        # Get class label if available
        predicted_class_label = None
        if result.get("predicted_class") is not None and request.class_labels:
            idx = result["predicted_class"]
            if 0 <= idx < len(request.class_labels):
                predicted_class_label = request.class_labels[idx]
        elif result.get("predicted_class") is not None and version.class_labels:
            idx = result["predicted_class"]
            if 0 <= idx < len(version.class_labels):
                predicted_class_label = version.class_labels[idx]
        
        return InferenceResponse(
            version_id=request.version_id,
            output=result["output"],
            output_shape=result["output_shape"],
            predicted_class=result.get("predicted_class"),
            predicted_class_label=predicted_class_label,
            confidence=result.get("confidence"),
            layer_outputs=layer_outputs,
            processing_time=result["processing_time"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )

@router.post("/run-image", response_model=InferenceResponse)
async def run_inference_image(
    version_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Run inference with an uploaded image"""
    try:
        version_obj_id = validate_object_id(version_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid version ID: {str(e)}"
        )
    
    # Get model version
    version = await ModelVersion.find_one(ModelVersion.id == version_obj_id)
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model version not found"
        )
    
    # Get model and verify ownership
    model = await Model.find_one(Model.id == version.model_id)
    if not model or model.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this model"
        )
    
    # Read and process image
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image = image.convert("RGB")
        
        # Resize to match input shape if needed
        input_shape = version.input_shape
        if len(input_shape) == 4:  # [batch, channels, height, width]
            height, width = input_shape[2], input_shape[3]
            image = image.resize((width, height))
        
        # Convert to numpy array and normalize
        image_array = np.array(image).astype(np.float32) / 255.0
        
        # Reorder dimensions: HWC -> CHW if needed
        if len(image_array.shape) == 3:
            image_array = np.transpose(image_array, (2, 0, 1))
        
        # Convert to list for API
        input_data = image_array.flatten().tolist()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process image: {str(e)}"
        )
    
    # Initialize inference engine
    try:
        engine = InferenceEngine(version)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build model: {str(e)}"
        )
    
    # Run inference
    try:
        result = engine.run_inference(
            input_data,
            input_shape=version.input_shape
        )
        
        # Convert layer outputs to response format
        layer_outputs = [
            LayerOutput(
                layer_name=output["layer_name"],
                layer_type=output["layer_type"],
                output_shape=output["output_shape"],
                activation_stats=output["activation_stats"],
                output_data=output["output_data"],
            )
            for output in result["layer_outputs"]
        ]
        
        # Get class label if available
        predicted_class_label = None
        if result.get("predicted_class") is not None and version.class_labels:
            idx = result["predicted_class"]
            if 0 <= idx < len(version.class_labels):
                predicted_class_label = version.class_labels[idx]
        
        return InferenceResponse(
            version_id=version_id,
            output=result["output"],
            output_shape=result["output_shape"],
            predicted_class=result.get("predicted_class"),
            predicted_class_label=predicted_class_label,
            confidence=result.get("confidence"),
            layer_outputs=layer_outputs,
            processing_time=result["processing_time"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )

@router.get("/{version_id}/config", response_model=ModelConfig)
async def get_model_config(
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get model configuration and metadata"""
    try:
        version_obj_id = validate_object_id(version_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid version ID: {str(e)}"
        )
    
    # Get model version
    version = await ModelVersion.find_one(ModelVersion.id == version_obj_id)
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model version not found"
        )
    
    # Get model and verify ownership
    model = await Model.find_one(Model.id == version.model_id)
    if not model or model.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this model"
        )
    
    # Build model to get config
    try:
        engine = InferenceEngine(version)
        config = engine.get_model_config()
        
        return ModelConfig(
            architecture=config["architecture"],
            input_shape=config["input_shape"],
            model_summary=config["model_summary"],
            total_parameters=config["total_parameters"],
            trainable_parameters=config["trainable_parameters"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model config: {str(e)}"
        )

