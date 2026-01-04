# Migration Guide: From Parameter-Based to Preset-Based System

This guide helps existing users transition from the old parameter-heavy interface to the new simplified preset-based system.

## Overview of Changes

The Motion Amplification Video (MAV) software has been redesigned to simplify the user experience:

- **Before**: Users needed to configure many technical parameters (FPS, filter types, frequency bands, etc.)
- **After**: Users select a preset and optionally adjust a few high-level settings

## Key Changes

### 1. Configuration Structure

**Old System:**
- Single config file (`o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3.conf`) containing both model and runtime parameters
- Users directly edited config values

**New System:**
- **Model Config**: `configs/models/magnet_default.conf` (internal, not user-facing)
- **Preset Configs**: `configs/presets/*.conf` (user-facing runtime settings)
- Separation of concerns: model architecture vs. processing parameters

### 2. User Interface

**Old System:**
- Multiple input panels with many technical fields
- Direct parameter manipulation
- Required knowledge of signal processing concepts

**New System:**
- 4-step wizard interface
- Preset selection with auto-tuning
- Most parameters handled automatically

### 3. Parameter Mapping

#### Old Parameters → New Presets

| Old Parameter | New Location | Notes |
|--------------|--------------|-------|
| `amplification_factor` | Preset `strength` or override | Now 1-100 scale, with "auto" option |
| `fs` (sampling rate) | Auto-detected | No longer user input |
| `fl`, `fh` (frequency band) | Preset `band` or override | Auto-detected from video |
| `phase` (run/run_temporal) | Preset `mode` | Auto-selected based on frequencies |
| `filter_type` | Preset default | Hidden in UI, defaults to `differenceOfIIR` |
| `n_filter_tap` | Preset default | Hidden in UI |
| `velocity_mag` | Advanced settings | Only shown in advanced mode |
| ROI coordinates | Auto-detected or manual selection | Visual ROI selector |

### 4. API Changes

#### Legacy Format (Still Supported)

The old API format continues to work for backward compatibility:

```json
{
  "videoPath": "/api/video/example.mp4",
  "inputParameters": {
    "phase": "run",
    "amplification_factor": 30,
    "Temporal": false,
    ...
  }
}
```

#### New Preset Format (Recommended)

```json
{
  "videoPath": "/api/video/example.mp4",
  "preset": "general_auto",
  "overrides": {
    "strength": 30
  }
}
```

## Migration Steps

### For End Users

1. **Update to Latest Version**
   - Download the latest release
   - Old config files are automatically migrated

2. **Learn the New Interface**
   - Start with the "General Motion" preset
   - Let auto-tuning handle most parameters
   - Use the preview feature to test settings

3. **Preset Selection Guide**
   - **General Motion**: Default for most use cases
   - **Vibration / NVH**: Machinery, automotive analysis
   - **Heartbeat / Breathing**: Medical, physiological
   - **Structural Motion**: Buildings, bridges, sway
   - **Handheld / Shaky**: Camera stabilization needed
   - **Advanced**: Manual control (for power users)

4. **Adjusting Settings**
   - Use the "Strength" slider for amplification
   - Enable "Show motion energy heatmap" to see detected motion
   - Use ROI selector if auto-detection doesn't work well
   - Expand "Advanced" for manual frequency bands

### For Developers/Integrators

1. **Update API Calls**
   - Migrate to preset-based format
   - Use `/api/analyze-video` for auto-tuning
   - Leverage auto-detected parameters

2. **Config File Migration**
   - Old config moved to `configs/models/`
   - Create custom presets in `configs/presets/`
   - Preset format documented in API docs

3. **Backward Compatibility**
   - Legacy API format still supported
   - Old config files can be converted to presets
   - No breaking changes for existing integrations

## Common Scenarios

### Scenario 1: General Motion Amplification

**Old Way:**
```
- Set phase = "run"
- Set amplification_factor = 30
- Set fs = 30 (manually)
- No temporal filtering
```

**New Way:**
```
- Select "General Motion" preset
- Strength: Auto (or adjust slider)
- Everything else: Auto
```

### Scenario 2: Vibration Analysis

**Old Way:**
```
- Set phase = "run_temporal"
- Set fl = 0.04, fh = 0.4
- Set fs = 30
- Set filter_type = "differenceOfIIR"
- Set velocity_mag = true
```

**New Way:**
```
- Select "Vibration / NVH" preset
- Auto-detects frequency band
- Auto-enables velocity magnification if needed
```

### Scenario 3: Custom Frequency Band

**Old Way:**
```
- Set phase = "run_temporal"
- Manually set fl and fh
- Configure all other parameters
```

**New Way:**
```
- Select preset (e.g., "General Motion")
- Expand "Advanced" settings
- Enable "Manual frequency band"
- Set Low/High cutoff
```

## Troubleshooting

### Issue: "Auto-detection not working"

**Solution:**
- Check video quality and length (needs at least 3 seconds)
- Try manual ROI selection
- Use "Advanced" mode for manual parameters

### Issue: "Results different from old system"

**Solution:**
- Auto-tuning may suggest different parameters
- Use preview to compare results
- Adjust strength slider or use manual overrides
- Check if stabilization is affecting results

### Issue: "Need exact old parameters"

**Solution:**
- Use "Advanced" preset
- Manually set all parameters
- Save as custom preset for reuse

## Benefits of New System

1. **Faster Workflow**: Less time configuring, more time processing
2. **Better Results**: Auto-tuning optimizes parameters automatically
3. **Fewer Errors**: Auto-detection prevents common mistakes
4. **Easier Learning**: Presets teach best practices
5. **Flexibility**: Advanced mode still available for power users

## Support

If you encounter issues during migration:

1. Check the [API Documentation](API_DOCUMENTATION.md)
2. Review preset configurations in `configs/presets/`
3. Use the preview feature to test settings before full processing
4. Report issues with details about your use case

## Future Updates

The legacy format will continue to be supported, but new features will focus on the preset system. Consider migrating to presets for:

- Better auto-tuning results
- Access to new features
- Simplified maintenance
- Improved performance

