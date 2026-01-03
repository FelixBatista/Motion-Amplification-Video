# How Videos Are Stored

## MongoDB Storage

**Videos are NOT stored as files in MongoDB.** Instead:

1. **Video URLs are stored** in the user's document in the `users` collection
2. The `videos` field is an **array of URLs/links**
3. Each URL points to a video file stored in **AWS S3** (cloud storage)

## Storage Flow

1. **Upload Page**: User uploads video → Video is uploaded to **AWS S3**
2. **S3 Storage**: Video file is stored in S3 bucket `skillissuevid`
3. **MongoDB**: The S3 URL (like `https://d175wanlbunlv0.cloudfront.net/video_1.mp4`) is saved to the user's `videos` array in MongoDB
4. **Processing**: When user processes a video, the Python API:
   - Downloads video from S3
   - Processes it with TensorFlow
   - Uploads processed video back to S3
   - Returns the new S3 URL

## What You See in MongoDB Atlas

In MongoDB Atlas, you'll see:
- **Database**: `motion-amplification`
- **Collection**: `users`
- **Documents**: User documents with a `videos` field containing an array of URLs

Example user document:
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "videos": [
    "https://d175wanlbunlv0.cloudfront.net/video_1.mp4",
    "https://d175wanlbunlv0.cloudfront.net/video_2.mp4"
  ]
}
```

## Why This Architecture?

- MongoDB is not designed for storing large files (like videos)
- S3 is optimized for file storage
- URLs are much smaller and faster to query
- Videos can be served directly from S3/CDN

## Important Notes

- Videos are stored in **AWS S3**, not MongoDB
- MongoDB only stores the **URLs/links** to videos
- You need AWS credentials configured for video upload/download to work

