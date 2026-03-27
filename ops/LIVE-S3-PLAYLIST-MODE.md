# S3 Playlist Mode - Setup Guide

## Overview

Stream videos from an S3 bucket folder in a continuous loop. Perfect for VOD (Video on Demand) content that should play 24/7.

## Architecture

```
S3 Bucket (greentv-s3)
  └── LiveTV/
      ├── Sustainability in sanatana Dharma PART 2.mp4
      ├── video1.mp4
      ├── video2.mp4
      └── ...

Backend API lists videos from folder → Frontend plays sequentially → Loops back to start
```

## Features

✅ Automatic video discovery from S3 folder
✅ Alphabetical playback order
✅ Seamless looping (returns to first video after last)
✅ No manual playlist configuration
✅ Supports all common video formats (.mp4, .mov, .avi, .mkv, .webm, .m4v)
✅ Authenticated access (login required)

## Setup Instructions

### 1. Configure S3 Bucket

**Bucket Details:**
- Name: `greentv-s3`
- Region: `ap-south-1`
- Folder: `LiveTV/`

**Required S3 Permissions:**
Your AWS credentials need:
- `s3:ListBucket` on `arn:aws:s3:::greentv-s3`
- `s3:GetObject` on `arn:aws:s3:::greentv-s3/LiveTV/*`

**IAM Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::greentv-s3"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::greentv-s3/LiveTV/*"
    }
  ]
}
```

### 2. Configure S3 CORS

To allow browser access to videos, configure CORS on your S3 bucket:

```json
[
  {
    "AllowedHeaders": [
      "Range",
      "Content-Type",
      "Authorization"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "https://www.thegreentv.com",
      "http://13.205.72.30",
      "https://13.205.72.30",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Type",
      "Content-Range",
      "Accept-Ranges",
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**How to set CORS:**
1. Go to AWS S3 Console
2. Select bucket `greentv-s3`
3. Go to "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit" and paste the above JSON
6. Save changes

**Important:** The `Range` header allows browsers to request specific byte ranges for video seeking. The `Accept-Ranges` and `Content-Range` response headers enable HTML5 video scrubbing.

### 3. Make Videos Publicly Readable (or use presigned URLs)

**Option A: Public Read Access (Simplest)**

Add this bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadLiveTV",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::greentv-s3/LiveTV/*"
    }
  ]
}
```

**Option B: Keep Private (More Secure) - Future Enhancement**

Videos stay private, backend generates presigned URLs. Requires additional code changes.

### 4. Configure Backend Environment

**server/.env:**
```bash
# S3 Configuration
S3_REGION=ap-south-1
S3_BUCKET=greentv-s3
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key

# Live Mode Configuration
LIVE_ACCESS_MODE=s3_playlist
LIVE_S3_FOLDER=LiveTV

# Other required env vars...
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/zthorbit
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
APP_URL=https://www.thegreentv.com
CORS_ORIGINS=https://www.thegreentv.com,http://13.205.72.30,https://13.205.72.30
```

### 5. Upload Videos to S3

**Using AWS CLI:**
```bash
# Upload single video
aws s3 cp "Sustainability in sanatana Dharma PART 2.mp4" \
  s3://greentv-s3/LiveTV/ \
  --region ap-south-1

# Upload multiple videos
aws s3 cp ./videos/ s3://greentv-s3/LiveTV/ \
  --recursive \
  --region ap-south-1
```

**Using AWS S3 Console:**
1. Navigate to `greentv-s3` bucket
2. Open `LiveTV/` folder (create if doesn't exist)
3. Click "Upload"
4. Add your video files
5. Click "Upload"

### 6. Verify Setup

**Test S3 Object URL:**
```
https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4
```

**Test Backend API:**
```bash
# Login first to get token
curl -X POST https://www.thegreentv.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Get playlist
curl -X GET https://www.thegreentv.com/api/v1/live/playlist \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "videos": [
    {
      "key": "LiveTV/Sustainability in sanatana Dharma PART 2.mp4",
      "url": "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4",
      "fileName": "Sustainability in sanatana Dharma PART 2.mp4",
      "size": 123456789,
      "lastModified": "2026-03-27T..."
    }
  ],
  "folder": "LiveTV",
  "count": 1
}
```

### 7. Start the Application

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website

# Start backend
cd server
npm install
npm run build
pm2 start dist/index.js --name zthorbit-backend

# Start frontend
cd ..
npm install
npm run build
pm2 start npm --name zthorbit-frontend -- start
```

### 8. Test in Browser

1. Open `https://www.thegreentv.com`
2. Login with your credentials
3. Navigate to "Live TV" page
4. Videos should start playing automatically
5. When one video ends, the next one begins
6. After the last video, it loops back to the first

## How It Works

### Backend Flow

1. **GET /api/v1/live/playlist**
   - Lists all video files from `s3://greentv-s3/LiveTV/`
   - Filters for video extensions (.mp4, .mov, etc.)
   - Sorts alphabetically by filename
   - Returns array of video objects with URLs

