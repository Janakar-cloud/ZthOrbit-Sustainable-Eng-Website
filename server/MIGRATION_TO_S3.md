# Migration to S3 Storage

This guide explains how to migrate all your existing videos and podcasts from Google Drive (or any other hosting) to AWS S3.

## Prerequisites

### 1. AWS S3 Bucket Setup

Create an S3 bucket with public access:

```bash
# AWS CLI commands
aws s3 mb s3://your-bucket-name --region us-east-1
```

Configure bucket policy for public read:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 2. Environment Variables

Add to `server/.env`:

```env
# AWS S3 Configuration
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Get AWS credentials:**
1. Go to AWS Console → IAM → Users
2. Create new user with S3 full access policy
3. Generate access keys

### 3. Verify Configuration

```bash
cd server
npm run build
node -e "import('./dist/config/env.js').then(m => console.log('S3 Config:', m.env.s3))"
```

## Running the Migration

### Option 1: TypeScript (Development)

```bash
cd server
npm run migrate:s3
```

### Option 2: Compiled JavaScript (Production)

```bash
cd server
npm run build
node dist/migrations/migrate-to-s3.js
```

## What the Migration Does

1. **Fetches all videos and podcasts** from MongoDB
2. **Downloads each file** from current URL (Google Drive, etc.)
3. **Uploads to S3** with organized folder structure:
   - Videos: `videos/timestamp-filename.mp4`
   - Podcasts: `podcasts/timestamp-filename.mp3`
   - Thumbnails: `thumbnails/timestamp-filename.jpg`
   - Podcast Images: `podcast-images/timestamp-filename.jpg`
4. **Updates database** with new S3 URLs
5. **Skips files** already on S3 (safe to re-run)

## Migration Progress

The script provides detailed progress logs:

```
🚀 Starting migration to S3...

✓ Connected to MongoDB

🎬 Starting video migration...
Found 15 videos to migrate

📹 Processing: Climate Action Now (507f1f77bcf86cd799439011)
  ⬇️  Downloading from: https://drive.google.com/...
  ✓ Downloaded 45.32 MB
  ⬆️  Uploading to S3: videos/1743004800000-climate-action.mp4
  ✓ Uploaded to: https://your-bucket.s3.us-east-1.amazonaws.com/videos/...
  ✅ Video updated in database

📊 Migration Summary:
==================================================

📹 Videos:
  ✅ Success: 15
  ❌ Failed: 0

🎙️  Podcasts:
  ✅ Success: 23
  ❌ Failed: 0

✅ Migration complete!
```

## Handling Google Drive Files

Google Drive direct links need special formatting:

**Before (Drive sharing link):**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

**Convert to direct download:**
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

The migration script handles redirects automatically.

## Troubleshooting

### 1. Download Fails (Google Drive)

**Problem:** "Failed to download: 403"

**Solution:** Make sure Google Drive files are set to "Anyone with the link can view"

```
Right-click file → Share → Change to "Anyone with the link"
```

### 2. S3 Upload Fails

**Problem:** "Access Denied"

**Solution:** Check IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 3. Large File Timeout

**Problem:** "Socket timeout"

**Solution:** Process files in batches or increase timeout in the script.

### 4. Check Already Migrated Files

```bash
# Query videos on S3
mongosh
use zthorbit
db.videos.find({ streamUrl: /s3.amazonaws.com/ }).count()

# Query all videos
db.videos.find({}, { title: 1, streamUrl: 1 }).pretty()
```

## After Migration

### 1. Verify URLs

Test a few videos/podcasts in your frontend to ensure playback works.

### 2. Update Admin Interface

The admin interface should now use S3 uploads via the `/uploads/presign` endpoint:

```typescript
// Get presigned URL
const { url, key } = await fetch('/api/uploads/presign', {
  method: 'POST',
  body: JSON.stringify({ prefix: 'videos', contentType: 'video/mp4' })
});

// Upload directly to S3
await fetch(url, { method: 'PUT', body: file });

// Use the S3 URL
const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
```

### 3. Set Up CloudFront (Optional)

For better performance and CDN caching:

```bash
# Create CloudFront distribution pointing to S3 bucket
# Update URLs in database to use CloudFront domain
```

### 4. Cleanup Old Files

After verifying migration:
- Delete files from Google Drive
- Remove Google Drive API credentials (if any)

## Cost Considerations

**AWS S3 Pricing (us-east-1):**
- Storage: $0.023 per GB/month
- Data transfer out: $0.09 per GB (first 10TB)
- PUT requests: $0.005 per 1,000

**Example cost for 100GB of videos:**
- Storage: $2.30/month
- Transfer (1TB/month): $90
- Requests: negligible

**Recommendation:** Use CloudFront CDN to reduce S3 egress costs by ~60%.

## Rollback

If you need to rollback:

1. Stop the migration (Ctrl+C)
2. Restore database from backup
3. Original URLs remain unchanged for non-migrated content

## Support

For issues during migration:
- Check server logs: `pm2 logs thegreentv-api`
- Verify S3 credentials: `aws s3 ls s3://your-bucket-name`
- Test single upload: Use the `/uploads/presign` API endpoint

---

**Migration Script:** `server/src/migrations/migrate-to-s3.ts`
**S3 Utils:** `server/src/utils/s3-upload.ts`
