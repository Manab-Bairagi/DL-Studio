# Testing Layer Visualization Features

## Prerequisites

Make sure both backend and frontend servers are running:

```powershell
# Terminal 1: Backend
cd e:\Project_X\backend
python -m uvicorn main:app --reload

# Terminal 2: Frontend
cd e:\Project_X\frontend
npm run dev
```

## Step-by-Step Test

### 1. Create or Load a Model

First, create a CNN model using the **Visual Model Builder** (if you haven't already):

- Go to **Models** → **Create New Model**
- Name: "Test CNN"
- Add layers:
  1. **Conv2d** - in_channels=3, out_channels=16, kernel_size=3
  2. **ReLU**
  3. **MaxPool2d** - kernel_size=2
  4. **Conv2d** - in_channels=16, out_channels=32, kernel_size=3
  5. **ReLU**
  6. **MaxPool2d** - kernel_size=2
  7. **Flatten**
  8. **Dense** - units=10
- Save as new version
- Go to Models → View the model
- Click **"Edit Model"** button
- Verify layers show edit/delete buttons ✓
- Add a new layer (should NOT replace first layer) ✓

### 2. Run Inference

- Go to **Inference & Visualization**
- Select the "Test CNN" model
- Select the latest version
- **Upload an image** (any 32×32 or similar image):
  - Use a sample CIFAR-10 image
  - Or upload any small image file
- Click **"Run Inference"** button
- Wait for processing to complete

### 3. Explore Layer Processing Tab

Once inference completes:

1. **Click "Layer Processing" tab** (first tab)
2. You should see:
   - **Layer Processing Visualization** on the left
   - **Layer Pipeline** list on the right
   - Shows the **Input Image** if on first layer
   - Feature map as a **heatmap** (colored grid)

3. **Test the controls**:
   - Click **"Play"** to auto-advance through layers
   - Click **"Pause"** to stop
   - Use **"Next"** and **"Previous"** buttons
   - Drag the **speed slider** to change animation speed
   - Click any layer in the **Layer Pipeline** to jump to it
   - Click rows in the **summary table** to navigate

4. **Observe the data**:
   - Early layers (Conv2d) show detailed feature maps
   - Middle layers show more abstract features
   - Late layers (Flatten, Dense) show reduced dimensions
   - Statistics (min/max/mean) update for each layer

### 4. Explore Kernel Animation Tab

1. **Click "Kernel Animation" tab** (second tab)
2. You should see:
   - **Input feature map** (grid on the left)
   - **Red box** showing kernel position
   - **Output grid** (small grid on the right, red highlight shows output)
   - **Blue arrow** showing data flow

3. **Test the controls**:
   - Click **"Play"** to animate kernel movement
   - Drag the **progress slider** to see different kernel positions
   - Click **"Reset"** to go back to start
   - Select different Conv layers from the **Convolutional Layers** list
   - Watch the kernel move position-by-position across the input

4. **Understanding the visualization**:
   - As kernel moves right → output grid updates
   - Each kernel position processes a 3×3 (or kernel_size) region
   - Output shows where each position's result appears
   - Numbers in the "Layer Info" card show the actual activation values

### 5. Compare Other Tabs

- **Feature Maps**: Shows all outputs, select individual channels
- **Activations**: Shows statistics and distributions
- **Layer Details**: Table with all layer information

## Expected Behavior

### Model Editing Fix ✓
- ✅ Loaded layers show **edit (settings)** and **delete** buttons
- ✅ New layers added get **unique IDs** (layer_1, layer_2, etc.)
- ✅ New layers **don't replace** existing layers
- ✅ Adding layers after save works correctly

### Layer Processing Visualization ✓
- ✅ Steps through all layers sequentially
- ✅ Shows heatmap for each layer's activation
- ✅ Playback controls work smoothly
- ✅ Speed control changes animation rate
- ✅ Layer jumping works instantly
- ✅ Statistics update correctly

### Kernel Animation ✓
- ✅ Shows convolution kernel sliding across input
- ✅ Red box highlights current kernel position
- ✅ Output grid updates with each position
- ✅ Animation is smooth and clear
- ✅ Play/pause/reset work correctly
- ✅ Manual slider control works

## Troubleshooting

### Issue: Inference fails with shape mismatch
**Solution**: The backend now auto-calculates Linear layer dimensions. If you still see this error, check:
- Backend server is using the latest code
- Model was saved with correct input shape
- Restart backend server

### Issue: Visualizer doesn't show data
**Solution**: 
- Make sure inference completed successfully (check Layer Details tab)
- Verify the image was properly uploaded
- Check browser console for errors (F12)

### Issue: Kernel animation doesn't move
**Solution**:
- Click **"Play"** button first
- Make sure you selected a convolutional layer
- If no Conv layers appear, the model might not have any Conv2d layers

### Issue: Edit/delete buttons don't appear on saved layers
**Solution** (now fixed):
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh the page (F5)
- Try editing the model again

## Success Indicators

When everything works correctly, you should see:

1. ✅ Model loads with all layers visible
2. ✅ All layers have edit/delete buttons
3. ✅ New layers get unique names
4. ✅ Inference runs without shape errors
5. ✅ Layer Processing tab shows heatmaps for all layers
6. ✅ Playback controls animate smoothly
7. ✅ Kernel Animation tab shows animated convolution
8. ✅ Statistics update for each layer
9. ✅ Can navigate to any layer by clicking

## Performance Notes

- First inference may take 2-5 seconds (model building + inference)
- Subsequent inferences with same model are faster
- Layer animation is smooth even with many layers
- Heatmap generation happens in real-time (no server calls)

