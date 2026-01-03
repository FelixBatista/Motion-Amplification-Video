# AWS S3 Setup for Video Storage

## Current Issue

The Python API (`api.py`) has **empty AWS credentials**, which means it cannot:
- Download videos from S3 for processing
- Upload processed videos back to S3

This causes videos to hang during processing.

## Required AWS Credentials

You need to configure AWS credentials for the Python API to access S3.

### Option 1: Environment Variables (Recommended)

1. Set environment variables before running the API:
   ```bash
   # Windows PowerShell
   $env:AWS_ACCESS_KEY_ID="your-access-key"
   $env:AWS_SECRET_ACCESS_KEY="your-secret-key"
   python api.py
   ```

2. Or create a `.env` file (but make sure it's in `.gitignore`)

### Option 2: Update api.py (Less Secure)

Update the credentials in `api.py`:

```python
# In upload_file_to_s3 and download_video_from_s3 functions
s3 = boto3.client('s3',
    aws_access_key_id='YOUR_ACCESS_KEY_HERE',
    aws_secret_access_key='YOUR_SECRET_KEY_HERE'
)
```

⚠️ **Warning**: Don't commit credentials to GitHub!

### Option 3: AWS Credentials File (Best for Local Development)

1. Install AWS CLI: https://aws.amazon.com/cli/
2. Run: `aws configure`
3. Enter your credentials
4. boto3 will automatically use these credentials

## Getting AWS Credentials

If you don't have AWS credentials:

1. **Create an AWS Account** (free tier available)
2. **Go to IAM** (Identity and Access Management)
3. **Create a User** with S3 access permissions
4. **Create Access Keys** for the user
5. **Save the Access Key ID and Secret Access Key**

## Required S3 Permissions

The AWS user needs:
- `s3:GetObject` (to download videos)
- `s3:PutObject` (to upload videos)
- Access to bucket: `skillissuevid`

## Testing

After configuring credentials, test the API:
```bash
python api.py
```

Then check the Python API terminal for error messages when processing videos.

