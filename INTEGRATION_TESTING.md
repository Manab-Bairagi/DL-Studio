# Integration Testing Guide - Inference & Visualization Phase

## 🧪 Testing Overview

This document guides you through comprehensive integration testing of the complete inference pipeline.

**Scope**: Backend + Frontend + Database + PyTorch Model

**Duration**: ~30 minutes

**Success Criteria**: 
- ✅ Backend API responds correctly
- ✅ Frontend renders components
- ✅ Image upload works
- ✅ Inference completes successfully
- ✅ Visualizations render properly
- ✅ No console errors

---

## 📋 Pre-Testing Checklist

### 1. Verify Backend is Running
```powershell
# Check if uvicorn is running
# Should see: "Uvicorn running on http://127.0.0.1:8000"
```

### 2. Verify Frontend is Running
```powershell
cd e:\Project_X\frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

### 3. Verify MongoDB Connection
```powershell
# Backend terminal should show no connection errors
# Check: "Successfully connected to MongoDB"
```

### 4. Check Python Environment
```powershell
python -c "import torch, fastapi, PIL; print('✅ All packages OK')"
# Should output: ✅ All packages OK
```

---

## 🔧 Test 1: Backend Health Check

### Purpose
Verify backend is running and accessible

### Steps
```powershell
# 1. Check API health endpoint
curl http://localhost:8000/api/health

# Expected Response:
# {"status": "ok"}
```

### Expected Result
```
Status: 200 OK
Response: {"status": "ok"}
```

---

## 🔑 Test 2: Authentication Flow

### Purpose
Verify auth system works (required for inference)

### Steps
```powershell
# 1. Register a test user
curl -X POST http://localhost:8000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# Expected: 
# {"id": "...", "email": "test@example.com"}
```

### 2. Login
```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Expected Response:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "token_type": "bearer"
# }
```

### Store Token
```powershell
$TOKEN = "your-token-from-response"
```

### Expected Result
✅ User registered and logged in
✅ Valid JWT token received

---

## 📦 Test 3: Create Model for Testing

### Purpose
Create a test model to run inference on

### Steps

#### 1. Create Model
```powershell
curl -X POST http://localhost:8000/api/v1/models `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{
    "name": "TestCNN",
    "description": "Test model for inference",
    "model_type": "classification"
  }'

# Expected Response:
# {"id": "65f8c9...", "name": "TestCNN", ...}
```

Save the `id` as `$MODEL_ID`

#### 2. Create Model Version with Architecture
```powershell
curl -X POST http://localhost:8000/api/v1/models/$MODEL_ID/versions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{
    "architecture": {
      "layers": [
        {"type": "Conv2d", "params": {"in_channels": 3, "out_channels": 32, "kernel_size": 3}},
        {"type": "ReLU", "params": {"inplace": false}},
        {"type": "MaxPool2d", "params": {"kernel_size": 2, "stride": 2}},
        {"type": "Conv2d", "params": {"in_channels": 32, "out_channels": 64, "kernel_size": 3}},
        {"type": "ReLU", "params": {"inplace": false}},
        {"type": "Flatten", "params": {"start_dim": 1}},
        {"type": "Linear", "params": {"in_features": 64, "out_features": 10}}
      ]
    },
    "input_shape": [1, 3, 32, 32],
    "notes": "Simple CNN for CIFAR-10"
  }'

# Expected Response:
# {"id": "...", "version_number": 1, ...}
```

Save the `id` as `$VERSION_ID`

### Expected Result
✅ Model created with valid ID
✅ Version created with architecture
✅ Input shape: [1, 3, 32, 32] (1 batch, 3 channels, 32x32 image)

---

## 🧠 Test 4: Backend Inference Endpoint

### Purpose
Test inference API with raw data

### Steps

#### 1. Get Model Config
```powershell
curl -X GET http://localhost:8000/api/v1/inference/$VERSION_ID/config `
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "input_shape": [1, 3, 32, 32],
#   "architecture": {...},
#   "total_parameters": 12345,
#   "trainable_parameters": 12345
# }
```

#### 2. Run Inference with Random Data
```powershell
# Generate random input (1 × 3 × 32 × 32 = 3072 values)
$input_data = @(0..3071) | ForEach-Object { Get-Random -Maximum 1.0 }

