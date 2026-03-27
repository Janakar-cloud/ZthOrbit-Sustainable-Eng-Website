# Quick Start: S3 Video Playlist Setup

## Your Configuration

```
Bucket:    greentv-s3
Region:    ap-south-1
Folder:    LiveTV
Video:     Sustainability in sanatana Dharma PART 2.mp4
Video URL: https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4
```

## Step-by-Step Setup

### 1. Update Server Environment (2 minutes)

Edit `server/.env`:
```bash
S3_REGION=ap-south-1
S3_BUCKET=greentv-s3
S3_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_ACCESS_KEY=your-40-char-secret-key
LIVE_ACCESS_MODE=s3_playlist
LIVE_S3_FOLDER=LiveTV
```

### 2. Configure S3 Bucket CORS (2 minutes)

AWS Console → S3 → **greentv-s3** → Permissions → CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://www.thegreentv.com",
      "http://13.205.72.30",
      "https://13.205.72.30"
    ],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Make LiveTV Folder Public (1 minute)

AWS Console → S3 → **greentv-s3** → Permissions → Bucket policy:
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

Click **Save changes**.

### 4. Verify Your Video is Accessible (30 seconds)

Test URL in browser:
```
https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4
```

Should download or play the video.

### 5. Restart Backend Server (1 minute)

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
npm run build
pm2 restart zthorbit-backend
pm2 logs zthorbit-backend --lines 50
```

Look for:
```
✅ Server running on port 4000
✅ MongoDB connected
```

### 6. Test Backend API (1 minute)

Login and get your token, then:
```bash
curl -X GET https://www.thegreentv.com/api/v1/live/playlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "videos": [
    {
      "fileName": "Sustainability in sanatana Dharma PART 2.mp4",
      "url": "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4",
      ...
    }
  ],
  "count": 1,
  "folder": "LiveTV"
}
```

### 7. Test in Browser (1 minute)

1. Go to https://www.thegreentv.com
2. Login
3. Click "Live TV"
4. Video should start playing automatically
5. Open browser console (F12) - should see no errors

## Done! 🎉

Your video will now play in a continuous loop. Add more videos anytime:

```bash
aws s3 cp video2.mp4 s3://greentv-s3/LiveTV/ --region ap-south-1
```

Refresh the page and all videos will play in alphabetical order.

## Troubleshooting

**No videos found:**
```bash
# Check if video exists
aws s3 ls s3://greentv-s3/LiveTV/ --region ap-south-1
```

**CORS error:**
- Verify CORS config (Step 2)
- Check AllowedOrigins includes your domain

**403 Forbidden:**
- Verify bucket policy (Step 3)
- Check Resource path: `arn:aws:s3:::greentv-s3/LiveTV/*`

**API returns error:**
- Check server logs: `pm2 logs zthorbit-backend`
- Verify S3 credentials in server/.env
- Test AWS credentials: `aws sts get-caller-identity`

## Next Steps

- Upload more videos to LiveTV folder
- Videos play in alphabetical order (use numbered prefixes to control order)
- Each video plays once, then advances to next
- After last video, loops back to first

See [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) for full details.
