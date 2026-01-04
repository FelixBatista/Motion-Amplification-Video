import argparse
import os
import shutil
import tensorflow as tf
import setproctitle
from configobj import ConfigObj
try:
    from validate import Validator
except ImportError:
    from configobj.validate import Validator
from magnet import MagNet3Frames


parser = argparse.ArgumentParser(description='')
parser.add_argument('--phase', dest='phase', default='train',
                    help='train, test, run, interactive')
parser.add_argument('--config_file', dest='config_file', required=True,
                    help='path to config file')
parser.add_argument('--config_spec', dest='config_spec',
                    default='configs/configspec.conf',
                    help='path to config spec file')
# for inference
parser.add_argument('--vid_dir', dest='vid_dir', default=None,
                    help='Video folder to run the network on.')
parser.add_argument('--frame_ext', dest='frame_ext', default='png',
                    help='Video frame file extension.')
parser.add_argument('--out_dir', dest='out_dir', default=None,
                    help='Output folder of the video run.')
parser.add_argument('--amplification_factor', dest='amplification_factor',
                    type=float, default=5,
                    help='Magnification factor for inference.')
parser.add_argument('--velocity_mag', dest='velocity_mag', action='store_true',
                    help='Whether to do velocity magnification.')
# For temporal operation.
parser.add_argument('--fl', dest='fl', type=float,
                    help='Low cutoff Frequency.')
parser.add_argument('--fh', dest='fh', type=float,
                    help='High cutoff Frequency.')
parser.add_argument('--fs', dest='fs', type=float,
                    help='Sampling rate.')
parser.add_argument('--n_filter_tap', dest='n_filter_tap', type=int,
                    help='Number of filter tap required.')
parser.add_argument('--filter_type', dest='filter_type', type=str,
                    help='Type of filter to use, must be Butter or FIR.')

arguments = parser.parse_args()


def main(args):
    print(args.config_file)
    configspec = ConfigObj(args.config_spec, raise_errors=True)
    config = ConfigObj(args.config_file,configspec=configspec,raise_errors=True,file_error=True)
    # Validate to get all the default values.
    config.validate(Validator())
    if not os.path.exists(config['exp_dir']):
        # checkpoint directory.
        os.makedirs(os.path.join(config['exp_dir'], 'checkpoint'))
        # Tensorboard logs directory.
        os.makedirs(os.path.join(config['exp_dir'], 'logs'))
        # default output directory for this experiment.
        os.makedirs(os.path.join(config['exp_dir'], 'sample'))
    network_type = config['architecture']['network_arch']
    exp_name = config['exp_name']
    setproctitle.setproctitle('{}_{}_{}' \
                              .format(args.phase, network_type, exp_name))
    
    # Check for GPU availability and configure
    try:
        gpus = tf.config.experimental.list_physical_devices('GPU')
        use_gpu = len(gpus) > 0
        
        if use_gpu:
            try:
                # Enable memory growth for all GPUs to avoid allocating all memory at once
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                print(f"[OK] Found {len(gpus)} GPU(s). GPU acceleration will be used.")
                for i, gpu in enumerate(gpus):
                    print(f"  GPU {i}: {gpu.name}")
            except RuntimeError as e:
                print(f"Warning: GPU configuration error: {e}")
                use_gpu = False
        else:
            print("[WARNING] No GPU found. Using CPU (processing will be slower).")
    except Exception as e:
        print(f"Warning: Could not check for GPUs: {e}")
        use_gpu = False
        gpus = []
    
    # Configure TensorFlow session for optimal GPU/CPU usage
    tfconfig = tf.compat.v1.ConfigProto(
        allow_soft_placement=True,  # Allow fallback to CPU if operation not supported on GPU
        log_device_placement=False,  # Set to True for debugging which device is used
    )
    
    if use_gpu:
        # Configure GPU options for optimal performance
        tfconfig.gpu_options.allow_growth = True  # Allow GPU memory to grow dynamically
        tfconfig.gpu_options.per_process_gpu_memory_fraction = 0.9  # Use up to 90% of GPU memory
        # Ensure CUDA is visible (should be set before TF import, but set here as fallback)
        if 'CUDA_VISIBLE_DEVICES' not in os.environ:
            os.environ['CUDA_VISIBLE_DEVICES'] = '0'
        print("[OK] GPU configuration applied. Neural network operations will use GPU.")
    else:
        # Force CPU usage if no GPU
        tfconfig.device_count['GPU'] = 0
        if 'CUDA_VISIBLE_DEVICES' in os.environ:
            del os.environ['CUDA_VISIBLE_DEVICES']
        print("[OK] CPU mode configured.")

    with tf.compat.v1.Session(config=tfconfig) as sess:
        model = MagNet3Frames(sess, exp_name, config['architecture'])
        checkpoint = config['training']['checkpoint_dir']
        if args.phase == 'train':
            train_config = config['training']
            if not os.path.exists(train_config['checkpoint_dir']):
                os.makedirs(train_config['checkpoint_dir'])
            print(train_config)

            model.train(train_config)
        if args.phase == 'run':
            model.run(checkpoint,args.vid_dir, args.frame_ext,args.out_dir, args.amplification_factor, args.velocity_mag)

        elif args.phase == 'run_temporal':
            model.run_temporal(checkpoint, args.vid_dir, args.frame_ext, args.out_dir, args.amplification_factor, args.fl, args.fh, args.fs, args.n_filter_tap, args.filter_type)

        else:
            raise ValueError('Invalid phase argument. ''Expected ["train", "run", "run_temporal"], ''got ' + args.phase)


if __name__ == '__main__':
    main(arguments)
