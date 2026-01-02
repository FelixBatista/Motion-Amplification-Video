# Quick Start Guide

## Before You Start

1. **Install CORS package** (if not already installed):
   ```bash
   cd server
   npm install cors
   ```

2. **Create database config file**:
   - Copy `server/config.env.example` to `server/config.env`
   - Update the MongoDB connection string
   - Set your JWT secret keys

## Start All Services

### Option 1: Use the Batch Script (Windows)
```bash
start-all.bat
```

### Option 2: Manual Start (3 Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd server
npm install cors  # If not already installed
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Python API:**
```bash
# First, install required packages (if not already done):
python -m pip install fastapi uvicorn pydantic boto3

# Then start the API:
python api.py
```

## Verify Everything is Working

1. **Backend Server**: Open http://localhost:3001/health
   - Should return: `{"status":"ok","message":"Server is running"}`

2. **Frontend**: Open http://localhost:3000
   - Should load the homepage

3. **Python API**: Check terminal for "Starting server..." message
   - Should be running on port 8080

## Common Issues Fixed

✅ **CORS errors** - Fixed by adding CORS middleware to server
✅ **404 errors** - Routes are properly configured, just need all services running
✅ **Port conflicts** - All ports are clearly documented

## Port Summary

- Frontend: **3000**
- Backend: **3001**  
- Python API: **8080**

## Next Steps

1. Make sure MongoDB is running
2. Create `server/config.env` with your database connection
3. Start all three services
4. Try signing up a new user at http://localhost:3000/signup

