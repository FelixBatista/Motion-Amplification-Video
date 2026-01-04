# CUDA 11.8 and cuDNN 8.6 Installation Helper Script
# Run this AFTER installing CUDA 11.8 and cuDNN 8.6

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CUDA 11.8 and cuDNN 8.6 Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if CUDA 11.8 is installed
$CUDA_11_8_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8"
if (Test-Path $CUDA_11_8_PATH) {
    Write-Host "[OK] CUDA 11.8 found at: $CUDA_11_8_PATH" -ForegroundColor Green
    
    # Check nvcc
    $nvccPath = Join-Path $CUDA_11_8_PATH "bin\nvcc.exe"
    if (Test-Path $nvccPath) {
        Write-Host "[OK] nvcc compiler found" -ForegroundColor Green
        $nvccVersion = & $nvccPath --version 2>&1 | Select-String "release"
        Write-Host "     Version: $nvccVersion" -ForegroundColor Gray
    } else {
        Write-Host "[WARNING] nvcc.exe not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] CUDA 11.8 not found at expected location" -ForegroundColor Red
    Write-Host "        Expected: $CUDA_11_8_PATH" -ForegroundColor Yellow
    Write-Host "        Please install CUDA 11.8 first" -ForegroundColor Yellow
    exit 1
}

# Check cuDNN files
Write-Host ""
Write-Host "Checking cuDNN 8.6 files..." -ForegroundColor Cyan

$cudnnFiles = @(
    "bin\cudnn64_8.dll",
    "include\cudnn.h",
    "lib\cudnn.lib"
)

$allFilesPresent = $true
foreach ($file in $cudnnFiles) {
    $fullPath = Join-Path $CUDA_11_8_PATH $file
    if (Test-Path $fullPath) {
        Write-Host "[OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $file" -ForegroundColor Red
        $allFilesPresent = $false
    }
}

if (-not $allFilesPresent) {
    Write-Host ""
    Write-Host "[WARNING] Some cuDNN files are missing" -ForegroundColor Yellow
    Write-Host "         Please copy cuDNN files to CUDA 11.8 directory" -ForegroundColor Yellow
    Write-Host "         See INSTALL_CUDA_11.8_STEPS.md for instructions" -ForegroundColor Yellow
}

# Check PATH
Write-Host ""
Write-Host "Checking PATH environment variable..." -ForegroundColor Cyan

$cudaBinPath = Join-Path $CUDA_11_8_PATH "bin"
$pathEntries = $env:PATH -split ';'
$cudaInPath = $pathEntries | Where-Object { $_ -like "*CUDA\v11.8\bin*" }

if ($cudaInPath) {
    Write-Host "[OK] CUDA 11.8 bin is in PATH" -ForegroundColor Green
} else {
    Write-Host "[WARNING] CUDA 11.8 bin is NOT in PATH" -ForegroundColor Yellow
    Write-Host "         Adding to PATH for current session..." -ForegroundColor Yellow
    $env:PATH = "$env:PATH;$cudaBinPath"
    Write-Host "         To make permanent, add to System Environment Variables:" -ForegroundColor Yellow
    Write-Host "         $cudaBinPath" -ForegroundColor Gray
}

# Verify nvcc is accessible
Write-Host ""
Write-Host "Verifying nvcc is accessible..." -ForegroundColor Cyan
try {
    $nvccVersion = nvcc --version 2>&1
    if ($nvccVersion -match "release 11\.8") {
        Write-Host "[OK] nvcc (CUDA 11.8) is accessible" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] nvcc found but version may not be 11.8" -ForegroundColor Yellow
        Write-Host $nvccVersion -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] nvcc not accessible. Check PATH." -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($allFilesPresent -and $cudaInPath) {
    Write-Host "[SUCCESS] CUDA 11.8 and cuDNN 8.6 appear to be installed correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your computer (to ensure PATH is loaded)" -ForegroundColor Yellow
    Write-Host "2. Reinstall TensorFlow:" -ForegroundColor Yellow
    Write-Host "   py -3.10 -m pip uninstall tensorflow -y" -ForegroundColor Gray
    Write-Host "   py -3.10 -m pip install tensorflow==2.13.0" -ForegroundColor Gray
    Write-Host "3. Verify GPU support:" -ForegroundColor Yellow
    Write-Host "   py -3.10 check_gpu.py" -ForegroundColor Gray
} else {
    Write-Host "[INCOMPLETE] Please complete the installation steps" -ForegroundColor Yellow
    Write-Host "            See INSTALL_CUDA_11.8_STEPS.md for details" -ForegroundColor Yellow
}

Write-Host ""

