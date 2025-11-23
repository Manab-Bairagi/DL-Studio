# Component Usage Guide

## Overview
Three powerful components have been upgraded to help you design and optimize deep learning models:

1. **HyperparameterSuggestions** - AI-powered hyperparameter recommendations
2. **DatasetVisualizer** - Dataset analysis and visualization
3. **TrainingSimulator** - Training simulation and convergence testing

---

## 1. HyperparameterSuggestions Component

### Purpose
Automatically analyzes your model architecture and suggests optimal hyperparameters.

### Features
- **Architecture Analysis**: Examines the number and types of layers in your model
- **Smart Recommendations**: Provides learning rate, batch size, optimizer, and regularization suggestions
- **Impact Assessment**: Shows high/medium/low impact for each suggestion
- **Category Organization**: Groups suggestions by learning, regularization, architecture, and optimization

### How to Use

#### Basic Integration
```tsx
import { HyperparameterSuggestions } from './components/HyperparameterSuggestions'

<HyperparameterSuggestions 
  nodes={modelNodes}
  edges={modelEdges}
  onApplySuggestions={(suggestions) => {
    console.log('Applied suggestions:', suggestions)
    // Apply to your model training configuration
  }}
/>
```

#### What It Analyzes
1. **Model Depth** (>50 layers)
   - Suggests reducing depth or using careful initialization
   
2. **Convolutional Layers** (>20 Conv2d)
   - Recommends BatchNorm between layers for stability
   
3. **Dense Layers** (>5 Fully Connected)
   - Suggests Dropout regularization to prevent overfitting
   
4. **Learning Rate**
   - Deep models (>30 layers): 0.0001-0.0005
   - Shallow models (<10 layers): 0.001-0.01
   - Medium models: 0.001
   
5. **Batch Size**
   - Large models (>20 layers): 64-128
   - Medium models: 32-64
   - Small models: 32
   
6. **Optimizer**
   - Deep models: Adam or AdamW
   - Shallow models: SGD or Adam
   
7. **Regularization**
   - Dropout: Adjusted based on model complexity
   - L2: Applied to Dense layers

#### Output Structure
```typescript
{
  learningRate: 0.0001,      // Recommended LR
  batchSize: 128,            // Recommended batch size
  optimizer: "adamw",        // Recommended optimizer
  epochs: 150,               // Recommended number of epochs
  dropout: 0.3,              // Recommended dropout rate
  l2Regularization: 0.0001,  // Recommended L2 regularization
  reason: "Model complexity: 35 layers, BatchNorm detected..."
}
```

#### UI Components
- **Details Toggle**: View full analysis or summary view
- **Progress Indicator**: Shows which aspect is being analyzed
- **Impact Color Coding**: Red (high), yellow (medium), green (low)
- **Apply Button**: Easy button to apply suggestions to your configuration

### Best Practices
✅ Analyze your model **after adding all layers** for accurate suggestions
✅ Use suggestions as **starting points** - fine-tune based on your data
✅ Pay attention to **high-impact** suggestions first
✅ Consider your **dataset size** when adjusting recommendations

---

## 2. DatasetVisualizer Component

### Purpose
Analyze, visualize, and simulate dataset statistics to understand your data before training.

### Features
- **Upload Real Datasets**: Support for ZIP, TAR, and image files
- **Generate Synthetic Stats**: Create realistic dataset statistics for testing
- **Visual Analytics**: Bar and pie charts for class distribution
- **Pixel Statistics**: Mean, std, min, and max pixel values
- **Configurable Parameters**: Customize dataset size, image dimensions, and classes

### How to Use

#### Basic Integration
```tsx
import { DatasetVisualizer } from './components/DatasetVisualizer'

<DatasetVisualizer
  onDatasetLoad={(stats) => {
    console.log('Dataset loaded:', stats)
    // Update your model training configuration with dataset info
  }}
/>
```

#### Configuration Parameters
```
Total Samples:   1-100,000+ (number of training samples)
Image Width:     1-4096 (default: 224)
Image Height:    1-4096 (default: 224)
Num Classes:     1-1000+ (number of classification categories)
```

#### Output Statistics
```typescript
{
  totalSamples: 1000,
  imageSize: [224, 224],
  channels: 3,                    // RGB
  classDistribution: {
    "Class 0": 100,
    "Class 1": 100,
    // ... more classes
  },
  meanPixelValue: 128,           // Average brightness
  stdPixelValue: 52,             // Brightness variation
  minPixelValue: 0,              // Darkest pixel
  maxPixelValue: 255             // Brightest pixel
}
```

#### UI Sections

