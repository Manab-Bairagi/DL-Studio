`# Sample Classification Model for Testing

This guide walks you through creating and testing a simple classification model for CIFAR-10-like image classification.

## 🎯 Quick Summary

**Model Purpose**: Classify 32×32 pixel images into 10 categories
**Model Type**: Simple CNN (Convolutional Neural Network)
**Input**: 32×32 RGB images (3 channels)
**Output**: 10 class probabilities
**Total Layers**: 7
**Complexity**: Low (good for testing)

---

## 📝 Step-by-Step: Build the Model

### Step 1: Start Building
1. Click **"Builder"** in the navbar
2. You'll see the visual builder with layer palette on left

### Step 2: Add Layers (Drag to Canvas)

Drag these layers in order from the palette to the canvas:

#### Layer 1: Conv2d (Feature Extraction)
**From**: Convolutional tab
**Drag**: Conv2d to canvas

**Configure** (click on layer to open config panel):
- `in_channels`: 3 (RGB image)
- `out_channels`: 32 (number of filters)
- `kernel_size`: 3 (3×3 convolution)
- `padding`: 1 (maintain dimensions)

#### Layer 2: ReLU (Activation)
**From**: Activation tab
**Drag**: ReLU to canvas

**Configure**:
- `inplace`: false

#### Layer 3: MaxPool2d (Reduce Dimensions)
**From**: Pooling tab
**Drag**: MaxPool2d to canvas

**Configure**:
- `kernel_size`: 2 (2×2 pooling)
- `stride`: 2 (stride of 2)

#### Layer 4: Conv2d (More Features)
**From**: Convolutional tab
**Drag**: Conv2d to canvas

**Configure**:
- `in_channels`: 32 (output from layer 1)
- `out_channels`: 64 (more filters)
- `kernel_size`: 3
- `padding`: 1

#### Layer 5: ReLU (Activation)
**From**: Activation tab
**Drag**: ReLU to canvas

**Configure**:
- `inplace`: false

#### Layer 6: Flatten (Reshape for Dense)
**From**: Utility tab
**Drag**: Flatten to canvas

**Configure**:
- `start_dim`: 1 (flatten from dimension 1 onwards)

#### Layer 7: Linear (Classification Head)
**From**: Utility tab
**Drag**: Linear to canvas

**Configure**:
- `in_features`: 16384 (calculated from 64 × 16 × 16)
  - After 2 rounds of pooling: 32 → 16 → 8 (but we only pool once in this model)
  - Actually: 64 × 16 × 16 = 16,384
- `out_features`: 10 (10 classes)
- `bias`: true

### Step 3: Connect Layers

Connect each layer to the next:

1. Click the **right handle** (output) of Layer 1 (Conv2d)
2. Drag to **left handle** (input) of Layer 2 (ReLU)
3. Repeat for all layers: 2→3, 3→4, 4→5, 5→6, 6→7

**Result**: Should see a linear chain of 7 connected layers

### Step 4: Save the Model

1. Click **"Save Architecture"** button (top right)
2. Fill in the form:
   - **Model Name**: `CIFAR10_Simple`
   - **Description**: `Simple CNN for CIFAR-10 classification testing`
   - **Model Type**: `classification`
   - **Input Shape**: `1,3,32,32` (batch=1, channels=3, height=32, width=32)
3. Click **"Save"**

You'll be redirected to Dashboard. Your model is created! ✅

---

## 🧪 Test the Inference

### Step 1: Prepare Test Image

You need a 32×32 pixel RGB image. Here are options:

**Option A: Use any image** (will be auto-resized)
- Find any PNG or JPG image on your computer
- Any size works - system will resize to 32×32

**Option B: Quick test with a real CIFAR-10 image**
- Download from: https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz
- Or use online image examples

**Option C: Use a simple test image**
- Paint something 32×32 pixels
- Or take a small screenshot
- Save as PNG or JPG

### Step 2: Run Inference

1. Click **"Inference"** in the navbar (FIXED! 🎉)
2. **Select Model**: 
   - Dropdown shows your models
   - Select: `CIFAR10_Simple`
3. **Select Version**:
   - Shows: `Version 1`
   - Click to select
4. **Upload Image**:
   - Click "Upload Image" button
   - Select your test image file
   - See preview below
5. **Run Inference**:
   - Click "Run Inference" button
   - Watch the loading spinner
   - Should complete in <2 seconds

### Step 3: View Results

After inference completes, you'll see results in 3 tabs:

#### **Tab 1: Feature Maps**
- Shows heatmap of layer activations
- Select different layers from dropdown
- See which features the network detected
- Red areas = high activation, Blue = low

#### **Tab 2: Activations**
- Table showing each layer's statistics
- Min, Max, Mean, Std for each layer
- Status indicators: ✓ Normal, ⚠ Dead, ⚠ Saturated
- Color bars showing activation intensity

#### **Tab 3: Layer Details**
- Raw statistics for each layer
- Input/output shapes
- Detailed activation values

---

## 📊 What to Expect

### Output Results
- **Output Values**: 10 numbers (probabilities for each class)
- **Should sum to ~1.0** (or close if not using softmax)
- **Processing Time**: <500ms (should be fast)

### Layer Statistics
For this model, you should see:

| Layer | Type | Output Shape | Expected |
|-------|------|--------------|----------|
| 1 | Conv2d | 1, 32, 32, 32 | 32 filters, same size (padding=1) |
| 2 | ReLU | 1, 32, 32, 32 | Same shape, values clipped to [0, ∞) |
| 3 | MaxPool2d | 1, 32, 16, 16 | Half dimensions (stride=2) |
| 4 | Conv2d | 1, 64, 16, 16 | 64 filters, same size (padding=1) |
| 5 | ReLU | 1, 64, 16, 16 | Same shape, values clipped to [0, ∞) |
| 6 | Flatten | 1, 16384 | 64 × 16 × 16 = 16,384 |
| 7 | Linear | 1, 10 | 10 class scores |

### Neuron Health
- **Most layers**: ✓ Normal (healthy activation)
- **Linear layer**: May show ⚠ Saturated (expected - random weights)
- **ReLU layers**: May show some ⚠ Dead neurons initially (normal for untrained)

---

## 🎨 Tips for Better Testing

### Test Multiple Images
1. Try different images to see different activation patterns
2. Should see different heatmaps for different inputs
3. Output should change based on input

### Visualize Feature Learning
- Look at Conv2d layer heatmaps (layers 1 and 4)
- See what features the network extracts
- Red areas show "important" regions

### Monitor Neuron Health
- Check Activations tab
- See if neurons are healthy or dead
- Dead neurons = no activation
- Saturated = always active

### Compare Layers
- Feature map intensity changes as data flows through network
- Early layers: Simple features (edges, corners)
- Later layers: Complex features (shapes, patterns)

---

## ❓ Common Questions

### Q: Why are output values all similar?
**A**: Model is untrained! With random weights, outputs are essentially random. This is normal and expected for a new model.

### Q: Why is processing time different each run?
**A**: Depends on system load. Usually <1 second.

### Q: Can I modify and re-save?
**A**: Yes! Click "Edit Model" on dashboard → modify architecture → save as new version.

### Q: What if image is different size than 32×32?
**A**: System automatically resizes to 32×32. Any size works!

### Q: Can I create more complex models?
**A**: Absolutely! Add more layers, use different layer types, nest blocks, etc.

---

## 🚀 Next Steps

After testing:

1. **Try Different Architectures**:
   - Add more Conv layers
   - Use different activation functions
   - Add dropout for regularization
   - Use batch normalization blocks

2. **Test More Images**:
   - See how model responds to different inputs
   - Observe activation patterns
   - Learn how CNNs work visually

3. **Create New Versions**:
   - Edit model
   - Add improvements
   - Save as new version
   - Compare versions

4. **Export Model** (Coming Soon):
   - Download as PyTorch code
   - Use in your own projects
   - Train and fine-tune

---

## 📐 Architecture Diagram

```
Input Image (3, 32, 32)
    ↓