curl -X POST http://localhost:8000/api/v1/inference/run `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d @{
    "version_id": "$VERSION_ID"
    "input_data": $input_data.ToList()
  } | ConvertTo-Json

# Expected Response:
# {
#   "version_id": "...",
#   "output": [0.1, 0.2, ..., 0.15],
#   "output_shape": [1, 10],
#   "processing_time": 0.245,
#   "layer_outputs": [
#     {
#       "layer_name": "0",
#       "layer_type": "Conv2d",
#       "output_shape": [1, 32, 30, 30],
#       "activation_stats": {
#         "min": -0.234,
#         "max": 3.456,
#         "mean": 0.567,
#         "std": 0.789,
#         "median": 0.45
#       },
#       "output_data": [...]
#     },
#     ...
#   ]
# }
```

### Expected Result
✅ Inference completes in <1 second
✅ Output shape matches model output
✅ Layer outputs contain statistics
✅ 7 layer outputs (one per layer)

---

## 🖼️ Test 5: Frontend Components Render

### Purpose
Verify frontend loads without errors

### Steps

#### 1. Open Browser
```
http://localhost:5173/
```

#### 2. Login
- Email: `test@example.com`
- Password: `testpass123`
- Click Login

#### 3. Navigate to Inference Page
- Click "Inference" in navigation (or navigate to `/inference`)

### Expected Result
✅ Page loads
✅ No console errors (F12 → Console)
✅ Model dropdown populated
✅ "Upload Image" button visible

### Check Browser Console
```
F12 → Console tab
Should show: No red errors
May show: Some CORS warnings (OK if API works)
```

---

## 🖼️ Test 6: Image Upload Flow

### Purpose
Test image upload and preview

### Steps

#### 1. Create Test Image
Create a simple test image or use an existing one (PNG/JPG)
- Size: 32×32 pixels (matches model input)
- Or any size (will be auto-resized)

#### 2. Upload Image
- Click "Upload Image" button
- Select the test image file
- Verify preview appears on left side

### Expected Result
✅ Image file selected
✅ File name shown below button
✅ Image preview displayed
✅ Preview correctly resized

---

## 🚀 Test 7: Run Inference from Frontend

### Purpose
Full end-to-end inference pipeline

### Steps

#### 1. Select Model
- Dropdown: "TestCNN"

#### 2. Select Version
- Dropdown: "Version 1"

#### 3. Upload Test Image
- Click "Upload Image"
- Select your test image

#### 4. Run Inference
- Click "Run Inference" button
- Watch loading spinner

### Expected Results

**During Inference**:
✅ Button shows "Running..." with spinner
✅ Page is responsive (not frozen)
✅ Processing completes in <2 seconds

**After Inference**:
✅ Results section appears
✅ Shows:
  - Processing Time: ~245 ms
  - Output Shape: 1 × 10
  - Model Configuration box
✅ Three tabs available:
  - Feature Maps
  - Activations
  - Layer Details

---

## 📊 Test 8: Feature Maps Visualization

### Purpose
Verify heatmap rendering

### Steps

#### 1. Click "Feature Maps" Tab
- Should already be selected after inference

#### 2. Verify Canvas Renders
- Should see colorful heatmap image
- Colors: Blue → Green → Yellow → Red
- Size: 256×256 pixels

#### 3. Select Different Layers
- Dropdown: Change between layers
- Each layer should show different heatmap
- Canvas updates when selection changes

#### 4. Check Layer Info Panel
- Shows layer name
- Shows output shape
- Shows activation statistics (min, max, mean, std, median)
- Shows color scale legend

### Expected Result
✅ Heatmap renders correctly
✅ Colors vary by activation value
✅ Layer selection works
✅ Statistics display correctly
✅ No visual glitches

---

## 📈 Test 9: Activation Visualizer

### Purpose
Verify activation statistics and health analysis

### Steps

#### 1. Click "Activations" Tab

#### 2. Verify Global Statistics
- Shows: Global Min, Max, Range, Total Layers
- Numbers make sense (e.g., Range > 0)

#### 3. Check Layer Table
- Lists all 7 layers
- Columns: Layer, Type, Min, Max, Mean, Std, Activation Bar, Status
- Each row has complete data

#### 4. Check Status Indicators
- Most show: ✓ Normal (green)
- Some may show: ⚠ Dead (red) - acceptable for test
- Some may show: ⚠ Saturated (orange) - acceptable for test

#### 5. Check Activation Bars
- Each layer has colored bar
- Bar fills proportionally to mean activation
- Colors: Blue, Green, Yellow, Red gradients

#### 6. Check Legend
- Shows three status types with descriptions
- Color explanations visible

### Expected Result
✅ All statistics display
✅ No NaN or undefined values
✅ Table scrollable if needed
✅ Color coding consistent
✅ Status indicators accurate

---

## 📋 Test 10: Layer Details Tab

### Purpose
Verify detailed layer statistics

### Steps

#### 1. Click "Layer Details" Tab

#### 2. Verify Table Displays
- Headers: Layer, Type, Output Shape, Min, Max, Mean, Std
- All 7 rows present
- Data matches other tabs

#### 3. Verify Values
- Min < Max (always true)
- Mean between Min and Max
- Std > 0 (usually)
- Output Shape non-empty

#### 4. Check Formatting
- Numbers formatted to 4 decimal places
- Shapes formatted as "1 × 32 × 30 × 30"
- No scientific notation (e.g., 1e-5)

### Expected Result
✅ All data displays correctly
✅ Table is readable
✅ Numbers properly formatted
✅ No missing values

---

## 🔄 Test 11: Different Model Test

### Purpose
Verify pipeline works with different architectures

### Steps

#### 1. Create Second Model
```
POST /api/v1/models
{
  "name": "TestLinear",
  "description": "Simple linear model",
  "model_type": "classification"
}
```

#### 2. Add Version with Different Architecture
```
POST /api/v1/models/{id}/versions
{
  "architecture": {
    "layers": [
      {"type": "Flatten", "params": {"start_dim": 1}},
      {"type": "Linear", "params": {"in_features": 3072, "out_features": 128}},
      {"type": "ReLU", "params": {"inplace": false}},
      {"type": "Linear", "params": {"in_features": 128, "out_features": 10}}
    ]
  },
  "input_shape": [1, 3, 32, 32]
}
```

#### 3. Test Inference
- Select new model
- Upload same image
- Run inference

### Expected Result
✅ Different model loads
✅ Different number of layers (4 vs 7)
✅ Inference completes
✅ Results display correctly

---

## ⚡ Test 12: Error Handling

### Purpose
Verify system handles errors gracefully

### Test Case 1: Missing Model
```powershell
curl http://localhost:8000/api/v1/inference/invalid-id/config `
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

