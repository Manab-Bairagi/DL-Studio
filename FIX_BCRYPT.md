# Fix Bcrypt Error

You're getting a bcrypt compatibility error. Here's how to fix it:

## Quick Fix

Run these commands:

```bash
cd backend
venv\Scripts\activate

# Uninstall old versions
pip uninstall bcrypt passlib -y

# Install compatible versions
pip install bcrypt==4.0.1 passlib[bcrypt]==1.7.4

# Or reinstall everything
pip install -r requirements.txt
```

## What's Wrong?

The error `AttributeError: module 'bcrypt' has no attribute '__about__'` happens when:
- `passlib` version is incompatible with `bcrypt` version
- `bcrypt` version is too new for `passlib` to detect

## After Fixing

Restart your server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd ..
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The registration should now work!

