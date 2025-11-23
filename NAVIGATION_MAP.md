# Visual Navigation Map - Where to Find Your Components

## 🗺️ Site Map

```
YOUR WEBSITE
│
├── 🔐 Login Page
│   └── [Enter credentials]
│
├── 📊 Dashboard 
│   ├── View your models
│   └── Create new model → Goes to Builder
│
├── 🏗️ Model Builder Page
│   ├── [Layer Palette] + [Canvas]
│   ├── [Save Architecture] button
│   └── [Optimize] button ← LEADS TO COMPONENTS!
│       │
│       └─→ 🚀 OPTIMIZATION PAGE (NEW)
│           │
│           ├─ Tab 1: 📊 Dataset Visualizer
│           ├─ Tab 2: 🧠 Hyperparameters  
│           └─ Tab 3: ⚡ Training Simulator
│
├── 🔍 Inference Page
│   └── Run inference on models
│
└── 🚀 Optimization Page (NEW - MAIN FEATURE)
    ├─ Accessible from navbar
    ├─ Accessible from builder
    ├─ Direct URL: /optimize
    │
    ├─ Tab 1: Dataset Visualizer
    │  └─ Generate or upload datasets
    │     └─ View class distribution
    │
    ├─ Tab 2: Hyperparameter Suggestions
    │  └─ Get AI recommendations
    │     └─ See impact analysis
    │
    └─ Tab 3: Training Simulator
       └─ Run simulations
          └─ Watch curves update live
```

---

## 🧭 Navigation Paths

### **Path 1: From Navbar (Fastest)**
```
Anywhere in app
    ↓
Click [Optimize] in top bar
    ↓
OPTIMIZATION PAGE
```

### **Path 2: From Model Builder (While Working)**
```
Builder page
    ↓
Build your model
    ↓
Click [Optimize] button
    ↓
OPTIMIZATION PAGE
```

### **Path 3: Direct URL**
```
Type in address bar:
http://localhost:5173/optimize
    ↓
OPTIMIZATION PAGE
```

---

## 🎯 Component Locations

```
OPTIMIZATION PAGE
├─ Header: "🚀 Model Optimization Tools"
│  ├─ Back button (returns to builder)
│  └─ Description text
│
├─ Tabs: [📊] [🧠] [⚡]
│
├─ Content Area:
│  │
│  ├─ TAB 1: 📊 Dataset Visualizer
│  │  ├─ Input Fields:
│  │  │  ├─ Total Samples
│  │  │  ├─ Image Width
│  │  │  ├─ Image Height
│  │  │  └─ Number of Classes
│  │  │
│  │  ├─ Buttons:
│  │  │  ├─ Generate Dataset Stats
│  │  │  └─ Upload Dataset
│  │  │
│  │  └─ Output:
│  │     ├─ Bar chart (class distribution)
│  │     ├─ Pie chart (percentages)
│  │     └─ Statistics cards
│  │
│  ├─ TAB 2: 🧠 Hyperparameter Suggestions
│  │  ├─ Analysis status indicator
│  │  │
│  │  ├─ Suggestions Table:
│  │  │  ├─ Parameter column
│  │  │  ├─ Current value
│  │  │  ├─ Suggested value
│  │  │  ├─ Impact (High/Med/Low)
│  │  │  └─ Reason
│  │  │
│  │  └─ Recommendation Box:
│  │     ├─ Learning Rate
│  │     ├─ Batch Size
│  │     ├─ Optimizer
│  │     ├─ Epochs
│  │     ├─ Dropout
│  │     ├─ L2 Regularization
│  │     └─ [Apply] button
│  │
│  └─ TAB 3: ⚡ Training Simulator
│     ├─ Parameter Controls:
│     │  ├─ Epochs input
│     │  ├─ Batch Size input
│     │  ├─ Optimizer dropdown
│     │  └─ Learning Rate display
│     │
│     ├─ Learning Rate Slider
│     │  └─ Range: 0.00001 to 0.1
│     │
│     ├─ Simulation Speed Slider
│     │  └─ Range: 100 to 2000 ms/epoch
│     │
│     ├─ Progress Bar
│     │  ├─ Shows current epoch
│     │  └─ Estimated time remaining
│     │
│     ├─ Control Buttons:
│     │  ├─ [Start] / [Pause]
│     │  └─ [Reset]
│     │
│     └─ Charts Area:
│        ├─ Loss Chart
│        │  ├─ X-axis: Epoch
│        │  ├─ Y-axis: Loss value
│        │  ├─ Training loss line
│        │  └─ Validation loss line
│        │
│        └─ Accuracy Chart
│           ├─ X-axis: Epoch
│           ├─ Y-axis: Accuracy %
│           ├─ Training accuracy line
│           └─ Validation accuracy line
```

---

## 🔗 Link Diagram

