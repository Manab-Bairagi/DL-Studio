# Quick Start Guide - Model Builder & Inference

## 🚀 Getting Started

### 1. **Start the Application**

```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### 2. **Access the Application**

Open browser and navigate to: `http://localhost:5173`

---

## 📋 Complete Workflow

### Step 1: Login/Register

1. Click **Register** if you're new
   - Enter email, password, full name
   - Click "Create Account"

2. Or **Login** with existing credentials
   - Enter email and password
   - Click "Login"

You'll be redirected to Dashboard.

---

### Step 2: Create a Model

1. Click **Builder** in navbar
2. You'll see the visual builder with:
   - **Left**: Layer Palette (drag layers here)
   - **Center**: Canvas (drop layers to build)
   - **Right**: Configuration panel

3. **Drag layers from palette to canvas**:
   - Drag "Conv2d" → Canvas
   - Drag "ReLU" → Canvas
   - Drag "MaxPool2d" → Canvas
   - Drag "Flatten" → Canvas
   - Drag "Linear" → Canvas

4. **Connect layers**:
   - Click from output handle (right) of one layer
   - Drag to input handle (left) of next layer

5. **Configure each layer**:
   - Click on a layer to select it
   - Edit parameters in right panel:
     - Conv2d: channels, kernel size, padding
     - Linear: input/output features
     - Etc.

6. **Save Architecture**:
   - Click "Save Architecture" button
   - Enter model name (e.g., "CIFAR10 CNN")
   - Enter description (optional)
   - Select model type (default: classification)
   - Set input shape (default: 1,3,224,224)
   - Click "Save"

You'll be redirected to Dashboard showing your new model.

---

### Step 3: Edit a Saved Model (Optional)

1. Go to **Dashboard**
2. Find your model in the list
3. Click on the model name to view details
4. Click **"Edit Model"** button
5. Existing architecture loads in builder
6. Make modifications as needed
7. Click "Save New Version"
8. Add version notes describing changes
9. Click "Save Version"

The system will create a new version while keeping the original.

---

### Step 4: Run Inference

1. Click **Inference** in navbar
2. **Select Model**:
   - Dropdown shows all your models
   - Click to select one

3. **Select Version**:
   - Shows all versions of selected model
   - Defaults to latest version

4. **Upload Image**:
   - Click "Upload Image" button
   - Select PNG/JPG image file (any size)
   - Preview appears below

5. **Run Inference**:
   - Click "Run Inference" button
   - Watch loading spinner

6. **View Results** (3 tabs):

   **Tab 1: Feature Maps**
   - Shows heatmap of layer activations
   - Select layer from dropdown
   - Colors: Blue (low) → Red (high)
   - See activation statistics

   **Tab 2: Activations**
   - Table showing all layers
   - Activation statistics for each
   - Neuron health status:
     - ✓ Normal (green)
     - ⚠ Dead (red) - no activation
     - ⚠ Saturated (orange) - full activation

   **Tab 3: Layer Details**
   - Detailed statistics table
   - Min, Max, Mean, Std per layer
   - Output shapes

---

## 🎨 Model Builder Tips

### Layer Palette Available:

**Convolutional**:
- Conv1d, Conv2d, Conv3d
- Depthwise, Separable

**Pooling**:
- MaxPool1d, MaxPool2d, MaxPool3d
- AvgPool1d, AvgPool2d, AvgPool3d

**Activation Functions**:
- ReLU, LeakyReLU, Sigmoid, Tanh
- GELU, Softmax, ELU, Swish, Softplus
- More...

**Normalization**:
- BatchNorm1d, BatchNorm2d, BatchNorm3d
- LayerNorm

**Blocks** (Pre-configured):
- ConvBNReLU (Conv + Batch Norm + ReLU)
- ConvBNLeakyReLU (Conv + Batch Norm + LeakyReLU)
- ResidualBlock (Residual connection)

**Others**:
- Flatten, Linear/Dense, Dropout, etc.

### Configuration Tips:

1. **Conv2d**:
   - in_channels: Previous layer output channels
   - out_channels: Number of filters
   - kernel_size: Usually 3, 5, or 7
   - padding: Usually kernel_size // 2

2. **Linear/Dense**:
   - in_features: Must match flattened input
   - out_features: Output dimension

3. **Dropout**:
   - p: Probability (0.1-0.5 typical)

4. **BatchNorm**:
   - num_features: Same as previous layer output channels

---

## 🔧 Common Issues & Solutions

### Issue: Button "Save Architecture" is disabled
**Solution**: You need at least one layer. Drag a layer to canvas.

### Issue: Can't connect two layers
**Solution**: Make sure you're dragging from the right handle (output) of one layer to the left handle (input) of another.

### Issue: Inference times out
**Solution**: Model may be too complex. Try simpler architecture or restart backend.

### Issue: Image upload not working
**Solution**: Make sure file is PNG or JPG, and less than 50MB.

### Issue: Visualizations not rendering
**Solution**: 
1. Check browser console (F12)
2. Refresh page
3. Restart frontend: `npm run dev`

---

## 📊 Understanding Inference Results

### Feature Maps (Tab 1)
- **What**: Activation values from a specific layer
- **Colors**: 
  - Blue: Low activation (near 0)
  - Green: Medium activation
  - Yellow: Higher activation
  - Red: Maximum activation
- **Use**: Find which features layer is detecting

### Activations (Tab 2)
- **Status Icons**:
  - ✓ Normal: Healthy neuron activity
  - ⚠ Dead: Neuron never activates (fix: lower learning rate)
  - ⚠ Saturated: Neuron always active (fix: adjust bias)
- **Bars**: Show average activation intensity
- **Stats**: Min/Max/Mean/Std for each layer

### Layer Details (Tab 3)
- **Raw Statistics**: Min, Max, Mean, Standard Deviation
- **Use**: Detailed analysis of layer behavior

---

## 🎯 Model Design Best Practices

1. **Input Shape**:
   - Must match your data
   - CIFAR-10: 1,3,32,32 (batch, channels, height, width)
   - ImageNet: 1,3,224,224
   - Custom: Adjust accordingly

2. **Architecture Flow**:
   - Start with Conv layers for feature extraction
   - Pool to reduce spatial dimensions
   - Flatten before Linear layers
   - End with Linear layer matching number of classes

3. **Parameter Sizing**:
   - Conv layers: Gradual increase in channels (32→64→128)
   - After each Conv+Pool: Channels double, spatial dims halve
   - Final Linear: (channels * height * width) → 10 (or num_classes)

4. **Avoid**:
   - Too deep without skip connections
   - Mismatched channel dimensions
   - Linear layers before flattening spatial data

---

## 📈 Next Steps

After building and testing models:

1. **Export Model**: (Coming soon)
   - Export as PyTorch .pt file
   - Export as ONNX format

2. **Compare Models**: (Coming soon)
   - Run inference on multiple versions
   - Compare performance metrics

3. **Batch Processing**: (Coming soon)
   - Process multiple images at once
   - Get performance metrics

4. **Training**: (Future)
   - Train models directly in web UI
   - Track training progress
   - Save checkpoints

---

## 💡 Support

For issues:
1. Check console (F12) for error messages
2. Verify backend is running
3. Restart frontend if needed
4. Check network connectivity

Happy building! 🚀
