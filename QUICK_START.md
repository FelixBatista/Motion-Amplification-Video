# Quick Start Guide - Standalone Application

## Installation

1. **Install Python dependencies:**
   ```bash
   python -m pip install fastapi uvicorn python-multipart
   ```

2. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

## Running the Application

Simply run:
```bash
python app.py
```

Or use the batch file:
```bash
run_standalone.bat
```

The application will be available at: **http://localhost:8000**

## Troubleshooting

### "python-multipart" error

If you get an error about python-multipart, install it:
```bash
python -m pip install python-multipart
```

Make sure you're using the same Python that runs the app. Check with:
```bash
python --version
python -m pip install python-multipart
```

### Port already in use

If port 8000 is in use, set a different port:
```bash
set PORT=8001
python app.py
```

### Frontend not found

Make sure you've built the frontend:
```bash
cd frontend
npm run build
cd ..
```

## Features

- ✅ No authentication required
- ✅ No database needed
- ✅ No internet connection required
- ✅ All videos stored locally in `data/uploads/`
- ✅ Single Python server handles everything