```
NAVBAR (Always Visible)
│
├─ Dashboard ────→ Dashboard Page
├─ Builder ──────→ Model Builder Page
├─ Inference ────→ Inference Page
└─ [Optimize] ──→ Optimization Page ← NEW!
    │                      │
    │                      ├─ Tab: Dataset
    │                      ├─ Tab: Hyperparameters
    │                      └─ Tab: Training
    │
    └─ (Accessible from multiple places)


Model Builder Page
│
├─ [Save Architecture]
├─ [Optimize] ───→ Optimization Page
└─ [Back/Menu] ──→ Returns to Dashboard
```

---

## 📱 Responsive Layout

### **Desktop View (1200px+)**
```
┌──────────────────────────────────────────┐
│ Navbar [Dashboard] [Builder] [Optimize]  │
├──────────────────────────────────────────┤
│                                           │
│  ┌─ 🚀 Model Optimization Tools ───┐   │
│  │ Full width layout               │   │
│  │ [Tabs] [Tab content displayed]  │   │
│  │ Lots of space for charts        │   │
│  └────────────────────────────────┘   │
│                                           │
└──────────────────────────────────────────┘
```

### **Tablet View (768px - 1199px)**
```
┌────────────────────────┐
│ Navbar [≡] Menu        │
├────────────────────────┤
│ 🚀 Optimization Tools  │
│ [Tabs - Scrollable]    │
│ [Tab content]          │
│ Charts adapt to size   │
└────────────────────────┘
```

### **Mobile View (<768px)**
```
┌─────────────┐
│ [≡] Menu    │
├─────────────┤
│ 📊 Dataset  │
│ [Generate]  │
│ [Chart]     │
│ ↓ Scroll ↓  │
│ 🧠 Hyper    │
│ [Suggest]   │
│ ↓ Scroll ↓  │
│ ⚡ Training │
│ [Start]     │
│ [Chart]     │
└─────────────┘
```

---

## 🎨 UI Element Locations

### **Top Navigation Bar (Fixed)**
```
[Logo] Dashboard | Builder | Inference | Optimize | [User] | [Logout]
```

### **Optimization Page Header**
```
[← Back] | 🚀 Model Optimization Tools
Description text below title
```

### **Tab Navigation**
```
[📊 Dataset] [🧠 Hyperparameters] [⚡ Training]
```

### **Tab Content**
```
[Info Alert]
[Component Content - Specific to selected tab]
[Charts/Controls/Tables]
[Buttons/Actions]
```

---

## 🔄 User Flow

```
START
  │
  ├─→ Go to Website
  │    │
  │    ├─→ [Login]
  │    │    │
  │    │    ├─→ Dashboard
  │    │    │    │
  │    │    │    ├─→ [Optimize] ← COMPONENTS!
  │    │    │    │
  │    │    │    └─→ [Builder]
  │    │    │         │
  │    │    │         ├─→ Build Model
  │    │    │         │
  │    │    │         ├─→ [Optimize] ← COMPONENTS!
  │    │    │         │
  │    │    │         └─→ [Save]
  │    │    │
  │    │    └─→ Navbaroptimize]
  │    │         │
  │    │         └─→ OPTIMIZATION PAGE
  │    │              │
  │    │              ├─ Dataset Analysis
  │    │              ├─ Get Recommendations
  │    │              └─ Run Simulation
  │    │
  │    └─→ Direct: localhost:5173/optimize
  │         │
  │         └─→ OPTIMIZATION PAGE
  │
  └─→ END (Ready to train model!)
```

---

## 📍 Component Visibility

| Location | Component Visible | How to Access |
|----------|------------------|---------------|
| Navbar | All | Click [Optimize] |
| Builder | All | Click [Optimize] |
| Direct URL | All | Go to /optimize |
| Dashboard | No | Click Optimize to see |
| Inference | No | Click Optimize to see |
| Other pages | No | Use navbar |

---

## 🚀 Quick Access Shortcuts

**From anywhere:**
- Click `Optimize` in navbar → All components load

**From model builder:**
- Click `Optimize` button → Components load with builder context

**Direct:**
- Type `localhost:5173/optimize` → Components load

---

## 📊 Feature Availability

```
Component           | Status | Access Path
────────────────────┼────────┼─────────────────
DatasetVisualizer   | ✅     | Tab 1 - 📊
Hyperparameters     | ✅     | Tab 2 - 🧠  
Training Sim        | ✅     | Tab 3 - ⚡
Navigation Link     | ✅     | Navbar
Builder Button      | ✅     | Builder page
Direct URL          | ✅     | /optimize
Responsive Design   | ✅     | All screens
```

---

## 🎯 Where to Click for Each Component

| Want To... | Click... |
|-----------|----------|
| Use Dataset Visualizer | Navbar [Optimize] → Tab 1 📊 |
| Get Hyperparameters | Navbar [Optimize] → Tab 2 🧠 |
| Simulate Training | Navbar [Optimize] → Tab 3 ⚡ |
| Go from Builder | Builder [Optimize] button |
| Go Directly | URL: /optimize |

---

This is your complete visual navigation map! 🗺️

All components are integrated and accessible from multiple points in your app! 🎉
