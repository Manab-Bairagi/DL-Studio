# Debug Registration Issue

## Problem
User is being saved to database during registration, but getting "not authenticated" error.

## What to Check

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab
- Look for any error messages
- Check the Network tab to see API responses

### 2. Check Backend Logs
Look at the terminal where uvicorn is running:
- Check for any error messages
- Look for "Password verification error" messages

### 3. Test Registration Flow Manually

**Step 1: Register**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

**Step 2: Try Login**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123"
```

### 4. Common Issues

**Issue: Password hash mismatch**
- The password might be getting corrupted during storage
- Check if password has special characters that need encoding

**Issue: Auto-login timing**
- The auto-login might be happening too fast after registration
- Try logging in manually after registration

**Issue: Token not being stored**
- Check browser localStorage for "auth-storage" key
- Verify token is being saved

## Quick Fix

If auto-login fails, you can:
1. Register the account
2. Manually go to the login page
3. Login with the same credentials

The account should work fine for manual login even if auto-login fails.