**1. Configuration (Before Generation)**
- Input fields for dataset parameters
- "Generate Dataset Stats" button
- "Upload Dataset" button

**2. Summary Cards (After Generation)**
- Total Samples
- Image Size
- Mean/Std Pixel Values
- Pixel Range

**3. Visualizations**
- **Bar Chart**: Shows samples per class
- **Pie Chart**: Visualizes class distribution percentages

#### Use Cases

**For Model Sizing**
```
Large dataset (>10K samples) → Can use larger models
Small dataset (<1K samples) → Use transfer learning or data augmentation
Balanced dataset → Standard training works well
Imbalanced dataset → Use class weights or resampling
```

**For Input Configuration**
```
Image Size 224x224 → Standard ImageNet-like models
Image Size 512x512 → Larger input, more computational cost
RGB (3 channels) → Use Conv2d layers
Grayscale (1 channel) → Adjust input layer
```

### Best Practices
✅ Generate stats **before building your model** to inform architecture
✅ Check **class distribution** for imbalance issues
✅ Upload **representative samples** from your real dataset
✅ Use **pixel statistics** to determine normalization parameters
✅ Consider **image size vs computation trade-off**

---

## 3. TrainingSimulator Component

### Purpose
Simulate model training without needing real data to test architectures and estimate convergence time.

### Features
- **Realistic Simulations**: Models actual training curves with noise and overfitting
- **Adjustable Parameters**: Control epochs, batch size, learning rate, optimizer
- **Speed Control**: Variable simulation speed for quick testing or detailed observation
- **Real-time Metrics**: Track loss, accuracy, and convergence
- **Multiple Charts**: Loss and accuracy curves for training and validation

### How to Use

#### Basic Integration
```tsx
import { TrainingSimulator } from './components/TrainingSimulator'

<TrainingSimulator
  nodes={modelNodes}
  edges={modelEdges}
/>
```

#### Configuration Parameters

**Training Config**
```
Epochs:        1-500 (number of training iterations)
Batch Size:    1-512 (samples per iteration)
Learning Rate: 0.00001-0.1 (logarithmic scale)
Optimizer:     adam, sgd, rmsprop, adagrad
```

**Simulation Speed**
```
100ms/epoch   → Very fast, hard to see details
500ms/epoch   → Medium speed, good for observation
1000ms/epoch  → Slower, detailed observation
2000ms/epoch  → Very slow, detailed analysis
```

#### Output Metrics
```typescript
{
  epoch: 1,
  trainLoss: 2.45,      // Training loss
  valLoss: 2.52,        // Validation loss
  trainAcc: 0.25,       // Training accuracy
  valAcc: 0.24          // Validation accuracy
}
```

#### UI Components

**1. Parameter Controls**
- Epoch slider
- Batch size input
- Optimizer dropdown
- Learning rate display

**2. Learning Rate Slider**
- Logarithmic scale from 0.00001 to 0.1
- Pre-marked values for quick selection
- Disabled during training

**3. Speed Control**
- Adjusts simulation speed (100-2000ms per epoch)
- Useful for quick prototyping vs detailed observation

**4. Progress Bar**
- Shows current epoch progress
- Estimates remaining time

**5. Control Buttons**
- **Start/Pause**: Begin or pause simulation
- **Reset**: Clear all metrics and restart

**6. Charts**
- **Loss Chart**: Training vs Validation loss curves
- **Accuracy Chart**: Training vs Validation accuracy curves

### Simulation Behavior

The simulator generates realistic training curves based on:

**Model Depth** (number of layers)
```
Simple models (5-10 layers):
  - Faster convergence
  - Higher initial accuracy
  - Less overfitting

Deep models (20-50 layers):
  - Slower convergence
  - Lower initial accuracy
  - More potential for overfitting

Very deep models (50+ layers):
  - Slowest convergence
  - Unstable training
  - Needs careful learning rate tuning
```

**Learning Rate Effect**
```
High LR (0.1):      Fast but unstable, may diverge
Medium LR (0.001):  Balanced convergence
Low LR (0.00001):   Slow but stable convergence
```

**Optimizer Comparison**
```
Adam:     Fast convergence, good for most tasks
SGD:      Slower but can find better minima
RMSprop:  Good for recurrent networks
Adagrad:  Adapts learning rate per parameter
```

### Use Cases

**1. Quick Architecture Testing**
```
1. Build a model in the Visual Builder
2. Run TrainingSimulator for 50 epochs
3. Check if loss is decreasing
4. Adjust architecture if needed
5. Repeat quickly without real data
```

