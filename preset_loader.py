"""
Preset loader and resolver for motion amplification video processing.
Handles loading presets and resolving "auto" values using auto-tuning results.
"""
import os
from pathlib import Path
from configobj import ConfigObj
from typing import Dict, Any, Optional
import auto_tuning


def load_preset(preset_name: str) -> ConfigObj:
    """
    Load a preset configuration file.
    
    Args:
        preset_name: Name of preset (e.g., "general_auto") or full path
        
    Returns:
        ConfigObj instance with preset configuration
    """
    # If preset_name doesn't have extension, add .conf
    if not preset_name.endswith('.conf'):
        preset_name = f"{preset_name}.conf"
    
    # Check if it's a full path
    if os.path.isabs(preset_name) or '/' in preset_name or '\\' in preset_name:
        preset_path = preset_name
    else:
        # Look in presets directory
        preset_path = os.path.join("configs", "presets", preset_name)
    
    if not os.path.exists(preset_path):
        raise FileNotFoundError(f"Preset not found: {preset_path}")
    
    # Load preset (no validation against configspec for presets)
    preset = ConfigObj(preset_path)
    return preset


def resolve_auto_values(preset: ConfigObj, video_metadata: Dict[str, Any],
                        auto_tuning_results: Dict[str, Any]) -> ConfigObj:
    """
    Resolve all "auto" values in preset using auto-tuning results.
    
    Args:
        preset: Preset ConfigObj
        video_metadata: Dictionary with video info (fps, etc.)
        auto_tuning_results: Dictionary with auto-tuning results (roi, frequencies, etc.)
        
    Returns:
        ConfigObj with all "auto" values resolved
    """
    resolved = preset.copy()
    
    # Resolve [run] section
    if 'run' in resolved:
        run_section = resolved['run']
        
        # Resolve mode
        if run_section.get('mode', '').lower() == 'auto':
            frequencies = auto_tuning_results.get('frequencies', [])
            resolved['run']['mode'] = auto_tuning.auto_choose_mode(frequencies)
        
        # Resolve roi
        if run_section.get('roi', '').lower() == 'auto':
            roi = auto_tuning_results.get('roi', {})
            if roi and roi.get('w', 0) > 0:
                resolved['run']['roi'] = f"{roi['x']},{roi['y']},{roi['w']},{roi['h']}"
            else:
                resolved['run']['roi'] = 'auto'  # Keep auto if detection failed
        
        # Resolve strength (amplification factor)
        if run_section.get('strength', '').lower() == 'auto':
            safe_amp = auto_tuning_results.get('suggested_amplification', 30)
            # Map to 1-100 scale (inverse of strength * 0.5 mapping)
            resolved['run']['strength'] = str(min(100, int(safe_amp * 2)))
        elif run_section.get('strength', '').isdigit():
            # Keep manual value
            pass
        else:
            # Default if invalid
            resolved['run']['strength'] = '30'
        
        # Resolve stabilization
        if run_section.get('stabilization', '').lower() == 'auto':
            # Default to "on" for auto
            resolved['run']['stabilization'] = 'on'
    
    # Resolve [temporal] section
    if 'temporal' in resolved:
        temporal_section = resolved['temporal']
        
        # Resolve enabled
        if temporal_section.get('enabled', '').lower() == 'auto':
            frequencies = auto_tuning_results.get('frequencies', [])
            mode = auto_tuning.auto_choose_mode(frequencies)
            resolved['temporal']['enabled'] = 'on' if mode == 'temporal' else 'off'
        
        # Resolve band (fl, fh)
        if temporal_section.get('band', '').lower() == 'auto':
            frequencies = auto_tuning_results.get('frequencies', [])
            if frequencies:
                # Use top frequency peak
                top_freq = frequencies[0]['freq']
                # Create band around peak: [0.7*f0, 1.3*f0]
                fl = max(0.01, top_freq * 0.7)
                fh = min(video_metadata.get('fps', 30.0) / 2, top_freq * 1.3)
                resolved['temporal']['band'] = f"{fl:.3f},{fh:.3f}"
            else:
                # Default band if no frequencies detected
                resolved['temporal']['band'] = '0.04,0.4'
        
        # Resolve velocity_mag
        if temporal_section.get('velocity_mag', '').lower() == 'auto':
            frequencies = auto_tuning_results.get('frequencies', [])
            if frequencies:
                top_freq = frequencies[0]['freq']
                # Enable velocity mag for high-frequency vibrations (>5 Hz)
                resolved['temporal']['velocity_mag'] = 'true' if top_freq > 5.0 else 'false'
            else:
                resolved['temporal']['velocity_mag'] = 'false'
    
    return resolved


