# Inference & Visualization Phase - Implementation Guide

## 🎯 Phase Overview

This phase enables users to:
1. **Upload images** for model testing
2. **Run inference** on trained models
3. **Visualize feature maps** and layer activations
4. **Compare model outputs** across different architectures
5. **Understand model behavior** through layer-wise visualization

## 📊 Architecture

### Backend Flow
```
Image Upload → Preprocessing → Model Building → Forward Pass → Hook Collection → Output Serialization
     ↓              ↓                 ↓              ↓              ↓                  ↓
  FastAPI       PIL/Numpy      PyTorch Model   Tensor Flow   Layer Outputs      JSON Response
```

### Frontend Flow
```
Image Selection → Upload → Inference Request → Process Results → Render Visualizations
     ↓              ↓              ↓                   ↓                ↓
  UI Dialog    FormData      Async Call        State Update    D3/Canvas Render
```

## 🛠️ Implementation Tasks

### Task 1: Backend Inference Engine (Priority: HIGH)
**File**: `backend/services/inference_engine.py`

**Requirements**:
- ✅ Build model from architecture JSON
- ✅ Register forward hooks on all layers
- ✅ Capture layer outputs, activations, and shapes
- ✅ Handle batch processing
- ✅ Support different input shapes
- ✅ Error handling and cleanup

**Key Methods**:
```python
class InferenceEngine:
    def __init__(version: ModelVersion) -> None
    def _build_model() -> None
    def _create_hooks() -> List[Hook]
    def run_inference(input_tensor: Tensor) -> Dict[str, Any]
    def extract_layer_outputs() -> List[LayerOutput]
    def cleanup_hooks() -> None
```

### Task 2: Inference Schemas (Priority: HIGH)
**File**: `backend/api/v1/schemas/inference.py`

**Required Models**:
```python
class InferenceRequest(BaseModel):
    version_id: str
    input_data: List[float]
    
class LayerOutput(BaseModel):
    layer_name: str
    layer_type: str
    output_shape: List[int]
    activation_stats: Dict[str, float]  # min, max, mean, std
    
class InferenceResponse(BaseModel):
    version_id: str
    output: List[float]
    predicted_class: int  # Optional
    confidence: float  # Optional
    layer_outputs: List[LayerOutput]
    processing_time: float
```

### Task 3: Inference Endpoints (Priority: HIGH)
**File**: `backend/api/v1/endpoints/inference.py`

**Endpoints**:
- `POST /inference/run` - Run inference with input data
- `POST /inference/run-image` - Run inference with uploaded image
- `GET /inference/{version_id}/config` - Get model input configuration

### Task 4: Frontend Inference Service (Priority: HIGH)
**File**: `frontend/src/api/inference.ts`

**Methods**:
```typescript
export const inferenceApi = {
  runInference(versionId: string, inputData: number[]): Promise<InferenceResponse>
  uploadAndInfer(versionId: string, imageFile: File): Promise<InferenceResponse>
  getModelConfig(versionId: string): Promise<ModelConfig>
}
```

### Task 5: InferencePage Component (Priority: HIGH)
**File**: `frontend/src/pages/InferencePage.tsx`

