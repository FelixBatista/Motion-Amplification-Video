# MongoDB Setup Guide

## The Issue

You're seeing `MongooseError: Operation buffering timed out` which means MongoDB is not running or not accessible.

## Option 1: Use MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster
4. Get your connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/motion-amplification?retryWrites=true&w=majority
   ```
5. Update `server/config.env`:
   ```env
   Database=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/motion-amplification?retryWrites=true&w=majority
   ```

## Option 2: Install Local MongoDB

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install it (default installation is fine)
3. MongoDB will run as a Windows service automatically
4. Verify it's running:
   ```bash
   netstat -ano | findstr :27017
   ```
5. Your `server/config.env` should already be correct:
   ```env
   Database=mongodb://localhost:27017/motion-amplification
   ```

### If MongoDB Service is Not Running:
```bash
# Start MongoDB service
net start MongoDB

# Or if installed differently, find the MongoDB service and start it from Services
```

## Verify Connection

After setting up MongoDB, restart your backend server:
```bash
cd server
npm start
```

You should see: `✓ MongoDB connection successful`

If you still see connection errors, check:
- MongoDB is actually running
- The connection string in `server/config.env` is correct
- No firewall is blocking port 27017 (for local MongoDB)

## Quick Test

Once MongoDB is connected, try:
1. Go to http://localhost:3000/signup
2. Create an account
3. The signup should work without errors

