# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (cloud database) and connect it to your project.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or log in if you already have one)
3. Complete the registration process

## Step 2: Create a Cluster

1. **After logging in**, you'll see the Atlas dashboard
2. Click **"Build a Database"** or **"Create"** button
3. Choose **"M0 FREE"** tier (free forever, perfect for development)
4. Select a **Cloud Provider** (AWS, Google Cloud, or Azure)
5. Choose a **Region** closest to you
6. Click **"Create"** (cluster creation takes 1-3 minutes)

## Step 3: Create Database User

1. While the cluster is being created, you'll see a **"Create Database User"** form
2. **Authentication Method**: Choose "Password"
3. **Username**: Enter a username (e.g., `dl_user`)
4. **Password**: 
   - Click "Autogenerate Secure Password" OR
   - Create your own strong password
   - **⚠️ IMPORTANT**: Save this password! You won't be able to see it again
5. **Database User Privileges**: Select "Atlas admin" (or "Read and write to any database")
6. Click **"Create Database User"**

## Step 4: Configure Network Access

1. You'll see **"Where would you like to connect from?"** section
2. For development, click **"Add My Current IP Address"**
3. Or click **"Allow Access from Anywhere"** (less secure, but easier for development)
   - This adds `0.0.0.0/0` to the IP whitelist
4. Click **"Finish and Close"**

## Step 5: Get Your Connection String

1. Once your cluster is ready, click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **"Python"** as the driver
4. Select **"Version 3.6 or later"**
5. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Copy this connection string** (you'll need it for your `.env` file)

## Step 6: Update Your .env File

1. Navigate to `backend/` directory
2. Create or edit `.env` file:

```env
# MongoDB Atlas Connection String
# Replace <username> and <password> with your database user credentials
DATABASE_URL=mongodb+srv://dl_user:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Database Name (will be created automatically if it doesn't exist)
DATABASE_NAME=dl_model_builder

# JWT Secret Key (generate a random string)
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### Important Notes:
- Replace `<username>` with your database username (e.g., `dl_user`)
- Replace `<password>` with your database password
- Replace `cluster0.xxxxx` with your actual cluster name
- The `DATABASE_NAME` will be created automatically when you first connect

## Step 7: Test Your Connection

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Test the connection by starting the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

3. If successful, you should see:
   ```
   Connected to MongoDB: dl_model_builder
   INFO:     Application startup complete.
   ```

4. Visit `http://localhost:8000/health` to verify the API is running

## Troubleshooting

### Connection Timeout
- **Check Network Access**: Make sure your IP address is whitelisted in Atlas
- **Check Firewall**: Ensure port 27017 is not blocked
- **Try "Allow Access from Anywhere"** for testing (remember to restrict later)

### Authentication Failed
- **Verify Username/Password**: Make sure they match exactly (case-sensitive)
- **Check Special Characters**: If your password has special characters, URL-encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - etc.

### Database Not Found
- MongoDB Atlas creates databases automatically when you first write to them
- The `DATABASE_NAME` in `.env` will be created on first connection
- No need to create it manually

### Connection String Format
Make sure your connection string looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

NOT:
```
mongodb://username:password@cluster.mongodb.net:27017/
```

## Security Best Practices

1. **Never commit `.env` file** to version control (it's in `.gitignore`)
2. **Use strong passwords** for database users
3. **Restrict IP access** in production (don't use `0.0.0.0/0`)
4. **Use environment variables** in production instead of `.env` file
5. **Rotate passwords** regularly
6. **Use MongoDB Atlas VPC Peering** for production deployments

## Free Tier Limitations

MongoDB Atlas M0 (Free) tier includes:
- ✅ 512 MB storage
- ✅ Shared RAM and vCPU
- ✅ No credit card required
- ✅ Perfect for development and small projects
- ⚠️ Limited to 1 cluster per project
- ⚠️ No backup (upgrade for backups)

## Next Steps

Once connected:
1. Your database will be automatically created on first use
2. Collections (tables) will be created automatically when you insert documents
3. Start using the API - users, models, and versions will be stored automatically

## Quick Reference

### Connection String Template:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

### Where to Find:
- **Username/Password**: Database Access → Database Users
- **Cluster Name**: Clusters → Your Cluster → Connect → Connection String
- **IP Whitelist**: Network Access → IP Access List

### Useful Links:
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Options](https://docs.mongodb.com/manual/reference/connection-string/)
- [Beanie ODM Documentation](https://beanie-odm.dev/)

