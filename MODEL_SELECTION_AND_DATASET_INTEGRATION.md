# Model Selection & Dataset Integration Guide

## ✨ What's New

The Model Optimization Page has been completely upgraded with three critical features:

### 1. **Model Selection Dropdown**
- **Location**: Top of the Optimization page (under the back button)
- **Purpose**: Select which of your created models to optimize
- **How it works**:
  - Automatically fetches all your saved models from the backend
  - Shows model name and layer count for each option
  - Updates the analysis tools with your model's architecture
  - No more empty arrays - your real model is analyzed!

### 2. **Noise Configuration for Synthetic Data**
- **Location**: Tab 1 - Dataset Visualizer
- **Purpose**: Simulate real-world image degradation
- **Options**:
  - **None**: Perfect, pristine images
  - **Low**: Minor artifacts, slight degradation
  - **Medium**: Moderate noise and blur (typical real-world conditions)
  - **High**: Significant noise (challenging conditions)

### 3. **Dataset Augmentation Toggle**
- **Location**: Tab 1 - Dataset Visualizer
- **Purpose**: Enable realistic data transformations
- **Options**:
  - **No Augmentation**: Pure synthetic data
  - **With Augmentation**: Rotation, Flip, Scale (improves model robustness)

---

## 🔄 Complete Data Flow

### Step 1: Select Your Model
```
You → "Model Optimization" page
  ↓
Select model from dropdown
  ↓
Your model's architecture is loaded (nodes & layers)
```

### Step 2: Configure & Generate Dataset
```
Tab 1: Dataset Visualizer
  ↓
1. Set total samples (1000, 5000, 10000+)
2. Set image size (224x224, 256x256, etc.)
3. Set number of classes
4. Set NOISE LEVEL ← NEW! 
5. Set AUGMENTATION ← NEW!
6. Click "Generate Dataset Stats"
  ↓
Dataset statistics saved in memory
```

### Step 3: Get Hyperparameter Recommendations
```
Tab 2: Hyperparameter Suggestions
  ↓
Analyzes YOUR MODEL'S architecture
  ↓
Returns recommendations based on:
  - Layer count
  - Layer types (Conv, Dense, etc.)
  - Your model's complexity
```

### Step 4: Simulate Training with Your Dataset
```
Tab 3: Training Simulator
  ↓
Shows: "✅ Dataset attached: 1000 samples, 224x224 images, Noise: Medium, Augmentation: Yes"
  ↓
Training curve CHANGES based on dataset properties:
  - More samples → faster convergence
  - High noise → slower convergence, higher loss
  - Augmentation → improved convergence
  ↓
Simulate epochs to test your model's performance
```

---

## 📊 How Dataset Affects Simulation

The training simulator now uses your dataset configuration to adjust the simulation:

### Factors That Impact Training Curves:

**1. Dataset Size**
- More samples = faster convergence (fewer epochs needed)
- Fewer samples = slower convergence, more variance

**2. Noise Level**
- **None**: Baseline convergence
- **Low**: 15% slower convergence, higher final loss
- **Medium**: 35% slower convergence, higher final loss
- **High**: 60% slower convergence, highest final loss

**3. Augmentation**
- **Disabled**: Training uses exact dataset
- **Enabled**: ~8% improvement in convergence (fewer epochs needed)

**Example Comparison**:
- Dataset A: 10,000 samples, No noise, No augmentation
  - Converges in ~30 epochs
  - Final loss: ~0.15
  
- Dataset B: 1,000 samples, High noise, With augmentation
  - Converges in ~50+ epochs
  - Final loss: ~0.35

---

## 🎯 Usage Workflow

### Scenario 1: Test Your Model Architecture
```
1. Select your model
2. Go to Tab 1 → Generate dataset with default settings
3. Tab 2 → Review hyperparameter suggestions
4. Tab 3 → Start simulation to see predicted training curves
5. Check if model trains well with realistic data
```

### Scenario 2: Compare Noise Robustness
```
1. Select your model
2. Tab 1 → Generate dataset with "No" noise
3. Tab 3 → Run simulation (baseline)
4. Go back to Tab 1 → Generate dataset with "High" noise
5. Tab 3 → Compare training curves
   → See how much noise impacts your model
```

### Scenario 3: Optimize with Augmentation
```
1. Select your model
2. Tab 1 → Generate dataset WITHOUT augmentation
3. Tab 3 → Run simulation (baseline training)
4. Go back to Tab 1 → Generate same dataset WITH augmentation
5. Tab 3 → See faster convergence with augmentation
6. Decide if augmentation is worth the extra compute
```

---

## 🔍 Reading the Results

### Success Indicators:
- ✅ Model dropdown shows your model with layer count
- ✅ Tab 1 displays generated dataset stats with noise level
- ✅ Tab 3 shows "Dataset attached" message with your dataset info
- ✅ Training curves update realistically based on dataset config

### Dataset Info Card (Tab 3)
```
✅ Dataset attached: 5000 samples, 224x224 images, Noise: Medium, Augmentation: Yes
```
This tells you:
- **5000 samples** from your synthetic dataset
- **224x224** image dimensions
- **Medium noise** is affecting training (harder to learn)
- **Augmentation enabled** (helping convergence)

---

## ⚠️ Important Notes

1. **Synthetic Data** - All datasets are synthetically generated for simulation purposes
2. **Real Training** - For production, use real labeled datasets
3. **Simulation vs Reality** - Simulations are idealized; real training may vary
4. **Multiple Tests** - Test different configurations to find your optimal setup

---

## 📝 Examples

### Example 1: ResNet-like Model, Realistic Dataset
```
Model: 18 layers (ResNet-18 equivalent)
Dataset: 50,000 samples, 224x224, Noise: Low, Augmentation: Yes

Expected: Converges in ~20-30 epochs to ~0.8 accuracy
Why: Large model, plenty of data, light noise, augmentation helps
```

### Example 2: Simple 3-Layer CNN, Limited Data
```
Model: 3 layers (Simple CNN)
Dataset: 1,000 samples, 128x128, Noise: High, Augmentation: No

Expected: Converges slowly (30-40 epochs), lower final accuracy
Why: Limited data, high noise makes learning hard
```

### Example 3: Medium Model, Good Conditions
```
Model: 8 layers (Medium CNN)
Dataset: 10,000 samples, 224x224, Noise: None, Augmentation: Yes

Expected: Converges well in ~15-25 epochs to ~0.85+ accuracy
Why: Balanced model, good data quality, augmentation boost
```

---

## 🚀 Next Steps

1. **Generate Different Datasets** - Try various noise and augmentation combinations
2. **Compare Models** - Test different architectures against the same dataset
3. **Export Results** - Use simulation results to guide real training parameters
4. **Iterate** - Refine model and dataset based on simulation outcomes

---

## 🆘 Troubleshooting

**Q: "No models found" error**
- A: Create a model in the Model Builder first, then return to Optimization

**Q: Dataset not affecting training curves**
- A: Ensure you generated a dataset in Tab 1 and it shows in Tab 3's info message

**Q: Simulation always shows same curves**
- A: Try changing noise level or dataset size - curves should change significantly

**Q: My model isn't showing in the dropdown**
- A: Refresh the page or check backend connection (`http://localhost:8000`)