### Test Case 2: Invalid Image Format
- Try uploading non-image file
- Should show error message

### Test Case 3: Unauthorized Access
```powershell
curl http://localhost:8000/api/v1/inference/run `
  -H "Content-Type: application/json" `
  -d '{"version_id": "...", "input_data": [...]}'
# No auth header

# Expected: 403 Forbidden or 401 Unauthorized
```

### Expected Result
✅ 404 for missing resources
✅ 403 for unauthorized access
✅ User-friendly error messages
✅ No server crashes

---

## 📝 Test 13: Console Check

### Purpose
Verify no critical errors in browser/server

### Steps

#### 1. Browser Console (F12)
- No red error messages
- Warnings acceptable
- Network tab shows successful requests

#### 2. Backend Terminal
- No exception traces
- Inference endpoint called: "POST /inference/run"
- Response times logged

#### 3. Check Logs
```powershell
# Backend should show:
# INFO:     "POST /api/v1/inference/run HTTP/1.1" 200
```

### Expected Result
✅ No critical errors
✅ All requests successful (200, 201, 204)
✅ 0 failing API calls
✅ Clean console output

---

## 🎯 Test 14: Performance Check

### Purpose
Verify system performance

### Metrics to Track

#### Backend Performance
- Inference time: <500ms (target: <250ms)
- Model building time: <1s (first time, then cached)
- API response: <100ms overhead

