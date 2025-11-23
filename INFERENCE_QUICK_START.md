# Inference & Visualization Phase - Quick Start Guide

## 🎯 What's New?

The Inference & Visualization Phase is now complete! Users can:
1. ✅ Upload images for model testing
2. ✅ Run real-time inference on trained models
3. ✅ Visualize feature maps as heatmaps
4. ✅ Analyze layer-wise activations
5. ✅ Detect dead neurons and saturation issues

## 🚀 Getting Started

### 1. Navigate to Inference Page
- Click "Inference" in the main navigation (after logging in)
- Or go to `/inference` route

### 2. Select a Model
```
┌─ Select Model ──────────┐
│ [My CNN Model ▼]        │
└─────────────────────────┘
```
- Dropdown shows all your created models
- Select the model you want to test

### 3. Choose a Version
```
┌─ Select Version ────────┐
│ [Version 1 ▼]           │
└─────────────────────────┘
```
- Each model can have multiple versions
- Select the specific version to use

### 4. Upload an Image
```
[Upload Image]
Shows: cat.jpg
```
- Click "Upload Image" button
- Select PNG, JPG, or JPEG file
- Image will be automatically resized to model's input shape
- Preview displayed on the left

### 5. Run Inference
```
[Run Inference] ← Click here
```
- Processing status shown during inference
- Results appear in tabs below

---

## 📊 Understanding the Results

### Results Summary
```
┌────────────────────────────────┐
│ Processing Time: 245.32 ms     │
│ Output Shape: 1 × 1000         │
│ Predicted Class: 284           │
│ Confidence: 94.23%             │
└────────────────────────────────┘
```

### Tab 1: Feature Maps
**Purpose**: Visualize what different layers "see" in your image

**How to Read**:
- **Blue**: Low activation (layer not responding)
- **Green**: Medium activation
- **Yellow**: High activation
- **Red**: Very high activation

**What It Means**:
- Layers early in network detect edges and textures
- Middle layers detect shapes and patterns
- Late layers detect semantic concepts

**Example**:
```
Conv1: Detects edges
  (mostly blue/green - basic patterns)

Conv5: Detects objects
  (mostly yellow/red - focused features)
```

### Tab 2: Activations
**Purpose**: Analyze how "healthy" each layer is

**Status Indicators**:
- 🟢 **Normal** (Green): Neurons firing with good activation
- 🟠 **Saturated** (Orange): Values stuck at extremes (⚠️ potential gradient issues)
- 🔴 **Dead** (Red): Near-zero activation (⚠️ dying ReLU problem)

**What to Look For**:
- Mostly green = Good network health ✅
- Red neurons = Network might need retraining
- Yellow bars = Balanced activation

**Example Table**:
```
Layer         | Min    | Max   | Mean  | Status
──────────────┼────────┼───────┼───────┼────────
conv1.0       | -0.23  | 3.46  | 0.57  | ✓ Normal
conv1.1       | 0.00   | 0.00  | 0.00  | ⚠ Dead
conv2.0       |-10.5   | 8.23  | 0.12  | ⚠ Saturated
```

### Tab 3: Layer Details
**Purpose**: Detailed statistics for each layer

**Metrics**:
- **Min**: Minimum activation value
- **Max**: Maximum activation value
- **Mean**: Average activation (stability indicator)
- **Std**: Variation in activations (diversity indicator)

**Tips**:
- High Std = Good (neurons firing differently)
- Low Std = Bad (neurons producing similar values)
- Mean near 0.5 = Balanced
- Mean near 0 or 1 = Potentially problematic

---

## 🎨 Color Scale Guide

### Feature Map Heatmap
```
Blue ─────► Cyan ─────► Green ─────► Yellow ─────► Red
0.0%                                               100%

Low                  Medium                        High
Activation          Activation                   Activation
```

### Activation Bar
```
████ Blue/Cyan   = 0-25% activation range
████ Green       = 25-50% activation range
████ Yellow      = 50-75% activation range
████ Red         = 75-100% activation range
```

---

## 💡 Tips & Tricks

### 1. Understand Layer Names
Model layers follow naming patterns:
```
Layer Type       Example Name
─────────────────────────────
Conv2d           conv2d.0
BatchNorm        batchnorm2d.1
ReLU             relu.2
Linear           linear.3
Dropout          dropout.4
```

### 2. Interpret Activation Patterns

