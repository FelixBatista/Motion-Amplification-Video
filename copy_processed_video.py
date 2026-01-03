"""Copy processed video to uploads folder so it can be displayed"""
import shutil
from pathlib import Path

# Find the processed video in output folder
output_dir = Path("data/output")
processed_video = None

# Look for the most recent mp4 file
for folder in output_dir.iterdir():
    if folder.is_dir():
        for mp4_file in folder.glob("*.mp4"):
            if processed_video is None or mp4_file.stat().st_mtime > processed_video.stat().st_mtime:
                processed_video = mp4_file

if not processed_video:
    print("ERROR: No processed video found in data/output")
    exit(1)

print(f"Found processed video: {processed_video}")

# Extract the original video name (before processing)
# The folder name contains the original video name
folder_name = processed_video.parent.name
# Remove the suffix that was added during processing
original_name = folder_name.split("_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3")[0]
if "_fl" in original_name:
    original_name = original_name.split("_fl")[0]

# Create destination filename
dest_file = Path("data/uploads") / f"{original_name}_processed.mp4"
dest_file.parent.mkdir(parents=True, exist_ok=True)

print(f"Copying to: {dest_file}")

# Copy the file
shutil.copy2(processed_video, dest_file)

print(f"SUCCESS! Video copied to: {dest_file}")
print(f"You can now view it at: http://localhost:8000/api/video/{dest_file.name}")