#### Frontend Performance
- Page load: <2 seconds
- Visualization rendering: <500ms
- No UI freezing

#### Test Command
```powershell
# Run inference 3 times and record times
Measure-Command {
  curl http://localhost:8000/api/v1/inference/run `
    -H "Authorization: Bearer $TOKEN" `
    -H "Content-Type: application/json" `
    -d '{...}'
}
```

### Expected Result
✅ Average time < 1 second
✅ Consistent performance across runs
✅ No memory leaks (RAM stable)

---

## 📊 Test 15: Data Validation

### Purpose
Verify API responses contain correct data

### Checks

#### 1. InferenceResponse Structure
```json
{
  "version_id": "string",
  "output": [number, ...],
  "output_shape": [number, ...],
  "layer_outputs": [LayerOutput, ...],
  "processing_time": number
}
```

#### 2. LayerOutput Structure
```json
{
  "layer_name": "string",
  "layer_type": "string",
  "output_shape": [number, ...],
  "activation_stats": {
    "min": number,
    "max": number,
    "mean": number,
    "std": number,
    "median": number
  },
  "output_data": [number, ...]
}
```

#### 3. Validate Values
- No NaN or Infinity values
- Min ≤ Mean ≤ Max
- Std ≥ 0
- Processing time > 0
- Layer outputs non-empty

### Expected Result
✅ Response structure valid
✅ All fields present
✅ No invalid values
✅ Data types correct

---

## 📋 Test Summary Checklist

| Test | Status | Notes |
|------|--------|-------|
| Backend Health | ⬜ | |
| Authentication | ⬜ | |
| Model Creation | ⬜ | |
| Model Config | ⬜ | |
| Backend Inference | ⬜ | |
| Frontend Components | ⬜ | |
| Image Upload | ⬜ | |
| Frontend Inference | ⬜ | |
| Feature Maps | ⬜ | |
| Activations Tab | ⬜ | |
| Layer Details Tab | ⬜ | |
| Different Model | ⬜ | |
| Error Handling | ⬜ | |
| Console Errors | ⬜ | |
| Performance | ⬜ | |
| Data Validation | ⬜ | |

---

## 🎉 Final Checklist

When all tests pass:

- [ ] No server crashes
- [ ] No console errors
- [ ] All visualizations render
- [ ] Inference completes
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Data validation passes

---

## 🐛 Troubleshooting

### Issue: 404 Model Not Found
**Solution**: Make sure you saved the MODEL_ID from step 3

### Issue: Image upload doesn't work
**Solution**: Check file format is PNG/JPG, and size < 50MB

### Issue: Inference times out
**Solution**: Try with smaller model or restart backend

### Issue: Visualizations don't render
**Solution**: Check browser console for errors, refresh page

### Issue: Authorization fails
**Solution**: Make sure TOKEN is valid and not expired

---

## ✅ Success Criteria

Your integration testing is **COMPLETE** when:

1. ✅ All 15 tests pass
2. ✅ No critical errors in console
3. ✅ All visualizations render
4. ✅ Inference pipeline end-to-end works
5. ✅ Performance acceptable (<1s total)
6. ✅ Error handling graceful

---

## 🚀 Next Steps After Testing

Once integration testing complete:

1. Deploy to production
2. Set up monitoring
3. Enable caching for performance
4. Add batch inference support
5. Implement model export functionality
6. Add more visualization options

---

## 📞 Support

If tests fail:
1. Check backend is running: `uvicorn backend.main:app --reload`
2. Check frontend is running: `npm run dev`
3. Check MongoDB is running
4. Check network connectivity
5. Review error messages in console

Good luck! 🚀
