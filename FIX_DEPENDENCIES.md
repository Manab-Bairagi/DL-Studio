# Fix Dependency Issue

The error you're seeing is due to incompatible versions of `motor` and `pymongo`.

## Quick Fix

Run these commands:

```bash
cd backend
pip uninstall motor pymongo beanie -y
pip install motor==3.3.1 pymongo==4.6.0 beanie==1.23.6
```

Or reinstall all dependencies:

```bash
cd backend
pip install --upgrade -r requirements.txt
```

## What Happened

The error `AttributeError: type object 'MongoClient' has no attribute 'options'` occurs when:
- `motor` version is too new for the `pymongo` version, OR
- `pymongo` version is too old for the `motor` version

The fix uses compatible versions that work together.

## Verify Installation

After reinstalling, verify:

```bash
pip show motor pymongo beanie
```

You should see:
- motor: 3.3.1
- pymongo: 4.6.0
- beanie: 1.23.6

Then try running the server again:

```bash
cd ..
uvicorn backend.main:app --reload
```