**Good Signs** ✅:
- Feature maps mostly yellow/red (active neurons)
- Activations gradually decrease through layers
- Most neurons showing "Normal" status
- Std > 0.1 (good diversity)

**Warning Signs** ⚠️:
- Many red (dead) neurons in early layers
- Orange (saturated) neurons throughout
- Activation suddenly dropping to zero
- Std < 0.01 (neurons producing same value)

### 3. Using Results for Model Debugging

**Symptom**: Dead neurons in layer 2
```
→ Issue: ReLU might be too aggressive
→ Solution: Try LeakyReLU (allows small negative values)
→ Action: Edit model and add new version
```

**Symptom**: Saturated neurons in layer 5
```
→ Issue: Gradient flow being blocked
→ Solution: Try adding Batch Normalization
→ Action: Edit model and add new version
```

**Symptom**: Output confidence < 50%
```
→ Issue: Model uncertainty
→ Solution: More training data or adjust learning rate
→ Action: Retrain model with new parameters
```

### 4. Comparing Different Model Versions

**Workflow**:
1. Upload same test image
2. Run inference on v1.0
3. Note activation patterns
4. Select v2.0 and run again
5. Compare feature maps and activations
6. See which version works better!

---

## 🔧 Technical Details

### Image Preprocessing
```python
1. Read image file (PNG, JPG, JPEG)
2. Convert to RGB (remove alpha channel)
3. Resize to model's input size (e.g., 224×224)
4. Normalize: [0, 255] → [0, 1]
5. Reorder: HWC → CHW (Height, Width, Channel)
6. Add batch dimension: [H,W,C] → [1,H,W,C]
```

### Processing Steps
```
Upload Image
    ↓
Preprocess (normalize, resize)
    ↓
Forward Pass (through all layers)
    ↓
Collect Hook Data (activation values)
    ↓
Compute Statistics (min, max, mean, std)
    ↓
Generate Visualizations
    ↓
Display Results
```

### Supported Input Formats
- **Formats**: PNG, JPG, JPEG
- **Max Size**: 50 MB (default)
- **Colors**: Auto-converted to RGB
- **Resize**: Automatic to model's input size

---

## 🐛 Troubleshooting

### Issue: "Model version not found"
**Cause**: Version was deleted or doesn't exist
**Solution**: Select a different version from dropdown

### Issue: "Failed to process image"
**Cause**: Invalid image format or corrupted file
**Solution**: Try another image (PNG/JPG), ensure not corrupted

### Issue: "Inference failed"
**Cause**: Model architecture incompatible or error in model
**Solution**: 
1. Check model was built correctly
2. Try different model version
3. Check browser console for errors

### Issue: "Authorization error"
**Cause**: Trying to access model owned by another user
**Solution**: This model isn't shared with you - contact owner

### Issue: Feature map shows all blue (no activation)
**Cause**: Layer not activated by this specific image
**Solution**: 
1. Try different image
2. Check if layer should be active
3. May indicate dead neuron problem

---

## 📈 Performance Tips

### For Faster Inference
1. Use smaller models
2. Use GPU (if available)
3. Use newer model versions (usually optimized)

### For Better Visualizations
1. Use varied test images
2. Test with both easy and hard examples
3. Compare multiple versions

### For Better Accuracy
1. Check feature maps - are layers active?
2. Look for dead neurons - might need retraining
3. Check output confidence - is model certain?

---

## 🎓 Learning Resources

### Understanding Neural Networks
- Each layer learns increasingly abstract features
- Early layers: edges, colors, textures
- Middle layers: shapes, objects
- Late layers: semantic concepts, class distinctions

### Understanding Visualizations
- **Heatmap colors** show layer activation strength
- **Activation stats** show neuron health
- **Color scale** helps identify problem neurons
- **Bars** visualize activation distribution

### Next Steps
1. Train multiple models
2. Compare their inference results
3. Use insights to improve architectures
4. Create better models iteratively

---

## 🚀 Advanced Features (Coming Soon)

- 📊 Batch inference (multiple images)
- 📥 Download activations as CSV
- 🔀 Model ensemble inference
- 📈 Activation history tracking
- 🎨 Custom layer-wise editing
- ⚡ GPU acceleration options

---

## 📞 Need Help?

Check these resources:
- 📖 Full documentation: `INFERENCE_VISUALIZATION_COMPLETE.md`
- 🛠️ API docs: Backend `inference.py` endpoints
- 💻 Code: Frontend components in `src/components/`
- 🐛 Issues: Check browser console for error details

Happy inferencing! 🚀
