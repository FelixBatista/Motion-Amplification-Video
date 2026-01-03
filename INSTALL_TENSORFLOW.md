# Installing TensorFlow and Dependencies

## Important Note

TensorFlow and the video processing dependencies need to be installed separately. The installation can take several minutes as TensorFlow is a large package (~500MB+).

## Step 1: Install Essential Packages

```powershell
pip install configobj setproctitle
```

## Step 2: Install TensorFlow

**Warning:** TensorFlow may have compatibility issues with Python 3.14. Python 3.10 or 3.11 is recommended.

For Python 3.10/3.11 (recommended):
```powershell
pip install tensorflow==2.13.0
```

For Python 3.13/3.14 (may work, but not officially supported):
```powershell
pip install tensorflow
```

**Note:** The installation may take 5-10 minutes or more depending on your internet connection.

## Step 3: Verify Installation

After installation completes, verify:
```powershell
python -c "import tensorflow; print('TensorFlow:', tensorflow.__version__)"
python -c "from configobj import ConfigObj; print('configobj works')"
python -c "import setproctitle; print('setproctitle works')"
```

## Alternative: Use Python 3.10 or 3.11

If you encounter issues with Python 3.14:
1. Install Python 3.10 or 3.11 from python.org
2. Create a virtual environment:
   ```powershell
   python3.11 -m venv venv
   venv\Scripts\activate
   pip install tensorflow==2.13.0 configobj setproctitle
   ```

## After Installation

Once all packages are installed, restart your application:
```powershell
python app.py
```

Video processing should now work!

