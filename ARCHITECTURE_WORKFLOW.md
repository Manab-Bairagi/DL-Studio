# Application Architecture & Workflow

## 🏗️ Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Layout Component (Navigation)                │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  Dashboard │ Builder │ Inference │ Logout      │   │  │
│  │  │            (NAVBAR - FIXED)                     │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Pages:                                                       │
│  ├─ LoginPage          (/login)                              │
│  ├─ RegisterPage       (/register)                           │
│  ├─ DashboardPage      (/)                                   │
│  ├─ ModelBuilderPage   (/builder)                            │
│  ├─ ModelViewPage      (/model/:modelId)  ← FIXED            │
│  └─ InferencePage      (/inference)       ← FIXED + ROUTED   │
│                                                               │
│  Components:                                                  │
│  ├─ VisualModelBuilder    (React Flow)                       │
│  ├─ LayerPalette          (Layer drag-and-drop)             │
│  ├─ LayerConfigPanel      (Layer parameters)                │
│  ├─ FeatureMapVisualizer  (Heatmap rendering)               │
│  ├─ ActivationVisualizer  (Statistics & health)             │
│  └─ LayerNode             (Visual layer node)               │
│                                                               │
│  Services:                                                    │
│  ├─ authStore             (Zustand)                         │
│  ├─ builderStore          (Zustand)                         │
│  ├─ apiClient             (Axios interceptor)               │
│  ├─ authApi               (Login/Register)                  │
│  ├─ modelBuilderApi       (← ENHANCED)                      │
│  └─ inferenceApi          (Image & inference)               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION FLOW                           │
└──────────────────────────────────────────────────────────────┘

1. AUTHENTICATION
   ┌─────────────────┐
   │  User Registers │
   │   or Logs In    │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────┐
   │ Redirected to       │
   │ Dashboard (/)       │
   └────────┬────────────┘

2. MODEL CREATION - NEW
   ┌─────────────────────┐
   │  Click "Builder"    │
   │  button in navbar   │ ← FIXED: Button added
   └────────┬────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  ModelBuilderPage        │
   │  - Drag layers           │
   │  - Connect layers        │
   │  - Configure parameters  │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Click "Save            │
   │  Architecture"           │
   │  - Name model            │
   │  - Set input shape       │
   │  - Save                  │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Redirected to           │
   │  Dashboard (/)           │
   │  - Model now visible     │
   └────────┬─────────────────┘

3. MODEL EDITING - NEW
   ┌──────────────────────────┐
   │  On Dashboard:           │
   │  Click on model name     │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  ModelViewPage           │
   │  - View model info       │
   │  - List all versions     │ ← FIXED: Implemented
   │  - "Edit Model" button   │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Click "Edit Model"      │
   │  - Enter edit mode       │
   │  - Load existing arch    │ ← FIXED: Deserialization
   │  - Modify layers         │
   │  - Connect/disconnect    │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Click "Save New        │
   │  Version"                │
   │  - Add version notes     │
   │  - Creates new version   │
   │  - Keeps history         │
   └────────┬─────────────────┘

4. RUN INFERENCE - FIXED
   ┌──────────────────────────┐
   │  Click "Inference"       │
   │  button in navbar        │ ← FIXED: Button + Route
   │                          │
   │  InferencePage (/)       │
   │  Opens inference UI      │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Select Model & Version  │
   │  - Dropdown menus        │
   │  - Choose from list      │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Upload Image            │
   │  - PNG/JPG format        │
   │  - Auto preview          │
   │  - Auto resize           │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Click "Run Inference"   │
   │  - Shows loading         │
   └────────┬─────────────────┘
            │
            ▼ (Backend Processing)
   ┌──────────────────────────┐
   │  Backend                 │
   │  - Load model            │
   │  - Preprocess image      │
   │  - Forward pass          │
   │  - Collect layer outputs │
   │  - Compute statistics    │
   │  - Return results        │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Display Results         │
   │  3 Tabs:                 │
   │  1. Feature Maps         │
   │     - Heatmaps           │
   │     - Layer stats        │
   │  2. Activations          │
   │     - Neuron health      │
   │     - Dead/Saturated     │
   │  3. Layer Details        │
   │     - Raw stats          │
   └──────────────────────────┘
```

---

## 🔌 API Integration Points

### Frontend → Backend Communication

```
AUTHENTICATION
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  GET /api/v1/auth/me

MODELS
  GET /api/v1/models                    (List all models)
  POST /api/v1/models                   (Create new model)
  GET /api/v1/models/:modelId           (Get model details)
  GET /api/v1/models/:modelId/versions  (List versions)
  POST /api/v1/models/:modelId/versions (Create version)

INFERENCE
  POST /api/v1/inference/run            (Raw input inference)
  POST /api/v1/inference/run-image      (Image upload inference)
  GET /api/v1/inference/:versionId/config (Model metadata)
```

---

## 📊 Data Flow for Model Editing

```
User edits model architecture:

