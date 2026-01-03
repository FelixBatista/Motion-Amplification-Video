# Fix: TensorFlow Requires Python 3.10 or 3.11

## Problem

You're using **Python 3.14.2**, but TensorFlow doesn't support Python 3.14 yet. TensorFlow currently supports Python 3.8 through 3.11.

## Solution: Install Python 3.11

### Step 1: Download Python 3.11
- Go to: https://www.python.org/downloads/release/python-3119/
- Download "Windows installer (64-bit)"
- Run the installer
- **Important:** Check "Add Python to PATH" during installation

### Step 2: Verify Installation
Open a new terminal and check:
```powershell
python3.11 --version
```

### Step 3: Install TensorFlow
```powershell
python3.11 -m pip install tensorflow==2.13.0 configobj setproctitle fastapi uvicorn python-multipart
```

### Step 4: Run Application with Python 3.11
Update `run_standalone.bat` to use Python 3.11, or run directly:
```powershell
python3.11 app.py
```

## Alternative: Use py launcher

If you install Python 3.11, Windows py launcher can help:
```powershell
py -3.11 -m pip install tensorflow==2.13.0 configobj setproctitle
py -3.11 app.py
```

## Why This is Needed

- TensorFlow 2.13.0 supports Python 3.8-3.11
- Python 3.14 is too new - TensorFlow hasn't been compiled for it yet
- Python 3.11 is stable and well-supported by TensorFlow