**2. Hyperparameter Exploration**
```
1. Use HyperparameterSuggestions to get initial values
2. Simulate training with suggested LR
3. Adjust LR in TrainingSimulator if needed
4. Test different optimizers
5. Find best settings before real training
```

**3. Learning Rate Tuning**
```
1. Start with recommended learning rate
2. Run simulation
3. If loss plateaus too early → increase LR
4. If loss spikes/diverges → decrease LR
5. Find sweet spot that balances speed and stability
```

**4. Model Comparison**
```
1. Build model A → Simulate
2. Modify architecture → Simulate
3. Compare convergence curves
4. Keep the better architecture
```

### Best Practices
✅ **Start with defaults**: Use HyperparameterSuggestions output
✅ **Adjust one parameter at a time**: Understand each effect
✅ **Watch for divergence**: LR too high will cause spikes
✅ **Look for plateaus**: May indicate need for LR adjustment
✅ **Test 50-100 epochs**: Enough to see convergence behavior
✅ **Use slower speeds initially**: To understand the curves better
✅ **Compare curves**: Training vs validation gap shows overfitting

---

## Integration Example

Here's how to use all three components together:

```tsx
import { HyperparameterSuggestions } from './components/HyperparameterSuggestions'
import { DatasetVisualizer } from './components/DatasetVisualizer'
import { TrainingSimulator } from './components/TrainingSimulator'
import { useState } from 'react'
import { Box, Grid } from '@mui/material'

export function ModelOptimizer({ nodes, edges }) {
  const [datasetStats, setDatasetStats] = useState(null)

  const handleDatasetLoad = (stats) => {
    setDatasetStats(stats)
    console.log('Dataset loaded, ready to train on', stats.totalSamples, 'samples')
  }

  const handleApplySuggestions = (suggestions) => {
    // Apply to your training configuration
    console.log('Using hyperparameters:', suggestions)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {/* Step 1: Analyze Dataset */}
        <Grid item xs={12} md={6}>
          <DatasetVisualizer onDatasetLoad={handleDatasetLoad} />
        </Grid>

        {/* Step 2: Get Hyperparameter Suggestions */}
        <Grid item xs={12} md={6}>
          <HyperparameterSuggestions
            nodes={nodes}
            edges={edges}
            onApplySuggestions={handleApplySuggestions}
          />
        </Grid>

        {/* Step 3: Simulate Training */}
        <Grid item xs={12}>
          <TrainingSimulator nodes={nodes} edges={edges} />
        </Grid>
      </Grid>
    </Box>
  )
}
```

## Workflow

```
┌─────────────────────────────────────┐
│  1. Build Model Architecture        │
│     (Using Visual Model Builder)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. Analyze Dataset                 │
│  (DatasetVisualizer)                │
│  - Upload or generate stats         │
│  - Understand class distribution    │
│  - Check image dimensions           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  3. Get Hyperparameter Suggestions  │
│  (HyperparameterSuggestions)        │
│  - Analyze architecture depth       │
│  - Get LR, batch size, optimizer    │
│  - Check regularization needs       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. Simulate Training               │
│  (TrainingSimulator)                │
│  - Test with suggested parameters   │
│  - Adjust if needed                 │
│  - Verify convergence               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  5. Train on Real Data              │
│     (Ready to go!)                  │
└─────────────────────────────────────┘
```

---

## Tips & Tricks

### Performance Optimization
- **Large models**: Increase batch size to reduce memory overhead
- **Slow convergence**: Increase learning rate (carefully!)
- **Unstable training**: Decrease learning rate
- **Overfitting**: Add Dropout or L2 regularization

### Model Architecture
- **ImageNet-like**: 3-5 conv blocks + FC layers
- **Small datasets**: Use transfer learning with pre-trained models
- **Large datasets**: Can afford deeper, custom architectures
- **Balanced**: Use BatchNorm for stability

### Data Handling
- **Imbalanced classes**: Use class weights or resampling
- **Small images**: May need simpler models
- **Large images**: Larger models can extract more features
- **Limited data**: Use data augmentation

### Debugging
If training doesn't converge:
1. Check if loss is decreasing at all
2. Reduce learning rate
3. Increase epochs
4. Check for NaN values
5. Verify data preprocessing

If overfitting (gap between train/val):
1. Increase Dropout
2. Increase L2 regularization
3. Reduce model complexity
4. Get more training data
5. Use data augmentation

---

## Summary

- **HyperparameterSuggestions**: Quick, intelligent parameter recommendations
- **DatasetVisualizer**: Understand your data before training
- **TrainingSimulator**: Test architectures and settings quickly

Use them together for a complete model optimization workflow!