def preset_to_cli_args(preset: ConfigObj, model_config_path: str = None,
                       video_name: str = "", overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Convert resolved preset to CLI arguments for main.py.
    
    Args:
        preset: Resolved preset ConfigObj
        model_config_path: Path to model config file (default: configs/models/magnet_default.conf)
        video_name: Name of video (for output directory)
        overrides: Optional dictionary of parameter overrides
        
    Returns:
        Dictionary of CLI arguments
    """
    if model_config_path is None:
        model_config_path = "configs/models/magnet_default.conf"
    
    if overrides is None:
        overrides = {}
    
    # Apply overrides to preset
    if 'strength' in overrides:
        preset['run']['strength'] = str(overrides['strength'])
    if 'roi' in overrides:
        preset['run']['roi'] = overrides['roi']
    if 'mode' in overrides:
        preset['run']['mode'] = overrides['mode']
    if 'fl' in overrides and 'fh' in overrides:
        preset['temporal']['band'] = f"{overrides['fl']},{overrides['fh']}"
    if 'velocity_mag' in overrides:
        preset['temporal']['velocity_mag'] = 'true' if overrides['velocity_mag'] else 'false'
    if 'filter_type' in overrides:
        preset['temporal']['filter'] = overrides['filter_type']
    if 'n_filter_tap' in overrides:
        preset['temporal']['n_filter_tap'] = str(overrides['n_filter_tap'])
    
    # Build CLI arguments
    args = {
        'config_file': model_config_path,
        'vid_dir': f"data/vids/{video_name}",
        'frame_ext': 'png',
        'out_dir': f"data/output/{video_name}_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3",
    }
    
    # Determine phase (mode)
    mode = preset['run'].get('mode', 'standard')
    if mode == 'temporal':
        args['phase'] = 'run_temporal'
        args['Temporal'] = True
    else:
        args['phase'] = 'run'
        args['Temporal'] = False
    
    # Amplification factor (strength)
    strength = preset['run'].get('strength', '30')
    if strength.lower() == 'auto':
        amplification_factor = 30
    else:
        try:
            strength_int = int(strength)
            # Map 1-100 to 0.5-50 amplification factor
            amplification_factor = strength_int * 0.5
        except ValueError:
            amplification_factor = 30
    args['amplification_factor'] = amplification_factor
    
    # Velocity magnification
    if mode == 'temporal':
        velocity_mag_str = preset['temporal'].get('velocity_mag', 'false')
        args['velocity_mag'] = velocity_mag_str.lower() in ('true', 'on', '1', 'yes')
    else:
        args['velocity_mag'] = False
    
    # Temporal parameters (only if temporal mode)
    if args['phase'] == 'run_temporal':
        # Parse band (fl, fh)
        band = preset['temporal'].get('band', '0.04,0.4')
        if ',' in band:
            fl, fh = map(float, band.split(','))
            args['fl'] = fl
            args['fh'] = fh
        else:
            args['fl'] = 0.04
            args['fh'] = 0.4
        
        # Filter type
        filter_type = preset['temporal'].get('filter', 'differenceOfIIR')
        args['filter_type'] = filter_type
        
        # Filter taps
        n_filter_tap = preset['temporal'].get('n_filter_tap', '2')
        try:
            args['n_filter_tap'] = int(n_filter_tap)
        except ValueError:
            args['n_filter_tap'] = 2
    
    return args


def list_available_presets() -> list:
    """
    List all available preset files.
    
    Returns:
        List of preset names (without .conf extension)
    """
    presets_dir = Path("configs/presets")
    if not presets_dir.exists():
        return []
    
    presets = []
    for preset_file in presets_dir.glob("*.conf"):
        presets.append(preset_file.stem)
    
    return sorted(presets)

