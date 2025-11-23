# 🧪 Testing Guide - Verify All Features

## Pre-Test Checklist

- [ ] Backend running: `http://localhost:8000`
- [ ] Frontend running: `http://localhost:5173`
- [ ] You have at least one model created in Model Builder
- [ ] You're logged in to the application

---

## Test 1: Model Selection Dropdown

### Expected Behavior
- Model dropdown appears at top of Optimization page
- Shows all your created models
- Displays layer count for each model

### Steps
```
1. Go to Model Optimization page
2. Look for dropdown under back button
3. See message: "Select Model:"
4. Dropdown shows your models (e.g., "MyModel (8 layers)")
5. Click dropdown arrow
6. Select different model
7. Message updates: "✅ Model selected: X layers to optimize"
```

### Pass/Fail
- ✅ **PASS**: Dropdown works, shows models with layer counts
- ❌ **FAIL**: "No models found" or empty dropdown

**If FAIL**: Check backend `/api/v1/models` endpoint is working

---

## Test 2: Noise Level Configuration

### Expected Behavior
- Noise level dropdown appears in Tab 1
- Can select: None, Low, Medium, High
- Selection appears in generated dataset info

### Steps
```
1. Go to Optimization page
2. Tab 1 - Dataset Visualizer (should be default)
3. Scroll down past sample count, image width/height, classes
4. See dropdown labeled "Noise Level"
5. Click dropdown
6. See options: None, Low, Medium, High
7. Select "High"
8. Click "Generate Dataset Stats"
9. After generation, see results card showing "Noise Level: High"
```

### Pass/Fail
- ✅ **PASS**: Dropdown appears, all options work, shows in results
- ❌ **FAIL**: No dropdown or shows nothing

**If FAIL**: File `DatasetVisualizer.tsx` may not have saved correctly

---

## Test 3: Augmentation Toggle

### Expected Behavior
- Augmentation dropdown appears in Tab 1
- Can select: "No Augmentation" or "With Augmentation (...)"
- Selection appears in generated dataset info

### Steps
```
1. Still in Tab 1 - Dataset Visualizer
2. Below Noise Level, see "Data Augmentation" dropdown
3. Default shows "No Augmentation"
4. Click dropdown
5. See two options:
   - "No Augmentation"
   - "With Augmentation (Rotation, Flip, Scale)"
6. Select second option
7. Click "Generate Dataset Stats"
8. Results card shows "Augmentation: Yes"
```

### Pass/Fail
- ✅ **PASS**: Dropdown works, both options functional, shows in results
- ❌ **FAIL**: Dropdown missing or won't change

---

## Test 4: Dataset Info in Simulator

### Expected Behavior
- Tab 3 shows green info box
- Displays: samples, image size, noise level, augmentation
- Updates when you change dataset settings

### Steps
```
1. In Tab 1, generate dataset:
   - Samples: 1000
   - Size: 224x224
   - Classes: 10
   - Noise: "Medium"
   - Augmentation: "Yes"
   - Click "Generate Dataset Stats"

2. Go to Tab 3 - Training Simulator

3. Look for green box at top saying:
   "✅ Dataset attached: 1000 samples, 224x224 images, 
    Noise: Medium, Augmentation: Yes"

4. Go back to Tab 1

5. Change settings:
   - Samples: 5000
   - Noise: "High"
   - Augmentation: "No"
   - Generate again

6. Go to Tab 3

7. Green box now shows:
   "✅ Dataset attached: 5000 samples, 224x224 images,
    Noise: High, Augmentation: No"
```

### Pass/Fail
- ✅ **PASS**: Green box appears, updates with dataset changes
- ⚠️ **PARTIAL**: Green box appears but doesn't update
- ❌ **FAIL**: No box or shows warning instead

**If FAIL**: Check TrainingSimulator.tsx passed datasetStats correctly

---

## Test 5: Training Curves Respond to Dataset

### Expected Behavior
- Same model, different datasets = different training curves
- High noise = slower convergence, higher loss
- More data = faster convergence

### Steps
```
1. Select a model from dropdown

2. Create Dataset A:
   - 5000 samples
   - Noise: "None"
   - Augmentation: "No"
   - Generate

3. Go to Tab 3, run simulation:
   - Click "Start"
   - Wait for ~5-10 epochs
   - Pause (click pause button)
   - Note: convergence speed and final loss

4. Return to Tab 1

5. Create Dataset B:
   - 5000 samples (same)
   - Noise: "High"
   - Augmentation: "No"
   - Generate

6. Go to Tab 3:
   - Click "Reset"
   - Click "Start"
   - Wait same ~5-10 epochs
   - Pause

7. Compare:
   - Dataset B (high noise) should have:
     - Slower convergence
     - Higher loss values
     - More noisy curves
```

### Pass/Fail
- ✅ **PASS**: Curves visibly different, high noise = slower
- ⚠️ **PARTIAL**: Different but subtle difference
- ❌ **FAIL**: Curves identical regardless of noise

**If FAIL**: simulateEpoch function may not be using dataset properties

---