**Features**:
- [ ] Model selection (dropdown of user's models)
- [ ] Model version selection
- [ ] Image upload input
- [ ] Preview uploaded image
- [ ] Run inference button
- [ ] Loading state during inference
- [ ] Results display area
- [ ] Error handling and display

### Task 6: FeatureMapVisualizer Component (Priority: MEDIUM)
**File**: `frontend/src/components/FeatureMapVisualizer.tsx`

**Features**:
- [ ] Canvas-based rendering of feature maps
- [ ] Heatmap visualization (hot = high activation)
- [ ] Layer selection (dropdown)
- [ ] Zoom and pan controls
- [ ] Color scale legend
- [ ] Statistics display (min, max, mean, std)

### Task 7: ActivationVisualizer Component (Priority: MEDIUM)
**File**: `frontend/src/components/ActivationVisualizer.tsx`

**Features**:
- [ ] Tree/table view of all layer outputs
- [ ] Activation statistics (histograms, box plots)
- [ ] Layer activation comparison
- [ ] Export activation data as CSV

### Task 8: Integration Testing (Priority: MEDIUM)
**Testing Checklist**:
- [ ] Backend model building from architecture JSON
- [ ] Hook registration and cleanup
- [ ] Tensor shape propagation through layers
- [ ] Image preprocessing and normalization
- [ ] API response serialization
- [ ] Frontend image upload
- [ ] Inference request/response handling
- [ ] Visualization rendering
- [ ] Error scenarios (invalid models, file formats)

## 📈 Data Flow Details

### Inference Request Flow
```json
{
  "version_id": "ObjectId",
  "input_data": [0.1, 0.2, ..., 0.5]  // Flattened image array
}
```

### Inference Response Flow
```json
{
  "version_id": "ObjectId",
  "output": [0.1, 0.3, 0.6],  // Model predictions
  "predicted_class": 2,
  "confidence": 0.87,
  "processing_time": 0.245,
  "layer_outputs": [
    {
      "layer_name": "conv1.0",
      "layer_type": "Conv2d",
      "output_shape": [1, 64, 112, 112],
      "activation_stats": {
        "min": -0.234,
        "max": 3.456,
        "mean": 0.567,
        "std": 0.789
      }
    },
    // ... more layers
  ]
}
```

## 🎨 UI Layout

### InferencePage Layout
```
┌─────────────────────────────────────────────┐
│ Inference & Visualization                   │
├─────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────────┐  │
│ │ Model Selection  │  │ Image Upload     │  │
│ │ [Dropdown ▼]     │  │ [Choose File...] │  │
│ │ Version: [v1, v2]│  │ [Preview Image]  │  │
│ └──────────────────┘  └──────────────────┘  │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ [Run Inference]                      │   │
│ └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ Results (Split View)                        │
│ ┌────────────────────┬────────────────────┐ │
│ │ Feature Maps       │ Activations        │ │
│ │ [Canvas]           │ [Layer Tree/Table] │ │
│ │                    │                    │ │
│ └────────────────────┴────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 🔧 Backend Implementation Details

### Model Building from Architecture
```python
def build_model(architecture: Dict[str, Any]) -> nn.Module:
    layers = []
    for layer_config in architecture['layers']:
        layer_type = layer_config['type']
        params = layer_config['params']
        
        if layer_type == 'Conv2d':
            layers.append(nn.Conv2d(**params))
        elif layer_type == 'ReLU':
            layers.append(nn.ReLU(**params))
        # ... more layer types
    
    return nn.Sequential(*layers)
```

### Hook Registration Pattern
```python
def register_hooks(model: nn.Module) -> List:
    hooks = []
    layer_outputs = []
    
    def create_hook(name):
        def hook(module, input, output):
            layer_outputs.append({
                'name': name,
                'shape': output.shape,
                'data': output.detach().cpu().numpy()
            })
        return hook
    
    for name, module in model.named_modules():
        if is_leaf_module(module):
            hooks.append(module.register_forward_hook(create_hook(name)))
    
    return hooks, layer_outputs
```

## 📦 Dependencies

### Backend
- `torch` - Model inference and hooks
- `PIL` - Image preprocessing
- `numpy` - Array operations
- `Pydantic` - Schema validation

### Frontend
- `D3.js` (or `plotly.js`) - Visualization
- `axios` - API requests
- `zustand` - State management
- `Material-UI` - Components

## ⚠️ Error Handling

### Backend Error Scenarios
1. **Invalid Model Version** → 404 Not Found
2. **Model Building Failed** → 500 Internal Server Error
3. **Invalid Input Shape** → 400 Bad Request
4. **File Upload Error** → 400 Bad Request
5. **Memory Exhaustion** → 503 Service Unavailable

### Frontend Error Handling
1. Display error toast/alert
2. Log to console for debugging
3. Retry button for transient errors
4. Fallback UI states

## 📝 Next Steps

1. **Start with Task 1** - Enhance InferenceEngine implementation
2. **Implement Task 2** - Add inference schemas
3. **Complete Task 3** - Finalize inference endpoints
4. **Build Task 4** - Frontend inference service
5. **Create Task 5** - InferencePage component
6. **Add Tasks 6-7** - Visualization components
7. **Run Task 8** - Integration testing

## 🧪 Testing Strategy

### Backend Tests
```python
def test_model_building():
    # Test building model from architecture JSON
    
def test_inference():
    # Test inference with sample input
    
def test_hook_collection():
    # Test layer output collection
```

### Frontend Tests
```typescript
describe('InferencePage', () => {
  test('renders model selection')
  test('handles image upload')
  test('displays inference results')
})
```

## 📚 Resources

- PyTorch Hooks: https://pytorch.org/docs/stable/generated/torch.nn.Module.register_forward_hook.html
- D3.js Heatmaps: https://d3-graph-gallery.com/graph/heatmap.html
- Canvas Visualization: MDN Web Docs - Canvas API
