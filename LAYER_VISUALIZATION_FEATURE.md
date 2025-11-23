# Layer-by-Layer Inference Visualization Feature

## Overview

Added comprehensive **layer-by-layer visualization** to the Inference page to show how data flows through each layer of the neural network model during inference.

## New Components

### 1. LayerProcessingVisualizer (`LayerProcessingVisualizer.tsx`)
Shows the step-by-step processing of data through each layer with:

- **Layer-by-Layer Playback**: 
  - Play/Pause controls for automatic progression through layers
  - Next/Previous buttons for manual navigation
  - Speed control (0.5x to 10x speed)

- **Feature Map Visualization**:
  - Heatmap rendering of layer outputs
  - Color-coded activation values (blue to red gradient)
  - Shows min/max/mean/std statistics for each layer

- **Layer Pipeline**:
  - Visual list of all layers in the model
  - Click to jump to any layer
  - Shows layer type and output shape

- **Summary Table**:
  - All layers with their properties
  - Output shapes
  - Activation statistics
  - Clickable rows to navigate

### 2. ConvolutionalVisualizer (`ConvolutionalVisualizer.tsx`)
**Animated kernel visualization** specifically for convolutional layers showing:

- **Kernel Movement Animation**:
  - Red box showing the convolution kernel moving across input
  - Animated stride and sliding window effect
  - Play/Pause/Reset controls with progress slider

- **Data Flow Visualization**:
  - Input feature map as a grid
  - Kernel position highlighting the current receptive field
  - Output grid showing where the kernel's output goes
  - Blue arrow showing data flow from input to output

- **Layer Selection**:
  - Filter and select convolutional layers only
  - Shows layer statistics (min, max, mean)

- **Educational Overview**:
  - Explanation of how convolution works
  - Shows the relationship between input kernel position and output activation

## Integration

Both visualizers are added to the **Inference page** as tabs:

1. **Layer Processing** - Main step-by-step visualization
2. **Kernel Animation** - Animated convolution visualization
3. **Feature Maps** - Original feature map viewer
4. **Activations** - Activation statistics
5. **Layer Details** - Detailed table view

## Usage Flow

1. **Select Model** → Select Version
2. **Upload Image** → Click "Run Inference"
3. **Navigate to "Layer Processing" tab** to see:
   - Real-time layer-by-layer data flow
   - Activation heatmaps for each layer
   - Statistics about activations
4. **Navigate to "Kernel Animation" tab** to see:
   - How convolution kernels slide across images
   - How each position creates output activations

## Technical Details

### Feature Map Heatmap Generation
- Normalizes layer output data (min-max scaling)
- Uses HSL color space (blue to red gradient)
- Handles different layer output shapes automatically
- Limits visualization size for large feature maps

### Convolution Visualization
- Canvas-based animation system
- Supports multiple kernel positions
- Shows input → kernel position → output mapping
- Progress bar for easy navigation

### Data Flow
- Backend: `inference_engine.py` collects layer outputs via hooks
- Frontend: Components visualize the collected activation data
- Real-time heatmap rendering without server requests

## Performance Notes

- Output data is limited to first 10,000 values per layer (backend)
- Canvas rendering optimized for smooth animation
- Heatmap generation done client-side to reduce bandwidth

## Future Enhancements

1. **3D Visualization** - Multi-channel feature map visualization
2. **Gradient Visualization** - Show gradients flowing back through layers
3. **Filter Visualization** - Display actual convolution kernels
4. **Comparison Mode** - Compare activations across different inputs
5. **Export** - Save layer activations and visualizations

## Browser Compatibility

- Requires Canvas API support
- Tested on Chrome, Firefox, Edge (modern versions)
- Falls back gracefully for unsupported browsers

