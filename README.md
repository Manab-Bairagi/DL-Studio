# 🧠 DL Studio: Deep Learning Model Builder & Visualizer

**DL Studio** is a powerful, interactive platform designed to democratize deep learning education and research. It empowers students, researchers, and developers to **visually build, analyze, and export** deep learning models without getting lost in boilerplate code.

## 🚀 Why DL Studio?

Deep learning can be complex. DL Studio simplifies the process by providing a **drag-and-drop interface** to construct neural network architectures. But it goes beyond just building:

*   **Visualize Intelligence**: Peer inside the "black box" with layer-wise feature map visualizations and activation heatmaps.
*   **Rapid Prototyping**: Experiment with different architectures (Conv2D, Dense, Pooling, etc.) in seconds.
*   **Code Export**: Seamlessly export your visual designs into production-ready **PyTorch** code.
*   **Version Control**: Manage multiple iterations of your models with built-in versioning.

Whether you are learning the basics of CNNs or prototyping a new architecture for a research paper, DL Studio is your companion.

## ✨ Key Features

*   **Visual Model Builder**: Intuitive React Flow-based interface to design networks.
*   **Real-time Inference**: Upload images and see model predictions instantly.
*   **Deep Visualization**: Inspect feature maps and neuron activations to understand what your model is learning.
*   **Auto-Save & Versioning**: Never lose your work; switch between model versions effortlessly.
*   **Secure Workspace**: User authentication and private model storage.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, React Flow, Material-UI, Vite.
*   **Backend**: FastAPI (Python), PyTorch, MongoDB (Beanie/Motor).
*   **Database**: MongoDB Atlas.

---

## 💻 Getting Started

We welcome developers to fork, explore, and contribute! Here is how to set up the project locally.

### Prerequisites

*   **Python 3.9+**
*   **Node.js 18+**
*   **MongoDB Atlas Account** (Free tier is sufficient)

### 1. Fork and Clone

First, fork the repository to your GitHub account, then clone it locally:

```bash
git clone https://github.com/Manab-Bairagi/DL-Studio.git
cd DL-Studio
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend/` directory with your MongoDB credentials:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=dl_model_builder
SECRET_KEY=your_super_secret_key
CORS_ORIGINS=["http://localhost:5173"]
```

**Run the Server:**
From the **project root** (not inside `backend/`), run:

```bash
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and start the UI:

```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🤝 Contributing

**We need YOU!**

DL Studio is an open project, and we are actively looking for contributors to help take it to the next level. Whether you are a frontend wizard, a backend guru, or a deep learning enthusiast, there is a place for you here.

### Why Contribute?
*   **Impact**: Build tools that help others learn and create.
*   **Learning**: Work with a modern stack (FastAPI + React + PyTorch).
*   **Community**: Join a growing community of developers.

### How to Contribute
1.  **Fork** the repo.
2.  **Create** a new branch (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes.
4.  **Push** to the branch.
5.  **Open a Pull Request**.

Check out our [Issues](https://github.com/your-repo/issues) page for open tasks!

---

## 🔮 Future Plans

We have an exciting roadmap ahead! Here are the key features and integrations planned for future releases:

### 🎯 Priority Features

*   **Kaggle & Colab Integration**: Seamlessly train your visually designed models on cloud platforms:
    *   **One-Click Export**: Export models directly to Jupyter notebooks compatible with Kaggle and Google Colab.
    *   **Cloud Training**: Configure and launch training jobs on Kaggle kernels or Colab environments.
    *   **Dataset Integration**: Connect to Kaggle datasets or upload custom datasets for training.
    *   **Progress Monitoring**: Real-time training metrics and visualization from cloud environments.

*   **Enhanced Visualization Suite**:
    *   **Training Metrics Dashboard**: Real-time loss/accuracy curves, learning rate schedules.
    *   **Model Comparison**: Side-by-side comparison of different model architectures.
    *   **3D Architecture Visualization**: Interactive 3D rendering of complex network structures.
    *   **Attention Mechanism Visualization**: For Transformer and attention-based models.

*   **Advanced Model Building**:
    *   **Pre-trained Model Hub**: Import and fine-tune popular pre-trained models (ResNet, VGG, EfficientNet, etc.).
    *   **Custom Layer Support**: Define and integrate custom PyTorch layers.
    *   **Transfer Learning Workflow**: Visual tools for freezing/unfreezing layers.
    *   **Multi-Modal Models**: Support for vision-language and multi-input architectures.

### 🚀 Deployment & Production

*   **Model Deployment Tools**:
    *   **ONNX Export**: Convert models to ONNX format for cross-platform deployment.
    *   **TorchScript Export**: Optimized model export for production environments.
    *   **API Generation**: Auto-generate FastAPI endpoints for trained models.
    *   **Docker Containerization**: One-click Docker image creation for model serving.

*   **Performance Optimization**:
    *   **Model Quantization**: Tools for INT8 quantization and model compression.
    *   **Pruning Utilities**: Visual pruning interface to reduce model size.
    *   **Benchmark Suite**: Compare model performance across different hardware.

### 📚 Educational & Collaboration

*   **Tutorial System**: Interactive guided tutorials for common architectures (CNN, RNN, Transformer).
*   **Team Collaboration**: Share models, fork architectures, and collaborate with teams.
*   **Model Templates**: Pre-built architecture templates for common tasks (image classification, object detection, segmentation).
*   **Documentation Generator**: Auto-generate model documentation and architecture diagrams.

### 🔧 Infrastructure Improvements

*   **TensorFlow/Keras Support**: Dual framework support alongside PyTorch.
*   **Dataset Manager**: Built-in dataset versioning and preprocessing workflows.
*   **Experiment Tracking**: Integration with MLflow, Weights & Biases.
*   **GPU Resource Management**: Monitor and optimize GPU usage during local development.

---

## 📄 License

This project is licensed under the MIT License.