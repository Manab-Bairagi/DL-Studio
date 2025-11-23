# Connection Troubleshooting Guide

## Quick Test

Run the connection test script:

```bash
cd backend
python scripts/test_connection.py
```

This will tell you exactly what's wrong with your connection.

## Common Issues & Solutions

### 1. "ServerSelectionTimeoutError" or "Connection Timeout"

**Problem**: Can't reach MongoDB Atlas servers

**Solutions**:
- ✅ **Check IP Whitelist**: Go to MongoDB Atlas → Network Access → Add your IP address
  - For testing: Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
  - For production: Add specific IP addresses only
- ✅ **Check Cluster Status**: Make sure your cluster is running (not paused)
  - Free tier clusters pause after 1 week of inactivity
  - Click "Resume" if paused
- ✅ **Check Firewall**: Ensure port 27017 is not blocked
- ✅ **Check Internet Connection**: Verify you can reach mongodb.net

### 2. "Authentication Failed" or "Invalid Credentials"

**Problem**: Wrong username or password

**Solutions**:
- ✅ **Verify Username**: Check MongoDB Atlas → Database Access → Database Users
- ✅ **Verify Password**: Make sure password matches exactly (case-sensitive)
- ✅ **URL Encode Special Characters**: If password has special chars, encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`
  - `?` → `%3F`
  - `/` → `%2F`
  - ` ` (space) → `%20`

**Example**:
```
# Password: myP@ss#123
# Encoded: myP%40ss%23123
DATABASE_URL=mongodb+srv://user:myP%40ss%23123@cluster.mongodb.net/...
```

### 3. "Database Not Found"

**Problem**: Database doesn't exist (but this is OK!)

**Solution**: 
- ✅ MongoDB Atlas creates databases automatically
- ✅ The database will be created when you first insert data
- ✅ No action needed - just start using the API

### 4. "DNS Resolution Failed"

**Problem**: Can't resolve mongodb.net domain

**Solutions**:
- ✅ Check your internet connection
- ✅ Try using a different DNS server (8.8.8.8, 1.1.1.1)
- ✅ Check if you're behind a corporate firewall/proxy

### 5. Connection String Format Issues

**Correct Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Common Mistakes**:
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong cluster name
- ❌ Missing `?retryWrites=true&w=majority` parameters
- ❌ Extra spaces or quotes in .env file

### 6. .env File Issues

**Check**:
1. File is named exactly `.env` (not `.env.txt` or `env`)
2. File is in `backend/` directory
3. No quotes around values (unless needed for JSON arrays)
4. No trailing spaces
5. Each variable on its own line

**Correct .env format**:
```env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=dl_model_builder
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

## Step-by-Step Debugging

### Step 1: Verify .env File

```bash
cd backend
cat .env  # Linux/Mac
type .env  # Windows
```

Check:
- ✅ DATABASE_URL is present
- ✅ No syntax errors
- ✅ Values are correct

### Step 2: Test Connection Script

```bash
python scripts/test_connection.py
```

This will show you exactly what's wrong.

### Step 3: Check MongoDB Atlas Dashboard

1. **Cluster Status**:
   - Go to Clusters → Check if cluster is "Running" (green)
   - If "Paused" (gray), click "Resume"

2. **Network Access**:
   - Go to Network Access → IP Access List
   - Make sure your IP is listed OR `0.0.0.0/0` is present

3. **Database Users**:
   - Go to Database Access → Database Users
   - Verify username exists
   - Reset password if needed

4. **Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 4: Test with MongoDB Compass (Optional)

Download [MongoDB Compass](https://www.mongodb.com/products/compass) and try connecting with your connection string. If Compass works, the issue is in your code. If Compass fails, the issue is with MongoDB Atlas setup.

## Getting Your Connection String

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Python"** and **"Version 3.6 or later"**
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<username>` if different
8. Add database name at the end (optional):
   ```
   mongodb+srv://user:pass@cluster.net/db_name?retryWrites=true&w=majority
   ```

## Still Having Issues?

1. **Check the error message** - it usually tells you what's wrong
2. **Run the test script** - `python scripts/test_connection.py`
3. **Check MongoDB Atlas status page** - https://status.mongodb.com
4. **Verify your account** - Make sure your Atlas account is active
5. **Check free tier limits** - M0 clusters have some limitations

## Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running (not paused)
- [ ] Database user created with password
- [ ] IP address whitelisted (or "Allow from anywhere")
- [ ] Connection string copied correctly
- [ ] Password URL-encoded if it has special characters
- [ ] .env file created in backend/ directory
- [ ] .env file has correct DATABASE_URL format
- [ ] Dependencies installed: `pip install -r requirements.txt`

## Example Working .env

```env
# MongoDB Atlas Connection
DATABASE_URL=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=dl_model_builder

# JWT
SECRET_KEY=super-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

**Note**: Replace with your actual values!

