# How to Access the Optimization Components on Your Website

## Navigation Path

Your upgraded components are now fully integrated into your website! Here's how to access them:

### **Option 1: From the Navigation Bar**
1. Click on **"Optimize"** button in the top navigation bar (AppBar)
2. This takes you directly to the Model Optimization Tools page

### **Option 2: From the Model Builder**
1. Go to **"Builder"** page
2. Build your model by dragging layers
3. Click the **"Optimize"** button (next to "Save Architecture")
4. You'll be taken to the optimization tools

### **Option 3: Direct URL**
Navigate to: `http://localhost:5173/optimize`

---

## What You'll See

### **Model Optimization Tools Page**

The page has three tabs at the top:

```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 Model Optimization Tools                                 │
│ Optimize your model with dataset analysis, hyperparameter   │
│ suggestions, and training simulation                        │
├─────────────────────────────────────────────────────────────┤
│ [📊 Dataset   ] [🧠 Hyperparameter] [⚡ Training ]          │
│  Visualizer      Suggestions         Simulator             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Tab Content - Choose one of the three components]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## The Three Components

### **Tab 1: 📊 Dataset Visualizer**
**What you can do:**
- Generate synthetic dataset statistics
- Upload real dataset files (ZIP, TAR, images)
- View class distribution charts
- See pixel statistics (mean, std, min, max)
- Configure dataset parameters

**Input Fields:**
- Total Samples (e.g., 1000)
- Image Width (e.g., 224)
- Image Height (e.g., 224)
- Number of Classes (e.g., 10)

**Output:**
- Visual charts showing class distribution
- Summary cards with statistics

---

### **Tab 2: 🧠 Hyperparameter Suggestions**
**What you can do:**
- Get AI-powered hyperparameter recommendations
- Analyze your model architecture depth
- See suggested learning rates
- Get optimizer recommendations
- View regularization suggestions
- Apply suggestions with one click

**Analyzes:**
- Model depth (number of layers)
- Layer types (Conv2d, Dense, etc.)
- Suggested batch sizes
- Dropout rates
- L2 regularization values

**Shows:**
- Impact level (High/Medium/Low)
- Category (Learning, Regularization, Architecture, Optimization)
- Current vs. Suggested values
- Reasoning for each suggestion

---

### **Tab 3: ⚡ Training Simulator**
**What you can do:**
- Simulate training without real data
- Adjust training parameters in real-time
- View loss and accuracy curves
- Test different optimizers
- Adjust learning rate with slider
- Control simulation speed

**Parameters:**
- Epochs (number of training iterations)
- Batch Size
- Learning Rate (logarithmic slider)
- Optimizer (Adam, SGD, RMSprop, Adagrad)
- Simulation Speed (100-2000ms per epoch)

**Controls:**
- Start/Pause button
- Reset button
- Progress bar showing completion %
- Estimated time remaining

**Displays:**
- Training vs Validation Loss curve
- Training vs Validation Accuracy curve
- Real-time metrics

---

## Complete Workflow

```
START HERE
   ↓
┌─────────────────────────────┐
│ Go to "Builder" page        │
│ Build your model            │
│ Add layers and connections  │
└────────────┬────────────────┘
             ↓
    ┌────────────────────┐
    │ Click "Optimize"   │
    └────────┬───────────┘
             ↓
┌─────────────────────────────────┐
│  Optimization Tools Page        │
├─────────────────────────────────┤
│ Step 1: Understand your data    │
│ → Dataset Visualizer tab        │
│   Generate/upload dataset stats │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Step 2: Get recommendations     │
│ → Hyperparameter Suggestions tab│
│   View AI-suggested parameters  │
│   Click "Apply" if you like them│
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Step 3: Test your model         │
│ → Training Simulator tab        │
│   Run simulation with params    │
│   Watch loss/accuracy curves    │
│   Adjust if needed              │
└────────────┬────────────────────┘
             ↓
    ┌────────────────────┐
    │ Ready to train!    │
    └────────────────────┘
```

---

## Quick Start Examples

### **Example 1: Quick Check**
1. Build a simple model: Input → Conv2d → ReLU → Dense → Output
2. Click "Optimize"
3. Check the **Hyperparameter Suggestions** tab
4. See recommended learning rate, batch size, etc.

### **Example 2: Dataset Analysis**
1. Go to **Optimize**
2. Click **Dataset Visualizer** tab
3. Set: 5000 samples, 224x224 images, 10 classes
4. Click "Generate Dataset Stats"
5. See class distribution and pixel statistics

### **Example 3: Training Simulation**
1. After building model, click **Optimize**
2. Go to **Training Simulator** tab
3. Set: 50 epochs, batch size 32, Adam optimizer
4. Adjust learning rate slider to 0.001
5. Click "Start"
6. Watch the training curves in real-time

---

## UI Elements Location

### **Navigation Bar** (Top of every page)
```
Dashboard | Builder | Inference | Optimize | User Email | Logout
```

### **Model Builder Page** (When building)
```
[Save Architecture] [Optimize] ← Click here to access tools
```

### **Optimization Page** (Main workspace)
```
Back ← 🚀 Model Optimization Tools
[Info Alert]
[📊 Dataset | 🧠 Hyperparameters | ⚡ Training]
[Selected Tab Content Below]
```

---

## Browser Requirements
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Recommended: 1024x768 or larger screen

## Troubleshooting

**I can't see the Optimize button:**
- Make sure you're logged in
- Make sure you've added at least one layer to your model
- Refresh the page (Ctrl+R or Cmd+R)

**The components aren't loading:**
- Check browser console (F12) for errors
- Verify backend server is running
- Try refreshing the page

**Charts aren't showing:**
- Generate dataset stats or start training simulation
- Charts appear after data is available
- Use "Generate Dataset Stats" or "Start" training

---

## Feature Highlights

✅ **Three powerful tools in one place**
✅ **Integrated into your model builder workflow**
✅ **Easy-to-use interface**
✅ **Real-time visualizations**
✅ **No actual training needed** (simulator)
✅ **Quick iterations and testing**

---

## Next Steps

1. **Log in** to your account
2. **Build a model** (or use existing one)
3. **Click Optimize** to access the tools
4. **Analyze** your dataset, **get suggestions**, and **simulate** training
5. **Save your model** and start training!

Enjoy optimizing your models! 🚀