## Test 6: Augmentation Improves Convergence

### Expected Behavior
- Same model and noise level
- WITH augmentation = faster convergence
- WITHOUT augmentation = slower convergence

### Steps
```
1. Create Dataset C:
   - 1000 samples
   - Noise: "Medium"
   - Augmentation: "No"
   - Generate

2. Run 20 epoch simulation in Tab 3
   - Note final accuracy

3. Return to Tab 1

4. Create Dataset D:
   - 1000 samples (same)
   - Noise: "Medium" (same)
   - Augmentation: "Yes" (DIFFERENT)
   - Generate

5. Tab 3, reset and run same 20 epochs

6. Compare:
   - Dataset D should reach ~0.8-1% higher accuracy
   - Dataset D should converge slightly faster
```

### Pass/Fail
- ✅ **PASS**: With augmentation shows improvement
- ⚠️ **PARTIAL**: Same results (augmentation not applied)
- ❌ **FAIL**: Without augmentation is better (reversed logic)

---

## Test 7: No Compilation Errors

### Expected Behavior
- Frontend loads without errors in console
- No red error boxes
- All components render

### Steps
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Optimization page
4. Check for errors (red messages)
5. Look for TypeScript compilation errors
6. Should see only normal logs (if any)
```

### Pass/Fail
- ✅ **PASS**: No errors, clean console
- ⚠️ **PARTIAL**: Minor warnings only (OK)
- ❌ **FAIL**: Red errors in console

---

## Complete Test Scenario

### Do this to fully verify everything works:

```
1. CREATE A TEST MODEL (if you haven't)
   - Go to Model Builder
   - Create simple model (5-10 layers)
   - Save it as "TestModel"

2. GO TO OPTIMIZATION PAGE
   - See model dropdown ✅
   - Select TestModel ✅
   - See "5 layers to optimize" message ✅

3. CONFIGURE DATASET - TAB 1
   - Samples: 2000
   - Width: 224
   - Height: 224
   - Classes: 10
   - Noise: "Medium" ← NEW FEATURE
   - Augmentation: "Yes" ← NEW FEATURE
   - Click Generate

4. GET HYPERPARAMETER SUGGESTIONS - TAB 2
   - See recommendations for TestModel ✅
   - Recommendations based on your model (not empty) ✅

5. RUN TRAINING SIMULATION - TAB 3
   - See green box with dataset info ✅
   - Shows "2000 samples, 224x224, Noise: Medium, Augmentation: Yes" ✅
   - Click Start
   - Observe training curves ✅
   - Both loss and accuracy show realistic progression ✅

6. CHANGE DATASET AND RETEST
   - Go back to Tab 1
   - Change to Noise: "High"
   - Generate again
   - Go to Tab 3
   - Click Reset
   - Click Start
   - Observe slower convergence than before ✅

7. ALL TESTS PASS ✅
```

---

## Troubleshooting Issues

### Issue: "Model dropdown says 'No models found'"
**Cause**: Backend not returning models
**Solution**:
- Check backend is running (`http://localhost:8000`)
- Check API endpoint `/api/v1/models` works
- Verify auth token is valid (stored in localStorage)
- Create a model in Model Builder first

---

### Issue: "Noise level dropdown missing"
**Cause**: DatasetVisualizer component not updated
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Kill frontend dev server, restart with `npm run dev`
- Verify file `DatasetVisualizer.tsx` has MenuItem imports

---

### Issue: "Dataset info not showing in Tab 3"
**Cause**: Props not passed correctly or component not checking
**Solution**:
- Verify datasetStats prop in ModelOptimizationPage
- Check TrainingSimulator receives it
- Verify the alert is actually in the JSX

---

### Issue: "Training curves same regardless of noise"
**Cause**: simulateEpoch not using dataset properties
**Solution**:
- Check if datasetStats exists in component state
- Verify simulateEpoch has the new logic with noise multiplier
- Check const noiseMultiplier exists with correct values

---

## Success Message

When everything works, you'll see:

```
✅ ModelOptimizationPage with your model selected
✅ Tab 1 with Noise Level and Augmentation dropdowns
✅ Generated dataset showing all your settings
✅ Tab 3 with green info box showing your exact dataset config
✅ Training curves that respond to noise levels
✅ High noise creates slower, higher-loss curves
✅ Augmentation improves convergence
✅ No errors in browser console
```

---

## Report Issues

If any test fails:
1. Note which test number failed
2. Screenshot the issue
3. Check browser console (F12) for error messages
4. Verify backend is running
5. Clear cache and restart

---

## Checkpoints

```
[ ] Test 1: Model Selection - PASS
[ ] Test 2: Noise Configuration - PASS
[ ] Test 3: Augmentation Toggle - PASS
[ ] Test 4: Dataset Info Display - PASS
[ ] Test 5: Curves Respond to Noise - PASS
[ ] Test 6: Augmentation Improves - PASS
[ ] Test 7: No Compilation Errors - PASS

[ ] Complete Test Scenario - PASS

✅ ALL TESTS PASS = System Ready for Use
```
