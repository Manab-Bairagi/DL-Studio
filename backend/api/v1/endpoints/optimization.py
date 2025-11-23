from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.services.gemini_service import GeminiService
from backend.services.simulation_service import SimulationService
from fastapi.responses import StreamingResponse
import json

router = APIRouter()
gemini_service = GeminiService()
simulation_service = SimulationService()

class OptimizationRequest(BaseModel):
    architecture: Dict[str, Any]
    dataset_stats: Dict[str, Any]
    training_metrics: List[Dict[str, Any]] = None

class SimulationRequest(BaseModel):
    architecture: Dict[str, Any]
    dataset_stats: Dict[str, Any]
    training_config: Dict[str, Any]
@router.post("/suggestions")
async def get_optimization_suggestions(request: OptimizationRequest):
    """
    Get optimization suggestions from Gemini based on architecture and dataset stats.
    """
    result = await gemini_service.get_optimization_suggestions(
        request.architecture,
        request.dataset_stats,
        request.training_metrics
    )
    return result

@router.post("/simulate/train")
async def simulate_training(request: SimulationRequest):
    """
    Stream training simulation metrics.
    """
    async def event_generator():
        async for metrics in simulation_service.simulate_training(
            request.architecture,
            request.dataset_stats,
            request.training_config
        ):
            yield f"data: {json.dumps(metrics)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/simulate/batch")
async def generate_synthetic_batch(request: SimulationRequest):
    """
    Generate info about a synthetic batch.
    """
    return simulation_service.generate_synthetic_batch(
        request.dataset_stats,
        request.training_config.get('batch_size', 32)
    )
