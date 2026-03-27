# Live Streaming Runbook (Single Channel, Authenticated, CMAF/fMP4, Signed Cookies)

> Note: The application now defaults to `LIVE_ACCESS_MODE=direct` for Nginx RTMP/HLS without signed cookies. See `ops/LIVE-RTMP-HLS-NGINX.md` if you are not using CloudFront.

This runbook covers the infrastructure and deployment steps that must be performed after code is pushed.

## 1) What was implemented in code

- Backend endpoint `POST /api/v1/live/access` now:
  - Requires authenticated user.
  - Signs CloudFront cookies for the stream path wildcard.
  - Returns `streamUrl`, `title`, `description`, and cookie TTL.
- Frontend Live TV page now:
  - Calls `POST /api/v1/live/access`.
  - Plays HLS using native support or `hls.js` fallback.
  - Sends credentials for cookie-based playback.
- Backend env support added for CloudFront signing values.

## 2) AWS resources required

- S3 source bucket (private): original MP4 files.
- S3 output bucket (private): MediaConvert output (HLS/CMAF).
- MediaConvert job template (single channel output path).
- CloudFront distribution with OAC to output bucket.
- CloudFront key group and key pair for signed cookies.
- DNS record: `stream.thegreentv.com` -> CloudFront distribution.

## 3) S3 setup

### 3.1 Source bucket

- Bucket example: `thegreentv-source`
- Prefix example: `videos/`
- Keep bucket private.

### 3.2 Output bucket

- Bucket example: `thegreentv-hls`
- Output prefix (single channel): `live/main/`
- Keep bucket private.

### 3.3 CORS for output bucket (CloudFront origin)

If browser requests HLS from CloudFront, CORS should be handled at CloudFront response headers policy. S3 CORS can still be set conservatively:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://www.thegreentv.com", "http://13.205.72.30", "https://13.205.72.30"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Accept-Ranges", "Content-Range"],
    "MaxAgeSeconds": 3000
  }
]
```

## 4) MediaConvert setup (CMAF/fMP4)

Create a job template with:

- Input: `s3://thegreentv-source/videos/<file>.mp4`
- Output group type: Apple HLS
- Segment type: CMAF/fMP4
- Destination: `s3://thegreentv-hls/live/main/`
- Master playlist: `master.m3u8`
- Segment duration: 2s
- GOP/keyframe interval: 2s (aligned)

Recommended ABR ladder:

- 240p @ 400 kbps
- 360p @ 700 kbps
- 480p @ 1200 kbps
- 720p @ 2500 kbps
- 1080p @ 4500 kbps

Audio:

- AAC-LC, 48 kHz, stereo

## 5) CloudFront setup

### 5.1 Distribution

- Alternate domain (CNAME): `stream.thegreentv.com`
- Origin: `thegreentv-hls` (S3 REST endpoint, not website endpoint)
- OAC: enabled
- Viewer protocol policy: Redirect HTTP to HTTPS
- Cache behavior path: `/live/*`
- Allowed methods: GET, HEAD, OPTIONS

### 5.2 Restrict S3 to CloudFront only

Attach bucket policy allowing only this distribution ARN via OAC.

### 5.3 Signed cookie support

- Create CloudFront key group
- Add public key to key group
- Attach key group as trusted signer/trusted key group in behavior `/live/*`

### 5.4 Response headers (CORS)

Set response headers policy for `/live/*`:

- `Access-Control-Allow-Origin: https://www.thegreentv.com` (preferred)
- Optional for IP testing: `http://13.205.72.30` and `https://13.205.72.30`
- `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`
- `Access-Control-Allow-Credentials: true`

## 6) DNS and TLS

- Create DNS record for `stream.thegreentv.com` to CloudFront distribution.
- Ensure ACM certificate includes:
  - `www.thegreentv.com`
  - `stream.thegreentv.com`

## 7) Server environment on EC2

Update `server/.env` on EC2 with:

```env
APP_URL=https://www.thegreentv.com
CORS_ORIGINS=https://www.thegreentv.com,http://13.205.72.30,https://13.205.72.30

CF_STREAM_DOMAIN=stream.thegreentv.com
CF_KEY_PAIR_ID=KXXXXXXXXXXXX
CF_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----"
CF_COOKIE_TTL_SECONDS=600
CF_COOKIE_DOMAIN=.thegreentv.com
```

IP fallback example (if running without stream subdomain):

```env
# APP_URL=http://13.205.72.30
# CF_STREAM_DOMAIN=13.205.72.30
# CF_COOKIE_DOMAIN=
```

Notes:

- `CF_PRIVATE_KEY` must include escaped newlines (`\n`) when stored in `.env`.
- Cookie TTL is set to 10 minutes (`600`).

## 8) Live config in application database

After backend is running, set live config via API (admin/editor token required):

`PUT /api/v1/live/config`

Body:

```json
{
  "streamUrl": "https://stream.thegreentv.com/live/main/master.m3u8",
  "title": "Live Sustainable Engineering Channel",
  "description": "Streaming now"
}
```

## 9) Deploy updated code to EC2

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website

git pull origin AWS
npm install
cd server && npm install && npm run build && cd ..
npm run build

pm2 restart thegreentv-api
sudo nginx -t && sudo systemctl reload nginx
```

## 10) Verification checklist

### 10.1 Backend live access

- Login user in frontend.
- Call `POST /api/v1/live/access`.
- Verify response has stream URL.
- Verify cookies set in browser:
  - `CloudFront-Key-Pair-Id`
  - `CloudFront-Policy`
  - `CloudFront-Signature`

### 10.2 Stream playback

On Live TV page, in browser Network tab confirm:

- `master.m3u8` -> 200
- Variant playlists -> 200
- `.m4s` segments -> 200
- No CORS errors
- No 403 from CloudFront

URL checks:

- Domain app: `https://www.thegreentv.com`
- IP app: `http://13.205.72.30`
- Domain stream: `https://stream.thegreentv.com/live/main/master.m3u8`

### 10.3 Cookie expiry behavior

- Wait 10 minutes.
- Playback should fail or refresh access.
- Reload page should call `/api/v1/live/access` and resume.

## 11) Troubleshooting

### 403 on HLS segments

- Trusted key group not attached to `/live/*`
- Cookie domain/path mismatch
- Signed policy resource path does not match stream path

### CORS error on playlist/segments

- CloudFront response headers policy missing `Allow-Origin`/`Allow-Credentials`
- Origin set to wildcard while credentials are used

### Works on Safari, fails on Chrome/Edge

- `hls.js` not loaded or blocked
- Check browser console for script load failure

### Cookies not present

- User not authenticated
- `CF_*` env vars missing
- `secure` cookies on non-HTTPS environment

## 12) Security notes

- Keep both S3 buckets private.
- Rotate CloudFront signing keys periodically.
- Keep cookie TTL short (10 minutes) and refresh from backend.
- Never expose private key in frontend or repository.
