"""
Build script for creating Windows executable
"""
import PyInstaller.__main__
import os
import shutil

# Clean previous builds
for dir_name in ['build', 'dist', '__pycache__']:
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)

# Check if frontend is built
if not os.path.exists('frontend/build'):
    print("ERROR: Frontend not built!")
    print("Please run: cd frontend && npm run build && cd ..")
    exit(1)

PyInstaller.__main__.run([
    'app.py',
    '--name=MotionAmplification',
    '--onefile',
    '--windowed',  # No console window (use --console if you want to see output)
    '--add-data=frontend/build;frontend/build',
    '--hidden-import=uvicorn.lifespan.on',
    '--hidden-import=uvicorn.lifespan.off',
    '--hidden-import=uvicorn.protocols.websockets.auto',
    '--hidden-import=uvicorn.protocols.http.auto',
    '--hidden-import=uvicorn.protocols.websockets.auto',
    '--collect-all=uvicorn',
    '--collect-all=fastapi',
])

print("\n" + "="*60)
print("Build complete! Executable is in the 'dist' folder")
print("="*60)