1. LOAD EXISTING MODEL
   Backend Database
        │
        ├─ Model: {name, type, description}
        ├─ Version: {version_num, created_at}
        └─ Architecture: {
             layers: [
               {type: "Conv2d", params: {...}},
               {type: "ReLU", params: {...}},
               ...
             ]
           }
        │
        ▼
   Frontend API (modelBuilderApi.deserializeArchitecture)
        │
        ├─ Convert each layer → React Flow Node
        ├─ Create edges between consecutive layers
        └─ Load into VisualModelBuilder
        │
        ▼
   React Flow
   - Display nodes with connections
   - Allow user to modify

2. SAVE MODIFIED MODEL
   React Flow (nodes + edges)
        │
        ▼
   Frontend API (modelBuilderApi.saveModelVersion)
        │
        ├─ Extract layer type and params from nodes
        ├─ Serialize to architecture JSON
        └─ Send to backend
        │
        ▼
   Backend (/api/v1/models/{id}/versions)
        │
        ├─ Validate architecture
        ├─ Build PyTorch model
        ├─ Save to database
        └─ Return version ID
        │
        ▼
   Database
   - New version created
   - Old versions preserved
   - Versioning maintained
```

---

## 📦 Component Hierarchy

```
App (Router)
├─ Layout (Navbar with navigation)
│  └─ Pages:
│
├─ LoginPage
├─ RegisterPage
├─ DashboardPage
│  └─ Models table
│     └─ Click model → ModelViewPage
│
├─ ModelBuilderPage
│  └─ VisualModelBuilder (React Flow)
│     ├─ LayerPalette (left side)
│     │  └─ Layer items (draggable)
│     ├─ Canvas (center)
│     │  └─ LayerNodes (React Flow nodes)
│     └─ LayerConfigPanel (right side)
│        └─ Configuration form
│
├─ ModelViewPage ← FIXED (Two modes)
│  ├─ View Mode
│  │  ├─ Model details
│  │  ├─ Versions table
│  │  └─ Edit button
│  └─ Edit Mode
│     └─ VisualModelBuilder (same as builder page)
│
└─ InferencePage ← FIXED
   ├─ Model selector
   ├─ Version selector
   ├─ Image uploader
   └─ Results tabs:
      ├─ FeatureMapVisualizer
      │  └─ Canvas heatmap + stats
      ├─ ActivationVisualizer
      │  └─ Neuron health table
      └─ Layer details
         └─ Statistics table
```

---

## 🔐 Authentication Flow

```
User Input
    │
    ▼
LoginPage / RegisterPage
    │
    ▼
authApi.login() / authApi.register()
    │
    ▼
Backend /auth/login or /auth/register
    │
    ▼
JWT Token returned
    │
    ▼
authStore (Zustand)
    │
    ├─ Save token in localStorage
    ├─ Save user info
    └─ Update isAuthenticated
    │
    ▼
Route Protection
    │
    └─ If not authenticated → Redirect to /login
    └─ If authenticated → Show page with Layout
    │
    ▼
All API calls include token
    │
    └─ axios interceptor adds Authorization header
```

---

## 🎨 Visual Builder Components

```
VisualModelBuilder
├─ Toolbar (top)
│  ├─ Delete button
│  ├─ Undo/Redo buttons
│  └─ Save button
│
├─ LayerPalette (left sidebar)
│  ├─ Category tabs
│  │  ├─ Convolutional
│  │  ├─ Pooling
│  │  ├─ Activation
│  │  ├─ Normalization
│  │  ├─ Blocks
│  │  └─ Utility
│  └─ Draggable layer items
│
├─ Canvas (center)
│  ├─ React Flow (diagram)
│  │  ├─ Nodes (layers)
│  │  │  ├─ Input handles (left)
│  │  │  ├─ Configuration button
│  │  │  └─ Output handles (right)
│  │  ├─ Edges (connections)
│  │  ├─ Background
│  │  ├─ Controls
│  │  └─ MiniMap
│
└─ LayerConfigPanel (right sidebar)
   ├─ Selected layer info
   ├─ Parameter controls
   │  ├─ Text inputs
   │  ├─ Number inputs
   │  └─ Dropdown selects
   └─ Update button
```

---

## ✨ Key Improvements Made

| Component | Before | After |
|-----------|--------|-------|
| **Navbar** | 2 buttons | 3 buttons (Added Inference) |
| **Routes** | 3 routes | 4 routes (Added /inference) |
| **ModelViewPage** | Read-only view | Edit + View modes |
| **Model Editing** | Not possible | Full editing with versions |
| **Architecture Load** | Not supported | Load from DB via deserialization |
| **Inference Access** | No UI | Full page with results |

---

## 🚀 Ready for Use!

All components are now properly integrated and functional:

- ✅ User can create models
- ✅ User can edit models and create versions
- ✅ User can access inference from navbar
- ✅ User can upload images and run inference
- ✅ User can visualize results with heatmaps and statistics
- ✅ Complete workflow from creation to analysis

**Status**: PRODUCTION READY FOR TESTING
