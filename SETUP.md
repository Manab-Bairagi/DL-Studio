# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
# Edit .env with your database credentials

# Initialize database
# First, create PostgreSQL database:
createdb dl_model_builder

# Run migrations
alembic upgrade head

# Start server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Setup

### PostgreSQL Installation

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database:
   ```sql
   CREATE DATABASE dl_model_builder;
   ```
3. Update `backend/.env` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/dl_model_builder
   ```

### Running Migrations

```bash
cd backend
alembic upgrade head
```

To create a new migration:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dl_model_builder
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

## Troubleshooting

### Backend Issues

1. **Import errors**: Make sure you're running from the project root and have installed all dependencies
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Port already in use**: Change the port in the uvicorn command

### Frontend Issues

1. **Module not found**: Run `npm install` again
2. **Port conflicts**: Change port in `vite.config.ts`
3. **API connection**: Verify backend is running and CORS is configured correctly

## Next Steps

After setup, you can:
1. Register a new user account
2. Create your first model
3. Build model architecture (coming in next phase)
4. Run inference and visualize outputs (coming in next phase)

