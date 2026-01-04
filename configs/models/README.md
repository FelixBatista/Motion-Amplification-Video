# Model Configuration Directory

This directory contains model architecture and training configuration files. These files are **internal** and should not be modified by end users.

## Files

### `magnet_default.conf`
Default model configuration for the Y-Net architecture. Contains:
- Model architecture parameters (encoder/decoder structure)
- Training dataset information
- Checkpoint paths
- Image size and processing parameters

### `o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3.conf` (Legacy)
Original configuration file from the previous system. This file has been moved here for backward compatibility.

**Note:** This file is deprecated. For new projects, use presets in `configs/presets/` instead.

## Usage

Model configurations are automatically selected by the system based on the preset being used. Users should not need to modify these files directly.

For user-facing configuration, see `configs/presets/` directory.

## Migration

If you have custom model configurations from the old system:

1. Keep model-specific parameters (architecture, dataset, etc.) in this directory
2. Extract runtime parameters (amplification, frequency bands, etc.) to presets
3. See `docs/MIGRATION_GUIDE.md` for detailed migration instructions

