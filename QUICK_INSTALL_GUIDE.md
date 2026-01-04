# Quick Install Guide: CUDA 11.8 + cuDNN 8.6

## Current Status
- ✅ CUDA 13.0 is installed (but TensorFlow 2.13.0 needs 11.8)
- ✅ NVIDIA GPU detected: T1200 Laptop GPU
- ⏳ Need to install CUDA 11.8 alongside 13.0
- ⏳ Need to install cuDNN 8.6

**Note:** Multiple CUDA versions can coexist. We'll install 11.8 without removing 13.0.

## Installation Steps

### 1. Download CUDA 11.8 Toolkit

**Direct Download Link:**
https://developer.nvidia.com/cuda-11-8-0-download-archive

**Steps:**
1. Click the link above
2. Select:
   - **OS:** Windows
   - **Arch:** x86_64  
   - **Version:** 11.8
   - **Installer:** exe (local)
3. Download `cuda_11.8.0_522.06_windows.exe` (~3GB)
4. **Run as Administrator**
5. Choose **"Express"** installation
6. Wait for installation to complete (~10-15 minutes)

### 2. Download cuDNN 8.6

**Download Link:**
https://developer.nvidia.com/cudnn

**Steps:**
1. Create free NVIDIA Developer account (if needed)
2. Log in
3. Accept cuDNN license agreement
4. Download **cuDNN v8.6.0 for CUDA 11.x** (Windows)
   - File: `cudnn-windows-x86_64-8.6.0.163_cuda11-archive.zip` (~500MB)
5. Extract the ZIP file (e.g., to `C:\cudnn\`)

### 3. Install cuDNN Files

**Option A: PowerShell Script (Recommended)**

Open PowerShell as Administrator and run:

```powershell
# Adjust these paths to match your installation
$CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8"
$CUDNN_EXTRACTED = "C:\cudnn\cudnn-windows-x86_64-8.6.0.163_cuda11-archive"  # Change to your path

# Copy files
Copy-Item "$CUDNN_EXTRACTED\bin\*" -Destination "$CUDA_PATH\bin\" -Force
Copy-Item "$CUDNN_EXTRACTED\include\*" -Destination "$CUDA_PATH\include\" -Force  
Copy-Item "$CUDNN_EXTRACTED\lib\*" -Destination "$CUDA_PATH\lib\" -Force

Write-Host "cuDNN files copied successfully!" -ForegroundColor Green
```

**Option B: Manual Copy**

1. Open File Explorer
2. Navigate to extracted cuDNN folder
3. Copy all files from:
   - `bin\` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\`
   - `include\` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\include\`
   - `lib\` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\lib\`

### 4. Add CUDA 11.8 to PATH

**Option A: PowerShell (Administrator)**

```powershell
$cudaPath = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$cudaPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$cudaPath", "Machine")
    Write-Host "Added CUDA 11.8 to PATH" -ForegroundColor Green
} else {
    Write-Host "CUDA 11.8 already in PATH" -ForegroundColor Yellow
}
```

**Option B: Manual (GUI)**
1. Press `Win + X` → System → Advanced system settings
2. Click "Environment Variables"
3. Under "System variables", select "Path" → "Edit"
4. Click "New" and add:
   ```
   C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin
   ```
5. Click "OK" on all dialogs

### 5. Verify Installation

Run the helper script:

```powershell
.\install_cuda_helper.ps1
```

Or manually check:

```powershell
# Check CUDA 11.8
nvcc --version

# Check cuDNN
Test-Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\cudnn64_8.dll"
```

### 6. Restart Computer

**Important:** Restart your computer to ensure all environment variables are loaded.

### 7. Reinstall TensorFlow

After restart, open PowerShell and run:

```powershell
py -3.10 -m pip uninstall tensorflow -y
py -3.10 -m pip install tensorflow==2.13.0
```

### 8. Verify GPU Support

```powershell
py -3.10 check_gpu.py
```

**Expected Output:**
```
✓ Found 1 GPU(s). GPU acceleration will be used.
  GPU 0: /physical_device:GPU:0
CUDA built: True
GPU available: True
```

## Troubleshooting

### "nvcc not found" after installation
- Restart your computer
- Open a NEW PowerShell window
- Verify PATH: `$env:PATH -split ';' | Select-String CUDA`

### TensorFlow still shows "CUDA built: False"
- Make sure you restarted after installing CUDA
- Verify cuDNN files are in CUDA 11.8 directories
- Try: `py -3.10 -m pip cache purge` then reinstall TensorFlow

### DLL errors
- Ensure all cuDNN files are copied correctly
- Check that CUDA 11.8 bin is in PATH
- Restart computer

## Need Help?

If installation fails:
1. Check `INSTALL_CUDA_11.8_STEPS.md` for detailed steps
2. Run `.\install_cuda_helper.ps1` to diagnose issues
3. Verify CUDA 11.8 installation: `nvcc --version` should show 11.8

