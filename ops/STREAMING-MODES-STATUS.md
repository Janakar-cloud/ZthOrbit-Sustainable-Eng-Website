# Streaming Modes - Implementation Status ✅

## Overview
The application **fully supports** three live streaming modes:
1. **S3 Playlist Mode** (VOD Loop) - **DEFAULT** ✅ **NEW!**
2. **Direct Mode** (Nginx RTMP/HLS) - Available ✅
3. **CloudFront Mode** (Signed Cookies) - Available ✅

## ✅ Already Implemented

### Backend (`server/src/routes/live.ts`)
- ✅ `POST /api/v1/live/access` handles all three modes
- ✅ `GET /api/v1/live/playlist` - new endpoint for S3 video listing
- ✅ In `s3_playlist` mode: lists videos from S3 folder, returns playlist array
- ✅ In `direct` mode: returns stream URL without signing cookies
- ✅ In `cloudfront` mode: generates and sets CloudFront signed cookies
- ✅ Returns `accessMode` in response for frontend to adapt

### Backend S3 Utils (`server/src/utils/s3.ts`)
- ✅ `listVideosFromFolder()` - lists all video files from S3 folder
- ✅ Filters video extensions (.mp4, .mov, .avi, .mkv, .webm, .m4v)
- ✅ Sorts alphabetically by filename
- ✅ Returns public URLs for browser access
- ✅ Error handling for S3 failures

### Frontend (`src/pages/LiveTv/LiveTV.tsx`)
- ✅ Calls `/api/v1/live/access` to get stream URL or playlist
- ✅ Receives `accessMode` from backend
- ✅ Handles `s3_playlist` mode with sequential playback
- ✅ Implements video loop: plays next video on 'ended' event
- ✅ Resets to first video after last one completes
- ✅ Only uses `withCredentials: true` when in CloudFront mode
- ✅ Direct MP4 playback for S3 videos (no HLS.js needed)

### Configuration (`server/src/config/env.ts`)
- ✅ `LIVE_ACCESS_MODE` environment variable support
- ✅ `LIVE_S3_FOLDER` environment variable for playlist folder
- ✅ Defaults to `s3_playlist` if not specified
- ✅ CloudFront config fields available when needed

### Environment Examples
- ✅ `server/.env.example` - defaults to `LIVE_ACCESS_MODE=s3_playlist`
- ✅ `LIVE_S3_FOLDER=LiveTV` configuration
- ✅ CloudFront variables commented out as optional
- ✅ Clear documentation in comments

### Documentation
- ✅ **NEW!** `ops/LIVE-S3-PLAYLIST-MODE.md` - Complete S3 setup guide
- ✅ `ops/LIVE-RTMP-HLS-NGINX.md` - Direct mode setup guide
- ✅ `ops/LIVE-HLS-CMAF-CLOUDFRONT-SIGNED-COOKIES.md` - CloudFront mode guide
- ✅ All docs reference each other

## 🚀 How to Use

### For S3 Playlist Mode (VOD Loop) - **CURRENT DEFAULT**

1. **Server `.env`:**
   ```bash
   LIVE_ACCESS_MODE=s3_playlist
   LIVE_S3_FOLDER=LiveTV
   S3_BUCKET=greentv-s3
   S3_REGION=ap-south-1
   S3_ACCESS_KEY_ID=your-key
   S3_SECRET_ACCESS_KEY=your-secret
   ```

2. **Configure S3 bucket CORS** (see `ops/LIVE-S3-PLAYLIST-MODE.md`)

3. **Upload videos to S3:**
   ```bash
   aws s3 cp video.mp4 s3://greentv-s3/LiveTV/ --region ap-south-1
   ```

4. **Done!** Login and visit Live TV page - videos will play in loop automatically

### For Direct Mode (Nginx RTMP) - Available

1. **Server `.env`:**
   ```bash
   LIVE_ACCESS_MODE=direct
   ```

2. **Configure Nginx RTMP** (see `ops/LIVE-RTMP-HLS-NGINX.md`)

3. **Set stream URL via API:**
   ```bash
   PUT /api/v1/live/config
   {
     "streamUrl": "https://stream.example.com/hls/live/main/index.m3u8",
     "title": "Live Sustainable Engineering",
     "description": "Streaming now"
   }
   ```

4. **Done!** Login and visit Live TV page - it will stream directly without signed cookies

### For CloudFront Mode (Signed Cookies) - Available

1. **Server `.env`:**
   ```bash
   LIVE_ACCESS_MODE=cloudfront
   CF_STREAM_DOMAIN=stream.thegreentv.com
   CF_KEY_PAIR_ID=KXXXXXXXXXXXX
   CF_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   CF_COOKIE_TTL_SECONDS=600
   CF_COOKIE_DOMAIN=.thegreentv.com
   ```

2. **Setup CloudFront** (see `ops/LIVE-HLS-CMAF-CLOUDFRONT-SIGNED-COOKIES.md`)

3. **Set stream URL** (CloudFront distribution URL)

4. **Done!** Backend will automatically issue signed cookies

## 🔍 Code Flow

### S3 Playlist Mode (NEW!)
```
User visits Live TV → Frontend calls /api/v1/live/access →
Backend lists S3 videos → Returns playlist array →
Frontend loads first video → Plays sequentially →
On video end → Load next video → Loop back to start
```

### Direct Mode
```
User visits Live TV → Frontend calls /api/v1/live/access →
Backend checks auth → Returns streamUrl (no cookies) →
Frontend loads HLS without credentials → Plays stream
```

### CloudFront Mode
```
User visits Live TV → Frontend calls /api/v1/live/access →
Backend checks auth → Generates signed cookies → Sets cookies →
Frontend loads HLS with credentials → CloudFront validates cookies → Plays stream
```

## 📊 Mode Comparison

| Feature | S3 Playlist | Direct RTMP | CloudFront |
|---------|-------------|-------------|------------|
| **Use Case** | VOD loop | Live stream | Secure live |
| **Content Type** | Pre-recorded | Live | Live/VOD |
| **Authentication** | ✅ Login required | ✅ Login required | ✅ Login + signed cookies |
| **CDN** | S3 direct | Nginx origin | CloudFront distribution |
| **Setup Complexity** | ⭐ Simple | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Automatic Updates** | ✅ Yes (S3 upload) | ❌ Manual config | ❌ Manual config |
| **Looping** | ✅ Built-in | ❌ No | ❌ No |
| **Global Reach** | ⭐⭐ S3 regions | ⭐ Single origin | ⭐⭐⭐ CloudFront |
| **Cost** | $ S3 storage + transfer | $$ EC2 + bandwidth | $$$ CloudFront |

## ✅ No Further Changes Needed

The implementation is **complete and production-ready**. All three modes work seamlessly with automatic mode detection. Simply configure the desired mode via environment variable.

## 🎯 Current Configuration (User Request)

Based on requirements:
- Bucket: `greentv-s3`
- Region: `ap-south-1`
- Folder: `LiveTV`
- Mode: `s3_playlist`
- Videos will play in alphabetical order and loop continuously

See `ops/LIVE-S3-PLAYLIST-MODE.md` for complete setup instructions.
