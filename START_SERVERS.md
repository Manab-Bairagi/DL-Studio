# How to Start Both Servers

## Backend Server (FastAPI)

1. **Open a terminal/PowerShell window**
2. **Navigate to project root and activate venv**:
   ```bash
   cd E:\Project_X
   backend\venv\Scripts\activate
   ```

3. **Start the backend server**:
   ```bash
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   Connected to MongoDB: dl_model_builder
   ```

## Frontend Server (Vite/React)

1. **Open a NEW terminal/PowerShell window** (keep backend running)
2. **Navigate to frontend directory**:
   ```bash
   cd E:\Project_X\frontend
   ```

3. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

4. **Start the frontend server**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

## Verify Both Are Running

- **Backend**: http://127.0.0.1:8000 or http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Troubleshooting

### "ECONNREFUSED" Error

This means the backend is not running or not accessible.

**Check**:
1. Is the backend server running? Look for the uvicorn output
2. Is it running on the correct host? Should be `127.0.0.1:8000` or `0.0.0.0:8000`
3. Try accessing http://localhost:8000/docs directly in your browser

### Backend Won't Start

- Check MongoDB connection (run `python backend/scripts/test_connection.py`)
- Check `.env` file exists in `backend/` directory
- Check for Python errors in the terminal

### Frontend Can't Connect

- Make sure backend is running first
- Check Vite proxy config in `frontend/vite.config.ts`
- Try restarting both servers