Conv2d (3 → 32, k=3) + ReLU
    ↓ (32, 32, 32)
MaxPool2d (k=2, s=2)
    ↓ (32, 16, 16)
Conv2d (32 → 64, k=3) + ReLU
    ↓ (64, 16, 16)
Flatten
    ↓ (16384)
Linear (16384 → 10)
    ↓
Output Logits (10 classes)
```

---

## 🔢 Model Statistics

| Metric | Value |
|--------|-------|
| Total Parameters | ~130,000 |
| Trainable Params | 130,000 |
| Input Size | 3 × 32 × 32 = 3,072 |
| Output Size | 10 |
| Model Type | Classification CNN |
| Inference Time | <500ms |

---

## ✅ Verification Checklist

- [ ] Created model in builder
- [ ] Connected all 7 layers
- [ ] Saved model as "CIFAR10_Simple"
- [ ] Can see model on dashboard
- [ ] Can click "Inference" button
- [ ] Can upload test image
- [ ] Can run inference successfully
- [ ] See results in all 3 tabs
- [ ] No console errors

---

## 🎉 Success!

If all checkboxes above are checked, inference testing is working! 🚀

The application is now fully functional from creation to inference. Congratulations!

---

## 📞 Troubleshooting

### Image upload doesn't work
- Make sure file is PNG or JPG
- File size < 50MB
- Try different image format

### Inference times out
- Model might be too complex
- Restart backend and frontend
- Try simpler model first

### Inference button missing
- Refresh page (F5)
- Clear browser cache (Ctrl+Shift+Delete)
- Check navbar - should have 4 buttons

### No output displayed
- Check browser console (F12)
- Look for red error messages
- Verify backend is running
- Check network tab for failed requests

---

**Happy Testing! 🎉**
