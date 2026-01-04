# Motion Amplification Video API Documentation

## Overview

The Motion Amplification Video (MAV) API provides endpoints for video upload, analysis, processing, and preset management. The API supports both a legacy parameter-based format and a new preset-based format for simplified usage.

## Base URL

```
http://localhost:8000
```

## Endpoints

### Health Check

**GET** `/api/health`

Check API status.

**Response:**
```json
{
  "status": "ok",
  "message": "Motion Amplification Video API"
}
```

---

### List Presets

**GET** `/api/presets`

Get list of available presets.

**Response:**
```json
{
  "presets": [
    {
      "name": "general_auto",
      "description": "General motion amplification - automatically detects best settings"
    },
    {
      "name": "vibration_auto",
      "description": "Vibration analysis for machinery and automotive (NVH)"
    },
    ...
  ]
}
```

---

### Upload Video

**POST** `/api/upload`

Upload a video file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (video file)

**Supported formats:** `.mp4`, `.avi`, `.mov`, `.mkv`, `.flv`, `.wmv`, `.webm`

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "filename": "example.mp4",
  "path": "/api/video/example.mp4",
  "size": 12345678
}
```

---

### Analyze Video

**POST** `/api/analyze-video`

Analyze a video and return auto-tuning results (FPS, ROI, frequencies, suggested amplification).

**Request:**
```json
{
  "videoPath": "/api/video/example.mp4"
}
```

**Response:**
```json
{
  "fps": 30.0,
  "videoDimensions": {
    "width": 1920,
    "height": 1080
  },
  "roi": {
    "x": 100,
    "y": 100,
    "w": 800,
    "h": 600
  },
  "frequencies": [
    {
      "freq": 1.2,
      "amplitude": 0.85
    },
    {
      "freq": 2.5,
      "amplitude": 0.62
    }
  ],
  "suggested_mode": "temporal",
  "suggested_amplification": 25,
  "motionHeatmapUrl": "/api/heatmap/example_heatmap.png"
}
```

**Error Responses:**
- `404`: Video not found
- `500`: Analysis error (with detailed message)

---

### Generate Preview

**POST** `/api/preview`

Generate a 2-3 second preview of processed video with current settings.

**Request:**
```json
{
  "videoPath": "/api/video/example.mp4",
  "preset": "general_auto",
  "overrides": {
    "strength": 30,
    "roi": "100,100,800,600",
    "fl": 0.04,
    "fh": 0.4
  }
}
```

**Response:**
```json
{
  "previewUrl": "/api/preview/example_preview.mp4",
  "message": "Preview generated successfully"
}
```

---

### Process Video

**POST** `/api/process`

Process a video with motion amplification. Supports both legacy and preset-based formats.

#### Preset-Based Format (Recommended)

**Request:**
```json
{
  "videoPath": "/api/video/example.mp4",
  "preset": "general_auto",
  "overrides": {
    "strength": 30,
    "roi": "100,100,800,600",
    "trimStart": 0.0,
    "trimEnd": 10.0,
    "fl": 0.04,
    "fh": 0.4
  }
}
```

**Parameters:**
- `videoPath` (string, required): Path to video file
- `preset` (string, optional): Preset name (default: "general_auto")
- `overrides` (object, optional): Parameter overrides
  - `strength` (integer, 1-100): Amplification strength
  - `roi` (string): Region of interest as "x,y,w,h"
  - `trimStart` (float): Start time in seconds for trimming
  - `trimEnd` (float): End time in seconds for trimming
  - `fl` (float): Low frequency cutoff (for temporal mode)
  - `fh` (float): High frequency cutoff (for temporal mode)

#### Legacy Format

**Request:**
```json
{
  "videoPath": "/api/video/example.mp4",
  "inputParameters": {
    "phase": "run",
    "config_file": "o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3.conf",
    "amplification_factor": 30,
    "Temporal": false,
    "fl": 0.04,
    "fh": 0.4,
    "fs": 30,
    "n_filter_tap": 2,
    "filter_type": "differenceOfIIR",
    "velocity_mag": false
  }
}
```

**Response:**
```json
{
  "message": "Video processed successfully",
  "outputPath": "/api/video/example_processed.mp4",
  "processingTime": 123.45
}
```

**Error Responses:**
- `404`: Video not found
- `500`: Processing error (with detailed message)

---

### Get Preview Video

**GET** `/api/preview/{filename}`

Retrieve a generated preview video.

**Response:** Video file (MP4)

---

### Get Heatmap

**GET** `/api/heatmap/{filename}`

Retrieve a motion energy heatmap image.

**Response:** Image file (PNG)

---

### Convert ROI Coordinates

**POST** `/api/convert-roi`

Convert ROI coordinates from UI display space to video pixel space.

**Request:**
```json
{
  "videoPath": "/api/video/example.mp4",
  "uiROI": {
    "x": 100,
    "y": 100,
    "w": 400,
    "h": 300
  },
  "displayDimensions": {
    "width": 800,
    "height": 600
  }
}
```

**Response:**
```json
{
  "videoROI": {
    "x": 200,
    "y": 150,
    "w": 800,
    "h": 600
  },
  "videoDimensions": {
    "width": 1920,
    "height": 1080
  }
}
```

---

### Save Custom Preset

**POST** `/api/presets/save`

Save a custom preset configuration.

**Request:**
```json
{
  "name": "my_custom_preset",
  "preset": {
    "run": {
      "mode": "auto",
      "roi": "auto",
      "strength": "auto",
      "stabilization": "auto",
      "output": "auto"
    },
    "temporal": {
      "enabled": "auto",
      "band": "auto",
      "filter": "differenceOfIIR"
    }
  }
}
```

**Response:**
```json
{
  "message": "Preset saved successfully",
  "name": "my_custom_preset",
  "path": "configs/presets/my_custom_preset.conf"
}
```

**Error Responses:**
- `400`: Invalid preset name
- `500`: Failed to save preset

---

## Presets

### Available Presets

1. **general_auto**: General motion amplification with automatic settings
2. **vibration_auto**: Vibration analysis for machinery and automotive (NVH)
3. **heartbeat_auto**: Heartbeat and breathing visualization
4. **structural_auto**: Structural motion analysis (buildings, bridges)
5. **handheld_auto**: Handheld/shaky camera with stabilization

### Preset Configuration

Presets use the following structure:

```ini
[run]
mode = auto | standard | temporal
roi = auto | x,y,w,h
strength = auto | 1-100
stabilization = auto | on | off
output = auto

[temporal]
enabled = auto | on | off
band = auto | fl,fh
velocity_mag = auto | true | false
filter = fir | butter | differenceOfIIR
n_filter_tap = 2
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid parameters)
- `404`: Resource not found
- `500`: Internal server error

Error responses include a `detail` field with a descriptive message:

```json
{
  "detail": "Video file not found. Please ensure the video was uploaded correctly."
}
```

## Auto-Tuning Features

The API includes automatic detection of:

1. **FPS**: Detected from video metadata
2. **ROI**: Region with highest motion energy
3. **Dominant Frequencies**: Top 3 frequency peaks via FFT analysis
4. **Safe Amplification**: Maximum amplification without artifacts
5. **Processing Mode**: Standard vs Temporal based on frequency content

## Notes

- Video processing can take significant time depending on video length and resolution
- Large videos may require substantial memory and processing power
- GPU acceleration is recommended for faster processing (if available)
- Preview generation uses a 2-3 second segment for quick feedback
- Trim parameters allow processing only a portion of the video

