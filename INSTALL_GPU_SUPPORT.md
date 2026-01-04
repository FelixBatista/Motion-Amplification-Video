# Installing GPU Support for TensorFlow 2.13.0

## Current Status
- ✅ NVIDIA GPU detected: T1200 Laptop GPU (4GB)
- ✅ NVIDIA drivers installed: 581.15
- ✅ CUDA 13.0 available (but too new for TensorFlow 2.13.0)
- ❌ TensorFlow 2.13.0 is CPU-only build
- ❌ Need CUDA 11.8 and cuDNN 8.6 for TensorFlow 2.13.0

## Solution: Install CUDA 11.8 Toolkit

### Step 1: Download CUDA 11.8
1. Go to: https://developer.nvidia.com/cuda-11-8-0-download-archive
2. Select:
   - Operating System: Windows
   - Architecture: x86_64
   - Version: 11.8
   - Installer Type: exe (local)
3. Download and run the installer

### Step 2: Download cuDNN 8.6
1. Go to: https://developer.nvidia.com/cudnn
2. You'll need to create a free NVIDIA Developer account
3. Download cuDNN 8.6 for CUDA 11.8
4. Extract and copy files to CUDA installation directory:
   - Copy `bin\*` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\`
   - Copy `include\*` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\include\`
   - Copy `lib\*` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\lib\`

### Step 3: Set Environment Variables
Add to your system PATH:
```
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\libnvvp
```

### Step 4: Reinstall TensorFlow
```powershell
py -3.10 -m pip uninstall tensorflow
py -3.10 -m pip install tensorflow==2.13.0
```

### Step 5: Verify GPU Support
```powershell
py -3.10 check_gpu.py
```

You should see:
- Physical GPUs found: 1
- CUDA built: True
- GPU available: True

## Alternative: Use TensorFlow 2.15+ (Supports CUDA 12.x)

If you prefer to keep CUDA 13.0, you can upgrade to a newer TensorFlow version:

```powershell
py -3.10 -m pip uninstall tensorflow
py -3.10 -m pip install tensorflow==2.15.0
```

**Note:** TensorFlow 2.15.0 requires:
- CUDA 12.0 or 12.2
- cuDNN 8.9

You may need to install CUDA 12.2 instead of using 13.0.

## Quick Check Commands

Check NVIDIA GPU:
```powershell
nvidia-smi
```

Check CUDA version:
```powershell
nvcc --version
```

Check TensorFlow GPU:
```powershell
py -3.10 -c "import tensorflow as tf; print('GPUs:', tf.config.list_physical_devices('GPU'))"
```

## Current Recommendation

Since you have CUDA 13.0, the easiest path is:
1. Install CUDA 12.2 (compatible with newer TensorFlow)
2. Install cuDNN 8.9
3. Upgrade to TensorFlow 2.15.0

Or:
1. Install CUDA 11.8 (for TensorFlow 2.13.0)
2. Install cuDNN 8.6
3. Keep TensorFlow 2.13.0