2. **POST /api/v1/live/access**
   - Checks `LIVE_ACCESS_MODE=s3_playlist`
   - Calls `listVideosFromFolder()` to get playlist
   - Returns playlist with metadata
   - Requires authentication

### Frontend Flow

1. **Initial Load:**
   - User visits Live TV page
   - Frontend calls `/api/v1/live/access`
   - Receives playlist array
   - Sets first video as current

2. **Playback:**
   - Loads first video URL into `<video>` element
   - Plays video directly (no HLS.js for MP4)
   - Listens for `ended` event

3. **Loop Logic:**
   - On video end → increment index
   - If at end of playlist → reset to 0
   - Load next video URL
   - Auto-play continues

## Video Playback Order

Videos are played in **alphabetical order** by filename. To control order, use numbered prefixes:

```
LiveTV/
  ├── 01-intro.mp4
  ├── 02-main-content.mp4
  ├── 03-sustainability-dharma-part1.mp4
  ├── 04-sustainability-dharma-part2.mp4
  └── 05-conclusion.mp4
```

## Troubleshooting

### Issue: "No videos found in S3 folder"

**Check:**
- Folder path is correct: `LIVE_S3_FOLDER=LiveTV` (no leading/trailing slashes)
- Videos exist in S3: `aws s3 ls s3://greentv-s3/LiveTV/`
- AWS credentials have ListBucket permission

**Fix:**
```bash
# List bucket contents
aws s3 ls s3://greentv-s3/LiveTV/ --region ap-south-1

# If empty, upload videos
aws s3 cp video.mp4 s3://greentv-s3/LiveTV/ --region ap-south-1
```

### Issue: Videos won't play / CORS errors

**Check browser console for:**
```
Access to video at 'https://greentv-s3.s3...' from origin 'https://www.thegreentv.com' 
has been blocked by CORS policy
```

**Fix:**
1. Add CORS configuration to S3 bucket (see step 2)
2. Ensure origin matches exactly (including protocol)
3. Clear browser cache and test

### Issue: 403 Forbidden when accessing videos

**Check:**
- Bucket policy allows GetObject on `LiveTV/*` **OR**
- Videos are public readable **OR**  
- Using presigned URLs (future feature)

**Fix:**
Add bucket policy from step 3

### Issue: Videos appear but don't auto-advance

**Check:**
- Browser console for JavaScript errors
- Video ends event is firing
- Playlist state is updating

**Fix:**
- Hard refresh browser (Ctrl+Shift+R)
- Check video file isn't corrupted
- Verify video codec is browser-compatible (H.264 MP4 recommended)

## Adding New Videos

Just upload to S3 - no backend restart needed:

```bash
aws s3 cp new-video.mp4 s3://greentv-s3/LiveTV/ --region ap-south-1
```

On next page refresh, the new video will appear in the playlist automatically.

## Removing Videos

```bash
aws s3 rm s3://greentv-s3/LiveTV/old-video.mp4 --region ap-south-1
```

## API Endpoints

### GET /api/v1/live/playlist
**Purpose:** List all videos in playlist
**Auth:** Required (Bearer token)
**Response:**
```json
{
  "videos": [
    {
      "key": "LiveTV/video.mp4",
      "url": "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/video.mp4",
      "fileName": "video.mp4",
      "size": 123456789,
      "lastModified": "2026-03-27T10:00:00.000Z"
    }
  ],
  "folder": "LiveTV",
  "count": 1
}
```

### POST /api/v1/live/access
**Purpose:** Get live stream access (returns playlist in s3_playlist mode)
**Auth:** Required (Bearer token)
**Response:**
```json
{
  "accessMode": "s3_playlist",
  "playlist": [...],
  "title": "Live Sustainable Engineering Channel",
  "description": "Playing 5 videos in loop",
  "expiresIn": 0
}
```

## Current Configuration

Based on your requirements:

- **Bucket:** `greentv-s3`
- **Region:** `ap-south-1`
- **Folder:** `LiveTV/`
- **First Video:** `Sustainability in sanatana Dharma PART 2.mp4`
- **Object URL:** `https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4`
- **Bucket ARN:** `arn:aws:s3:::greentv-s3`

## Next Steps

1. ✅ Update `server/.env` with S3 credentials
2. ✅ Set `LIVE_ACCESS_MODE=s3_playlist`
3. ✅ Set `LIVE_S3_FOLDER=LiveTV`
4. ⬜ Configure S3 bucket CORS
5. ⬜ Add bucket policy for public read or ensure videos are accessible
6. ⬜ Upload videos to `s3://greentv-s3/LiveTV/`
7. ⬜ Restart backend server
8. ⬜ Test in browser

## Support

For issues or questions, check:
- Server logs: `pm2 logs zthorbit-backend`
- Browser console (F12)
- AWS CloudWatch logs (if enabled)
- S3 bucket access logs (if enabled)
