"""
Auto-tuning functions for motion amplification video processing.
Automatically detects FPS, ROI, dominant frequencies, and safe amplification factors.
"""
import os
import subprocess
import numpy as np
import cv2
from pathlib import Path
from typing import Tuple, List, Dict, Optional
import json


def get_video_dimensions(video_path: str) -> Dict[str, int]:
    """
    Get video dimensions (width, height).
    
    Args:
        video_path: Path to video file
        
    Returns:
        Dictionary with keys: width, height
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"width": 0, "height": 0}
        
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        return {"width": width, "height": height}
    except Exception as e:
        print(f"Warning: Could not get video dimensions: {e}")
        return {"width": 0, "height": 0}


def convert_ui_roi_to_video_roi(ui_roi: Dict[str, float], 
                                video_dimensions: Dict[str, int],
                                display_dimensions: Dict[str, float]) -> Dict[str, int]:
    """
    Convert ROI coordinates from UI display space to video pixel space.
    
    Accounts for video aspect ratio and object-contain display mode.
    
    Args:
        ui_roi: ROI in UI coordinates {x, y, w, h}
        video_dimensions: Actual video dimensions {width, height}
        display_dimensions: Display container dimensions {width, height}
        
    Returns:
        ROI in video pixel coordinates {x, y, w, h}
    """
    if not video_dimensions.get("width") or not video_dimensions.get("height"):
        return ui_roi
    
    video_w = video_dimensions["width"]
    video_h = video_dimensions["height"]
    display_w = display_dimensions.get("width", video_w)
    display_h = display_dimensions.get("height", video_h)
    
    # Calculate aspect ratios
    video_aspect = video_w / video_h
    display_aspect = display_w / display_h
    
    # Calculate actual displayed video size (accounting for object-contain)
    if video_aspect > display_aspect:
        # Video is wider - letterboxing on top/bottom
        displayed_video_w = display_w
        displayed_video_h = display_w / video_aspect
        offset_x = 0
        offset_y = (display_h - displayed_video_h) / 2
    else:
        # Video is taller - pillarboxing on left/right
        displayed_video_w = display_h * video_aspect
        displayed_video_h = display_h
        offset_x = (display_w - displayed_video_w) / 2
        offset_y = 0
    
    # Convert UI coordinates to video coordinates
    # Subtract offset and scale by video/displayed ratio
    video_x = int((ui_roi["x"] - offset_x) * (video_w / displayed_video_w))
    video_y = int((ui_roi["y"] - offset_y) * (video_h / displayed_video_h))
    video_w_roi = int(ui_roi["w"] * (video_w / displayed_video_w))
    video_h_roi = int(ui_roi["h"] * (video_h / displayed_video_h))
    
    # Clamp to video bounds
    video_x = max(0, min(video_x, video_w - 1))
    video_y = max(0, min(video_y, video_h - 1))
    video_w_roi = max(1, min(video_w_roi, video_w - video_x))
    video_h_roi = max(1, min(video_h_roi, video_h - video_y))
    
    return {
        "x": video_x,
        "y": video_y,
        "w": video_w_roi,
        "h": video_h_roi
    }


def detect_video_fps(video_path: str) -> float:
    """
    Detect video frame rate using ffprobe.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Frame rate as float (frames per second)
    """
    try:
        # Use ffprobe to get frame rate
        cmd = [
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0',
            video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        frame_rate_str = result.stdout.strip()
        
        # Parse fraction (e.g., "30/1" or "30000/1001")
        if '/' in frame_rate_str:
            num, den = map(int, frame_rate_str.split('/'))
            fps = num / den
        else:
            fps = float(frame_rate_str)
            
        return fps
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError) as e:
        print(f"Warning: Could not detect FPS from video: {e}")
        # Default to 30 fps if detection fails
        return 30.0


def detect_roi(video_path: str, sample_frames: int = 30) -> Dict[str, int]:
    """
    Detect region of interest with highest motion energy.
    
    Args:
        video_path: Path to video file
        sample_frames: Number of frames to sample for analysis
        
    Returns:
        Dictionary with keys: x, y, w, h (bounding box)
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"x": 0, "y": 0, "w": 0, "h": 0}
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Sample frames evenly throughout video
        frame_indices = np.linspace(0, total_frames - 1, sample_frames, dtype=int)
        
        prev_frame = None
        motion_energy = np.zeros((frame_height, frame_width), dtype=np.float32)
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            
            if prev_frame is not None:
                # Compute frame difference
                diff = cv2.absdiff(gray, prev_frame)
                motion_energy += diff.astype(np.float32)
            
            prev_frame = gray
        
        cap.release()
        
        if motion_energy.max() == 0:
            # No motion detected, return full frame
            return {"x": 0, "y": 0, "w": frame_width, "h": frame_height}
        
        # Find region with highest motion energy
        # Use a sliding window approach
        window_size = min(frame_width // 4, frame_height // 4, 200)
        max_energy = 0
        best_roi = {"x": 0, "y": 0, "w": frame_width, "h": frame_height}
        
        for y in range(0, frame_height - window_size, window_size // 2):
            for x in range(0, frame_width - window_size, window_size // 2):
                energy = np.sum(motion_energy[y:y+window_size, x:x+window_size])
                if energy > max_energy:
                    max_energy = energy
                    best_roi = {
                        "x": max(0, x - window_size // 4),
                        "y": max(0, y - window_size // 4),
                        "w": min(window_size * 2, frame_width - max(0, x - window_size // 4)),
                        "h": min(window_size * 2, frame_height - max(0, y - window_size // 4))
                    }
        
        return best_roi
        
    except Exception as e:
        print(f"Warning: Could not detect ROI: {e}")
        # Return full frame as fallback
        try:
            cap = cv2.VideoCapture(video_path)
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            cap.release()
            return {"x": 0, "y": 0, "w": w, "h": h}
        except:
            return {"x": 0, "y": 0, "w": 0, "h": 0}


def detect_dominant_frequencies(video_path: str, roi: Optional[Dict[str, int]] = None, 
                                fs: float = 30.0, sample_frames: int = 300) -> List[Dict[str, float]]:
    """
    Detect dominant frequencies in video using FFT analysis.
    
    Args:
        video_path: Path to video file
        roi: Optional ROI dictionary (x, y, w, h). If None, uses full frame.
        fs: Sampling rate (frame rate) in Hz
        sample_frames: Maximum number of frames to analyze
        
    Returns:
        List of frequency peaks: [{"freq": 1.2, "amplitude": 0.8}, ...]
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frames_to_analyze = min(sample_frames, total_frames)
        
        # Extract pixel time series from ROI
        if roi and roi.get("w", 0) > 0 and roi.get("h", 0) > 0:
            x, y, w, h = roi["x"], roi["y"], roi["w"], roi["h"]
        else:
            x, y = 0, 0
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Sample center region of ROI for efficiency
        center_x = x + w // 2
        center_y = y + h // 2
        sample_size = min(50, w, h)  # Sample 50x50 region
        sample_x = max(0, center_x - sample_size // 2)
        sample_y = max(0, center_y - sample_size // 2)
        sample_w = min(sample_size, w)
        sample_h = min(sample_size, h)
        
        pixel_values = []
        
        for i in range(frames_to_analyze):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(i * total_frames / frames_to_analyze))
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Convert to grayscale and extract ROI
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            roi_patch = gray[sample_y:sample_y+sample_h, sample_x:sample_x+sample_w]
            
            # Use mean intensity as signal
            pixel_values.append(np.mean(roi_patch))
        
        cap.release()
        
        if len(pixel_values) < 10:
            return []
        
        # Apply FFT
        signal = np.array(pixel_values)
        signal = signal - np.mean(signal)  # Remove DC component
        
        # Apply windowing to reduce spectral leakage
        window = np.hanning(len(signal))
        signal_windowed = signal * window
        
        # Compute FFT
        fft = np.fft.rfft(signal_windowed)
        fft_magnitude = np.abs(fft)
        frequencies = np.fft.rfftfreq(len(signal), 1.0 / fs)
        
        # Find peaks (top 3)
        # Simple peak detection: find local maxima above threshold
        threshold = np.max(fft_magnitude) * 0.1  # 10% of max
        peaks = []
        
        for i in range(1, len(fft_magnitude) - 1):
            if (fft_magnitude[i] > fft_magnitude[i-1] and 
                fft_magnitude[i] > fft_magnitude[i+1] and
                fft_magnitude[i] > threshold and
                frequencies[i] > 0.01):  # Ignore very low frequencies
                peaks.append({
                    "freq": float(frequencies[i]),
                    "amplitude": float(fft_magnitude[i])
                })
        
        # Sort by amplitude and return top 3
        peaks.sort(key=lambda x: x["amplitude"], reverse=True)
        return peaks[:3]
        
    except Exception as e:
        print(f"Warning: Could not detect frequencies: {e}")
        return []


def compute_artifact_metrics(processed_frames: List[np.ndarray]) -> Dict[str, float]:
    """
    Compute artifact metrics for processed frames.
    
    Args:
        processed_frames: List of processed frame arrays (normalized -1 to 1)
        
    Returns:
        Dictionary with artifact metrics
    """
    if not processed_frames or len(processed_frames) < 2:
        return {"saturation": 1.0, "flicker": 1.0, "edge_tearing": 1.0}
    
    frames = np.array(processed_frames)
    
    # Convert from -1 to 1 range to 0-255 for analysis
    frames_uint8 = ((frames + 1.0) * 127.5).astype(np.uint8)
    
    # 1. Saturation metric: % of pixels at extremes (0 or 255)
    saturation_mask = (frames_uint8 == 0) | (frames_uint8 == 255)
    saturation_ratio = np.mean(saturation_mask)
    
    # 2. Temporal flicker: variance across time dimension
    if len(frames) > 1:
        frame_mean = np.mean(frames_uint8, axis=0)
        temporal_variance = np.var(frames_uint8, axis=0)
        flicker_energy = np.mean(temporal_variance) / 255.0  # Normalize
    else:
        flicker_energy = 0.0
    
    # 3. Edge tearing: high-frequency spatial artifacts
    # Compute Laplacian to detect edges, then check for excessive high-frequency content
    edge_scores = []
    for frame in frames_uint8[:min(5, len(frames_uint8))]:  # Sample first 5 frames
        if len(frame.shape) == 2:
            laplacian = cv2.Laplacian(frame, cv2.CV_64F)
        else:
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) if len(frame.shape) == 3 else frame
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        # High variance in Laplacian indicates edge tearing
        edge_variance = np.var(np.abs(laplacian))
        edge_scores.append(edge_variance)
    
    edge_tearing = np.mean(edge_scores) / 10000.0  # Normalize (rough scaling)
    edge_tearing = min(1.0, edge_tearing)  # Cap at 1.0
    
    return {
        "saturation": float(saturation_ratio),
        "flicker": float(flicker_energy),
        "edge_tearing": float(edge_tearing)
    }


def find_safe_amplification(video_path: str, roi: Optional[Dict[str, int]] = None,
                           preview_seconds: int = 3, fs: float = 30.0,
                           model_checkpoint: str = None) -> int:
    """
    Find safe amplification factor by processing preview and detecting artifacts.
    
    Args:
        video_path: Path to video file
        roi: Optional ROI dictionary
        preview_seconds: Number of seconds to preview
        fs: Frame rate
        model_checkpoint: Path to model checkpoint (optional, for full processing)
        
    Returns:
        Safe amplification factor (integer)
    """
    try:
        # Extract preview segment
        preview_frames_dir = Path("data/temp_preview_amp")
        preview_frames_dir.mkdir(parents=True, exist_ok=True)
        
        # Extract first N seconds
        preview_video = preview_frames_dir / "preview.mp4"
        ffmpeg_cmd = f'ffmpeg -i "{video_path}" -t {preview_seconds} -c copy "{preview_video}" -y'
        result = subprocess.run(ffmpeg_cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Warning: Could not extract preview: {result.stderr}")
            return 30  # Default fallback
        
        # Convert to frames
        ffmpeg_cmd = f'ffmpeg -i "{preview_video}" "{preview_frames_dir}/%06d.png"'
        result = subprocess.run(ffmpeg_cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Warning: Could not convert preview to frames: {result.stderr}")
            return 30
        
        # Get frame files
        import glob
        frame_files = sorted(glob.glob(str(preview_frames_dir / "*.png")))
        if len(frame_files) < 2:
            return 30
        
        # For now, use a simplified approach without full neural network processing
        # Analyze frame differences at different "virtual" amplification levels
        # This is a proxy for actual amplification artifacts
        
        test_factors = [10, 20, 30, 40, 50]
        safe_factor = 30  # Default
        
        # Load frames
        frames = []
        for frame_file in frame_files[:min(10, len(frame_files))]:  # Sample first 10 frames
            frame = cv2.imread(frame_file)
            if frame is not None:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(frame)
        
        if len(frames) < 2:
            return 30
        
        # Test each amplification factor
        for factor in test_factors:
            # Simulate amplification by enhancing frame differences
            amplified_frames = []
            prev_frame = None
            
            for frame in frames:
                if prev_frame is not None:
                    # Compute difference and amplify
                    diff = (frame.astype(np.float32) - prev_frame.astype(np.float32)) * (factor / 30.0)
                    amplified = np.clip(prev_frame.astype(np.float32) + diff, 0, 255).astype(np.uint8)
                    amplified_frames.append(amplified)
                prev_frame = frame
            
            if len(amplified_frames) < 2:
                continue
            
            # Normalize to -1 to 1 range for metric computation
            normalized = [(f.astype(np.float32) / 127.5) - 1.0 for f in amplified_frames]
            
            # Compute artifact metrics
            metrics = compute_artifact_metrics(normalized)
            
            # Thresholds for "safe"
            saturation_threshold = 0.15  # 15% pixels saturating
            flicker_threshold = 0.3
            edge_threshold = 0.5
            
            # Check if this factor is safe
            if (metrics["saturation"] < saturation_threshold and 
                metrics["flicker"] < flicker_threshold and
                metrics["edge_tearing"] < edge_threshold):
                safe_factor = factor
            else:
                # Factor is too high, stop here
                break
        
        # Cleanup
        try:
            import shutil
            shutil.rmtree(preview_frames_dir, ignore_errors=True)
        except:
            pass
        
        return safe_factor
        
    except Exception as e:
        print(f"Warning: Safe amplification detection failed: {e}")
        # Conservative default
        return 30


def auto_choose_mode(frequencies: List[Dict[str, float]], 
                     threshold_amplitude: float = 0.3) -> str:
    """
    Automatically choose between standard and temporal mode based on frequency spectrum.
    
    Args:
        frequencies: List of frequency peaks from detect_dominant_frequencies
        threshold_amplitude: Minimum normalized amplitude to consider a "clear peak"
        
    Returns:
        "temporal" if clear peak exists, "standard" otherwise
    """
    if not frequencies:
        return "standard"
    
    # Normalize amplitudes
    if frequencies:
        max_amplitude = max(f["amplitude"] for f in frequencies)
        if max_amplitude > 0:
            normalized_peaks = [f["amplitude"] / max_amplitude for f in frequencies]
            # If any peak is above threshold, use temporal mode
            if any(amp > threshold_amplitude for amp in normalized_peaks):
                return "temporal"
    
    return "standard"


def crop_frames_with_roi(frames_dir: str, roi: Dict[str, int]) -> bool:
    """
    Crop all frames in a directory based on ROI coordinates.
    
    Args:
        frames_dir: Directory containing frame images
        roi: ROI dictionary with x, y, w, h in video pixel coordinates
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not roi or roi.get("w", 0) <= 0 or roi.get("h", 0) <= 0:
            return True  # No cropping needed
        
        import glob
        
        # Try PIL first, fallback to OpenCV
        try:
            from PIL import Image
            use_pil = True
        except ImportError:
            use_pil = False
            print("PIL not available, using OpenCV for cropping")
        
        x = roi["x"]
        y = roi["y"]
        w = roi["w"]
        h = roi["h"]
        
        # Get all frame files
        frame_files = sorted(glob.glob(os.path.join(frames_dir, "*.png")))
        if not frame_files:
            frame_files = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")))
        
        if not frame_files:
            print(f"Warning: No frames found in {frames_dir}")
            return False
        
        print(f"Cropping {len(frame_files)} frames with ROI: x={x}, y={y}, w={w}, h={h}")
        
        for frame_file in frame_files:
            try:
                if use_pil:
                    # Use PIL for cropping
                    img = Image.open(frame_file)
                    img_width, img_height = img.size
                    
                    # Ensure ROI is within image bounds
                    crop_x = max(0, min(x, img_width - 1))
                    crop_y = max(0, min(y, img_height - 1))
                    crop_w = min(w, img_width - crop_x)
                    crop_h = min(h, img_height - crop_y)
                    
                    if crop_w > 0 and crop_h > 0:
                        # Crop image
                        cropped = img.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
                        # Save back to same file
                        cropped.save(frame_file)
                else:
                    # Use OpenCV for cropping
                    img = cv2.imread(frame_file)
                    if img is None:
                        continue
                    
                    img_height, img_width = img.shape[:2]
                    
                    # Ensure ROI is within image bounds
                    crop_x = max(0, min(x, img_width - 1))
                    crop_y = max(0, min(y, img_height - 1))
                    crop_w = min(w, img_width - crop_x)
                    crop_h = min(h, img_height - crop_y)
                    
                    if crop_w > 0 and crop_h > 0:
                        # Crop image
                        cropped = img[crop_y:crop_y+crop_h, crop_x:crop_x+crop_w]
                        # Save back to same file
                        cv2.imwrite(frame_file, cropped)
            except Exception as e:
                print(f"Warning: Failed to crop frame {frame_file}: {e}")
                continue
        
        print(f"Successfully cropped {len(frame_files)} frames")
        return True
        
    except Exception as e:
        print(f"Warning: Frame cropping failed: {e}")
        return False


def generate_motion_energy_heatmap(video_path: str, sample_frames: int = 30) -> Optional[str]:
    """
    Generate a motion energy heatmap image showing where motion is detected.
    
    Args:
        video_path: Path to video file
        sample_frames: Number of frames to sample for analysis
        
    Returns:
        Path to generated heatmap image, or None if failed
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Sample frames evenly throughout video
        frame_indices = np.linspace(0, total_frames - 1, sample_frames, dtype=int)
        
        prev_frame = None
        motion_energy = np.zeros((frame_height, frame_width), dtype=np.float32)
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            
            if prev_frame is not None:
                # Compute frame difference
                diff = cv2.absdiff(gray, prev_frame)
                motion_energy += diff.astype(np.float32)
            
            prev_frame = gray
        
        cap.release()
        
        if motion_energy.max() == 0:
            return None
        
        # Normalize motion energy to 0-255
        motion_normalized = (motion_energy / motion_energy.max() * 255).astype(np.uint8)
        
        # Apply colormap for visualization (hot colormap: black->red->yellow->white)
        heatmap = cv2.applyColorMap(motion_normalized, cv2.COLORMAP_HOT)
        
        # Blend with original video frame for context (optional - for now just return heatmap)
        # Save heatmap
        heatmap_dir = Path("data/heatmaps")
        heatmap_dir.mkdir(parents=True, exist_ok=True)
        
        video_name = Path(video_path).stem
        heatmap_path = heatmap_dir / f"{video_name}_motion_heatmap.png"
        
        cv2.imwrite(str(heatmap_path), heatmap)
        
        return str(heatmap_path)
        
    except Exception as e:
        print(f"Warning: Could not generate motion heatmap: {e}")
        return None


def stabilize_video(video_path: str, output_path: str) -> bool:
    """
    Apply video stabilization using FFmpeg.
    
    Args:
        video_path: Input video path
        output_path: Output video path
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Use FFmpeg's vidstab filter for stabilization
        cmd = [
            'ffmpeg', '-i', video_path,
            '-vf', 'vidstabdetect=shakiness=5:accuracy=15:result=transforms.trf',
            '-f', 'null', '-'
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        
        cmd = [
            'ffmpeg', '-i', video_path,
            '-vf', 'vidstabtransform=input=transforms.trf:smoothing=10:zoom=0:optzoom=0',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
            output_path, '-y'
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except Exception as e:
        print(f"Warning: Video stabilization failed: {e}")
        return False

