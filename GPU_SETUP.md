# GPU Setup Guide

This application uses TensorFlow for neural network processing. To utilize GPU acceleration, you need to have CUDA and cuDNN installed.

## Quick Check

Run this command to check if your GPU is detected:

```powershell
python check_gpu.py
```

This will show:
- Whether GPUs are detected
- TensorFlow version
- CUDA availability
- GPU computation test

## Installing GPU Support

### Step 1: Verify You Have an NVIDIA GPU

```powershell
nvidia-smi
```

If this command works, you have an NVIDIA GPU driver installed.

### Step 2: Install CUDA Toolkit

1. Download CUDA Toolkit from: https://developer.nvidia.com/cuda-downloads
2. Choose your operating system (Windows)
3. Install the toolkit (usually includes cuDNN)

**For TensorFlow 2.13.0, you need:**
- CUDA 11.8 or 11.2
- cuDNN 8.6 or 8.1

### Step 3: Verify TensorFlow GPU Support

After installing CUDA, verify TensorFlow can see your GPU:

```powershell
python -c "import tensorflow as tf; print('GPUs:', tf.config.list_physical_devices('GPU'))"
```

If this shows your GPU, you're ready to go!

### Step 4: Test GPU Processing

Run the GPU check script:

```powershell
python check_gpu.py
```

## Current Configuration

The application is configured to:
- ✅ Automatically detect and use GPU if available
- ✅ Use dynamic memory growth (doesn't allocate all GPU memory at once)
- ✅ Fall back to CPU if GPU is not available
- ✅ Use up to 90% of available GPU memory

## Troubleshooting

### "No GPU found" but you have an NVIDIA GPU

1. **Check CUDA installation:**
   ```powershell
   nvcc --version
   ```

2. **Check TensorFlow GPU support:**
   ```powershell
   python -c "import tensorflow as tf; print(tf.test.is_built_with_cuda())"
   ```
   Should print `True`

3. **Reinstall TensorFlow with GPU support:**
   ```powershell
   pip uninstall tensorflow
   pip install tensorflow==2.13.0
   ```

### GPU detected but not being used

1. Check that CUDA_VISIBLE_DEVICES is not set incorrectly
2. Verify GPU memory is not already allocated by another process
3. Check Windows Task Manager → Performance → GPU to see if GPU is being used

### Performance Issues

- GPU processing is typically 10-50x faster than CPU
- If processing is still slow, check:
  - GPU utilization in Task Manager
  - GPU memory usage
  - Whether operations are actually running on GPU (check logs)

## Manual GPU Selection

If you have multiple GPUs and want to use a specific one, set the environment variable before running:

```powershell
$env:CUDA_VISIBLE_DEVICES="0"  # Use first GPU
python app.py
```

Or to use a different GPU:

```powershell
$env:CUDA_VISIBLE_DEVICES="1"  # Use second GPU
python app.py
```

## Notes

- The application will automatically use GPU if available
- CPU fallback is automatic if GPU is not available
- GPU memory grows dynamically (doesn't pre-allocate)
- Processing speed with GPU: ~10-50x faster than CPU

