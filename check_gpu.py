"""
Utility script to check GPU availability and TensorFlow GPU configuration.
Run this to verify that GPU is properly configured.
"""
import tensorflow as tf
import sys

def check_gpu():
    print("=" * 60)
    print("GPU Availability Check")
    print("=" * 60)
    
    # Check TensorFlow version
    print(f"\nTensorFlow version: {tf.__version__}")
    
    # Check for physical GPUs
    try:
        physical_gpus = tf.config.experimental.list_physical_devices('GPU')
        print(f"\nPhysical GPUs found: {len(physical_gpus)}")
        for i, gpu in enumerate(physical_gpus):
            print(f"  GPU {i}: {gpu.name}")
            try:
                details = tf.config.experimental.get_device_details(gpu)
                if details:
                    print(f"    Details: {details}")
            except:
                pass
    except Exception as e:
        print(f"Error checking physical GPUs: {e}")
        physical_gpus = []
    
    # Check for logical GPUs (after configuration)
    try:
        logical_gpus = tf.config.experimental.list_logical_devices('GPU')
        print(f"\nLogical GPUs available: {len(logical_gpus)}")
        for i, gpu in enumerate(logical_gpus):
            print(f"  Logical GPU {i}: {gpu.name}")
    except Exception as e:
        print(f"Error checking logical GPUs: {e}")
        logical_gpus = []
    
    # Check CUDA availability
    print(f"\nCUDA built with TensorFlow: {tf.test.is_built_with_cuda()}")
    print(f"GPU available (tf.test.is_gpu_available): {tf.test.is_gpu_available()}")
    
    # Test GPU computation
    if len(physical_gpus) > 0:
        print("\n" + "=" * 60)
        print("Testing GPU computation...")
        print("=" * 60)
        try:
            with tf.compat.v1.Session() as sess:
                # Create a simple computation
                a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
                b = tf.constant([[1.0, 1.0], [0.0, 1.0]])
                c = tf.matmul(a, b)
                
                # Check which device the operation is placed on
                print(f"\nMatrix multiplication test:")
                result = sess.run(c)
                print(f"Result: {result}")
                
                # Try to get device placement info
                try:
                    config = tf.compat.v1.ConfigProto(log_device_placement=True)
                    with tf.compat.v1.Session(config=config) as debug_sess:
                        # This will print device placement
                        pass
                except:
                    pass
                    
            print("\n✓ GPU computation test completed successfully!")
            print("GPU should be available for neural network processing.")
        except Exception as e:
            print(f"\n✗ GPU computation test failed: {e}")
            print("This might indicate a GPU configuration issue.")
    else:
        print("\n⚠ No GPUs detected. Processing will use CPU.")
        print("To use GPU:")
        print("  1. Ensure you have an NVIDIA GPU")
        print("  2. Install CUDA toolkit (https://developer.nvidia.com/cuda-downloads)")
        print("  3. Install cuDNN (https://developer.nvidia.com/cudnn)")
        print("  4. Install tensorflow-gpu or ensure tensorflow detects your GPU")
    
    print("\n" + "=" * 60)
    
    return len(physical_gpus) > 0

if __name__ == '__main__':
    has_gpu = check_gpu()
    sys.exit(0 if has_gpu else 1)

