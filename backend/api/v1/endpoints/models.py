"""
Model management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from backend.db.models import User, Model, ModelVersion
from backend.api.v1.dependencies import get_current_user, validate_object_id
from backend.api.v1.schemas.models import (
    ModelCreate, ModelResponse, ModelVersionCreate, ModelVersionResponse
)

router = APIRouter()

@router.post("", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_data: ModelCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new model"""
    new_model = Model(
        name=model_data.name,
        description=model_data.description,
        model_type=model_data.model_type,
        owner_id=current_user.id
    )
    await new_model.insert()
    
    return ModelResponse(
        id=str(new_model.id),
        name=new_model.name,
        description=new_model.description,
        model_type=new_model.model_type,
        owner_id=str(new_model.owner_id),
        created_at=new_model.created_at,
        updated_at=new_model.updated_at
    )

@router.get("", response_model=List[ModelResponse])
async def get_models(
    current_user: User = Depends(get_current_user)
):
    """Get all models for current user"""
    models = await Model.find(Model.owner_id == current_user.id).to_list()
    return [
        ModelResponse(
            id=str(m.id),
            name=m.name,
            description=m.description,
            model_type=m.model_type,
            owner_id=str(m.owner_id),
            created_at=m.created_at,
            updated_at=m.updated_at
        )
        for m in models
    ]

@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific model"""
    model_obj_id = validate_object_id(model_id)
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    return ModelResponse(
        id=str(model.id),
        name=model.name,
        description=model.description,
        model_type=model.model_type,
        owner_id=str(model.owner_id),
        created_at=model.created_at,
        updated_at=model.updated_at
    )

@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: str,
    model_data: ModelCreate,
    current_user: User = Depends(get_current_user)
):
    """Update a model"""
    model_obj_id = validate_object_id(model_id)
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    model.name = model_data.name
    model.description = model_data.description
    model.model_type = model_data.model_type
    model.updated_at = datetime.utcnow()
    await model.save()
    
    return ModelResponse(
        id=str(model.id),
        name=model.name,
        description=model.description,
        model_type=model.model_type,
        owner_id=str(model.owner_id),
        created_at=model.created_at,
        updated_at=model.updated_at
    )

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a model"""
    model_obj_id = validate_object_id(model_id)
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Delete all versions first
    await ModelVersion.find(ModelVersion.model_id == model_obj_id).delete()
    
    # Delete model
    await model.delete()
    return None

# Model Version endpoints
@router.post("/{model_id}/versions", response_model=ModelVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_model_version(
    model_id: str,
    version_data: ModelVersionCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new version for a model"""
    model_obj_id = validate_object_id(model_id)
    
    # Verify model ownership
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Get next version number
    existing_versions = await ModelVersion.find(
        ModelVersion.model_id == model_obj_id
    ).to_list()
    next_version = max([v.version_number for v in existing_versions], default=0) + 1
    
    new_version = ModelVersion(
        model_id=model_obj_id,
        version_number=next_version,
        architecture=version_data.architecture,
        custom_loss=version_data.custom_loss,
        input_shape=version_data.input_shape,
        output_shape=version_data.output_shape,
        notes=version_data.notes
    )
    await new_version.insert()
    
    return ModelVersionResponse(
        id=str(new_version.id),
        model_id=str(new_version.model_id),
        version_number=new_version.version_number,
        architecture=new_version.architecture,
        custom_loss=new_version.custom_loss,
        input_shape=new_version.input_shape,
        output_shape=new_version.output_shape,
        notes=new_version.notes,
        is_active=new_version.is_active,
        created_at=new_version.created_at,
        updated_at=new_version.updated_at
    )

@router.get("/{model_id}/versions", response_model=List[ModelVersionResponse])
async def get_model_versions(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all versions for a model"""
    model_obj_id = validate_object_id(model_id)
    
    # Verify model ownership
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    versions = await ModelVersion.find(
        ModelVersion.model_id == model_obj_id
    ).to_list()
    
    return [
        ModelVersionResponse(
            id=str(v.id),
            model_id=str(v.model_id),
            version_number=v.version_number,
            architecture=v.architecture,
            custom_loss=v.custom_loss,
            input_shape=v.input_shape,
            output_shape=v.output_shape,
            notes=v.notes,
            is_active=v.is_active,
            created_at=v.created_at,
            updated_at=v.updated_at
        )
        for v in versions
    ]

@router.get("/{model_id}/versions/{version_id}", response_model=ModelVersionResponse)
async def get_model_version(
    model_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific model version"""
    model_obj_id = validate_object_id(model_id)
    version_obj_id = validate_object_id(version_id)
    
    # Verify model ownership
    model = await Model.find_one(
        Model.id == model_obj_id,
        Model.owner_id == current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    version = await ModelVersion.find_one(
        ModelVersion.id == version_obj_id,
        ModelVersion.model_id == model_obj_id
    )
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    return ModelVersionResponse(
        id=str(version.id),
        model_id=str(version.model_id),
        version_number=version.version_number,
        architecture=version.architecture,
        custom_loss=version.custom_loss,
        input_shape=version.input_shape,
        output_shape=version.output_shape,
        notes=version.notes,
        is_active=version.is_active,
        created_at=version.created_at,
        updated_at=version.updated_at
    )
