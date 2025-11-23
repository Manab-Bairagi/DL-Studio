"""
Export endpoints for generating Python code from models
"""
from fastapi import APIRouter, Depends, HTTPException, status
from backend.db.models import User, Model, ModelVersion
from backend.api.v1.dependencies import get_current_user, validate_object_id
from backend.services.code_generator import CodeGenerator
from fastapi.responses import FileResponse
import os

router = APIRouter()

@router.get("/{version_id}/python")
async def export_python_code(
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Export model version as Python PyTorch code"""
    version_obj_id = validate_object_id(version_id)
    
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
    
    # Generate Python code
    generator = CodeGenerator(version)
    code = generator.generate_pytorch_code(model_name=model.name)
    
    # Save to models directory
    models_dir = os.path.join("models", f"user_{str(current_user.id)}", f"model_{str(version.model_id)}")
    os.makedirs(models_dir, exist_ok=True)
    
    filename = f"model_v{version.version_number}.py"
    filepath = os.path.join(models_dir, filename)
    
    with open(filepath, "w") as f:
        f.write(code)
    
    return FileResponse(
        filepath,
        media_type="text/x-python",
        filename=filename
    )

@router.get("/{version_id}/code")
async def get_python_code(
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get Python code as text (for preview in Monaco Editor)"""
    version_obj_id = validate_object_id(version_id)
    
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
    
    # Generate Python code
    generator = CodeGenerator(version)
    code = generator.generate_pytorch_code(model_name=model.name)
    
    return {"code": code, "version_id": version_id}
