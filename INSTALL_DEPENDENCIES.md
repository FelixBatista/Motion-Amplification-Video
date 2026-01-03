# Installing Dependencies for Video Processing

The video processing requires TensorFlow and related packages. Here's how to install them:

## Quick Install

```powershell
pip install tensorflow configobj setproctitle
```

## Note about the `validate` package

The `main.py` script imports `Validator` from `validate`, but this can also be imported from `configobj.validate` which is included with `configobj`. The code has been updated to use `configobj.validate` as a fallback if `validate` is not available.

## Full Installation (if needed)

If you need all dependencies from the original requirements.txt:

**Note:** TensorFlow and many ML libraries may have compatibility issues with Python 3.14. Python 3.10 or 3.11 is recommended for TensorFlow.

For Python 3.10/3.11:
```powershell
pip install tensorflow==2.13.0 configobj setproctitle
```

For Python 3.14 (may have compatibility issues):
```powershell
pip install tensorflow configobj setproctitle
```

## Verify Installation

```powershell
python -c "import tensorflow; print('TensorFlow version:', tensorflow.__version__)"
python -c "from configobj import ConfigObj; print('configobj works')"
python -c "from configobj.validate import Validator; print('Validator works')"
```

## Troubleshooting

If TensorFlow installation fails:
- Try Python 3.10 or 3.11 instead of 3.14
- Install CPU-only version: `pip install tensorflow-cpu`
- Check TensorFlow compatibility: https://www.tensorflow.org/install

