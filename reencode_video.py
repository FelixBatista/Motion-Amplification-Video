"""Re-encode video for Windows compatibility"""
import subprocess
import sys
from pathlib import Path

if len(sys.argv) < 2:
    print("Usage: python reencode_video.py <input_video> [output_video]")
    sys.exit(1)

input_file = Path(sys.argv[1])
if not input_file.exists():
    print(f"Error: Input file not found: {input_file}")
    sys.exit(1)

if len(sys.argv) >= 3:
    output_file = Path(sys.argv[2])
else:
    output_file = input_file.parent / f"{input_file.stem}_reencoded{input_file.suffix}"

output_file.parent.mkdir(parents=True, exist_ok=True)

# Re-encode with Windows-compatible settings
cmd = [
    'ffmpeg', '-y',
    '-i', str(input_file),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    str(output_file)
]

print(f"Re-encoding: {input_file}")
print(f"Output: {output_file}")
print(f"Command: {' '.join(cmd)}")

result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
    sys.exit(1)
else:
    print(f"Success! Re-encoded video saved to: {output_file}")

