# Quick Start: Migrate to S3

## Step 1: Configure S3 Credentials

Add to `server/.env`:

```env
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## Step 2: Run Migration

```bash
cd server
npm run migrate:s3
```

## Step 3: Verify

Check a few videos/podcasts in your app to ensure they play from S3.

## What Gets Migrated?

- ✅ All video files → `videos/` folder
- ✅ All podcast audio → `podcasts/` folder  
- ✅ All thumbnails → `thumbnails/` folder
- ✅ All podcast images → `podcast-images/` folder
- ✅ Database URLs updated automatically
- ✅ Safe to re-run (skips already migrated files)

## Need Help?

See full documentation: [MIGRATION_TO_S3.md](./MIGRATION_TO_S3.md)

---

**Files Created:**
- Migration script: `src/migrations/migrate-to-s3.ts`
- S3 upload utils: `src/utils/s3-upload.ts`
- NPM command: `npm run migrate:s3`
