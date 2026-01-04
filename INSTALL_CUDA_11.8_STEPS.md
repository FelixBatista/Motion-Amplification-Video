# Step-by-Step: Installing CUDA 11.8 and cuDNN 8.6

## Prerequisites
- ✅ NVIDIA GPU: T1200 Laptop GPU (detected)
- ✅ NVIDIA Drivers: 581.15 (installed)
- ⏳ CUDA 11.8 Toolkit (to install)
- ⏳ cuDNN 8.6 (to install)

## Step 1: Download CUDA 11.8 Toolkit

### Download Link:
https://developer.nvidia.com/cuda-11-8-0-download-archive

### Installation Steps:
1. Go to the download page above
2. Select:
   - **Operating System:** Windows
   - **Architecture:** x86_64
   - **Version:** 11.8
   - **Installer Type:** exe (local)
3. Click "Download" - this will download `cuda_11.8.0_522.06_windows.exe` (or similar)
4. Run the installer as Administrator
5. During installation:
   - Choose "Express" installation (recommended)
   - Or "Custom" if you want to select components
   - **Important:** Make sure "CUDA" is checked
   - Installation path will be: `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\`

### Verify CUDA Installation:
After installation, open a NEW PowerShell window and run:
```powershell
nvcc --version
```

You should see:
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2022 NVIDIA Corporation
Built on ...
Cuda compilation tools, release 11.8, V11.8.89
```

## Step 2: Download cuDNN 8.6

### Download Link:
https://developer.nvidia.com/cudnn

### Steps:
1. Go to the cuDNN download page
2. **You'll need to create a free NVIDIA Developer account** (if you don't have one)
3. Log in to your NVIDIA account
4. Accept the cuDNN Software License Agreement
5. Download **cuDNN v8.6.0 for CUDA 11.x** (Windows version)
   - File will be something like: `cudnn-windows-x86_64-8.6.0.163_cuda11-archive.zip`

## Step 3: Install cuDNN 8.6

### Extract and Copy Files:
1. Extract the downloaded ZIP file (e.g., to `C:\cudnn\`)
2. You'll see three folders: `bin`, `include`, `lib`
3. Copy files to your CUDA installation directory:

**Open PowerShell as Administrator and run:**

```powershell
# Set paths (adjust if your CUDA is installed elsewhere)
$CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8"
$CUDNN_PATH = "C:\cudnn\cudnn-windows-x86_64-8.6.0.163_cuda11-archive"  # Adjust to your extracted path

# Copy bin files
Copy-Item "$CUDNN_PATH\bin\*" -Destination "$CUDA_PATH\bin\" -Force

# Copy include files
Copy-Item "$CUDNN_PATH\include\*" -Destination "$CUDA_PATH\include\" -Force

# Copy lib files
Copy-Item "$CUDNN_PATH\lib\*" -Destination "$CUDA_PATH\lib\" -Force
```

**Or manually:**
- Copy all files from `cudnn\bin\` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\`
- Copy all files from `cudnn\include\` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\include\`
- Copy all files from `cudnn\lib\` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\lib\`

## Step 4: Set Environment Variables

### Add to System PATH:
1. Open "Environment Variables" (search in Windows Start menu)
2. Under "System variables", find "Path" and click "Edit"
3. Add these paths (if not already present):
   ```
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\libnvvp
   ```
4. Click "OK" to save

### Or via PowerShell (as Administrator):
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin;C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\libnvvp", [EnvironmentVariableTarget]::Machine)
```

## Step 5: Verify Installation

### Check CUDA:
```powershell
nvcc --version
```

### Check cuDNN:
```powershell
# Check if cuDNN DLL exists
Test-Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\cudnn64_8.dll"
```

Should return: `True`

## Step 6: Reinstall TensorFlow

After CUDA and cuDNN are installed, reinstall TensorFlow:

```powershell
py -3.10 -m pip uninstall tensorflow -y
py -3.10 -m pip install tensorflow==2.13.0
```

## Step 7: Verify GPU Support

```powershell
py -3.10 check_gpu.py
```

You should now see:
- ✅ Physical GPUs found: 1
- ✅ CUDA built: True
- ✅ GPU available: True

## Troubleshooting

### If nvcc is not found:
- Restart your computer after installing CUDA
- Verify PATH environment variable includes CUDA bin directory
- Open a NEW PowerShell window (environment variables are loaded at startup)

### If TensorFlow still doesn't see GPU:
1. Verify CUDA is in PATH: `nvcc --version`
2. Verify cuDNN files are copied correctly
3. Restart your computer
4. Reinstall TensorFlow: `py -3.10 -m pip uninstall tensorflow && py -3.10 -m pip install tensorflow==2.13.0`

### If you get DLL errors:
- Make sure all cuDNN files are in the correct CUDA directories
- Check that CUDA 11.8 bin directory is in PATH
- Restart your computer

## Next Steps

Once GPU is working:
1. Run a test video processing to verify GPU acceleration
2. Check GPU usage in Task Manager → Performance → GPU
3. Processing should be 10-50x faster than CPU-only mode

