# Motion Amplification Video - Setup Guide

This project consists of three main components that need to be running simultaneously:

## Components

1. **Frontend (React)** - Port 3000
2. **Backend Server (Node.js/Express)** - Port 3001
3. **API Server (FastAPI/Python)** - Port 8080

## Prerequisites

- Node.js and npm installed
- Python 3.x installed
- MongoDB installed and running (or MongoDB Atlas account)
- FFmpeg installed (for video processing)

## Setup Instructions

### 1. Backend Server Setup

```bash
cd server
npm install
```

Create a `config.env` file in the `server` directory:

```env
Database=mongodb://localhost:27017/motion-amplification
JWT_SECRET=your-secret-key-here-change-in-production
SECRET_KEY=your-secret-key-here-change-in-production
```

**Note:** If you don't have MongoDB locally, you can use MongoDB Atlas (free tier available). Update the `Database` connection string accordingly.

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server should be running on **http://localhost:3001**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend should be running on **http://localhost:3000**

The frontend is configured to proxy API requests to the backend server on port 3001.

### 3. Python API Server Setup

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Install FastAPI and uvicorn if not already installed:
```bash
pip install fastapi uvicorn pydantic boto3
```

Install Python dependencies:
```bash
# Install essential packages for the API
python -m pip install fastapi uvicorn pydantic boto3

# Note: The full requirements.txt may have compatibility issues with Python 3.14
# If you need TensorFlow and other ML libraries, you may need Python 3.10 or 3.11
```

Start the API server:
```bash
python api.py
```

The API server should be running on **http://localhost:8080**

## Running All Services

You need to run all three services in separate terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Python API:**
```bash
python api.py
```

## Troubleshooting

### 404 Errors for /signup, /login, /videos

If you're getting 404 errors:
1. Make sure the backend server (port 3001) is running
2. Check that CORS is properly configured (should be fixed in the updated server.js)
3. Verify the frontend proxy is set to `http://localhost:3001` in `frontend/package.json`

### Database Connection Issues

If you see database connection errors:
1. Make sure MongoDB is running (if using local MongoDB)
2. Check your `config.env` file has the correct connection string
3. Verify the database name and credentials are correct

### Port Conflicts

If ports are already in use:
- Frontend (3000): Change in `frontend/package.json` scripts or set `PORT=3001` environment variable
- Backend (3001): Change in `server/server.js` line 19
- API (8080): Change in `api.py` line 108

## Default Ports Summary

- **Frontend:** http://localhost:3000
- **Backend Server:** http://localhost:3001
- **Python API:** http://localhost:8080

## Environment Variables

### Server (server/config.env)
- `Database` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SECRET_KEY` - Alternative secret key name (for compatibility)

### Python API
- AWS credentials (if using S3) - Update in `api.py` if needed

## Next Steps

1. Create a user account via the signup page
2. Login with your credentials
3. Upload a video for processing
4. View the processed output

