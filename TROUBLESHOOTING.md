# Troubleshooting Guide

## Common Issues

## ModuleNotFoundError: No module named 'backend'

**Problem**: You're running uvicorn from inside the `backend/` directory.

**Solution**: Run uvicorn from the **project root** (`E:\Project_X`):

```bash
# From project root (E:\Project_X)
cd E:\Project_X
uvicorn backend.main:app --reload
```

**Important**: Notice the uvicorn output says:
```
INFO:     Will watch for changes in these directories: ['E:\\Project_X\\backend']
```

This means uvicorn is running from `backend/` but watching `backend/` - it can't find the `backend` module because it's looking in the wrong place.

**Fix**: Always run from project root:
```bash
# Go to project root first
cd E:\Project_X

# Then run uvicorn
uvicorn backend.main:app --reload
```

**Alternative**: If you want to run from `backend/` directory, use:

```bash
cd backend
python run.py
```

## MongoDB Connection Issues

### Connection Timeout
- Check your IP address is whitelisted in MongoDB Atlas
- Verify your connection string is correct
- Try "Allow Access from Anywhere" for testing

### Authentication Failed
- Verify username and password in connection string
- URL-encode special characters in password:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`

## Import Errors

If you see import errors, make sure:
1. You're running from the project root
2. Virtual environment is activated
3. All dependencies are installed: `pip install -r requirements.txt`

## Port Already in Use

If port 8000 is already in use:
```bash
uvicorn backend.main:app --reload --port 8001
```

## Database Not Found

MongoDB Atlas creates databases automatically. The database will be created when you first insert data. No manual creation needed.

