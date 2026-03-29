# Live Streaming with Nginx RTMP (Direct HLS)

This flow removes CloudFront signed cookies and serves HLS directly from an Nginx RTMP/HLS origin.

## What changed in code
- `POST /api/v1/live/access` now supports `LIVE_ACCESS_MODE=direct` (default) and simply returns the configured stream URL without setting cookies.
- Frontend Live TV only sends credentials for CloudFront mode; in direct mode HLS requests are unauthenticated.
- Env examples now default to `LIVE_ACCESS_MODE=direct` and comment CloudFront values.

## Server env
```
LIVE_ACCESS_MODE=direct
APP_URL=https://www.thegreentv.com
CORS_ORIGINS=https://www.thegreentv.com,http://13.205.72.30,https://13.205.72.30
# CloudFront values only if switching back to signed cookies
# CF_STREAM_DOMAIN=...
```

## Nginx RTMP/HLS sketch
- RTMP ingest: `rtmp://<server-ip>/live/<stream_key>`
- HLS output: `http://<server-ip>/hls/live/<name>/index.m3u8`
- Minimal HLS location:
```
rtmp {
  server {
    listen 1935;
    chunk_size 4096;
    application live {
      live on;
      hls on;
      hls_path /var/www/hls;
      hls_fragment 2s;
      hls_playlist_length 6s;
    }
  }
}
http {
  server {
    listen 80;
    location /hls/ {
      types { application/vnd.apple.mpegurl m3u8; video/mp2t ts; }
      add_header Access-Control-Allow-Origin "*";
      add_header Cache-Control no-cache;
      root /var/www;
    }
  }
}
```
Adjust CORS and TLS as needed (serve over HTTPS in production).

## App configuration
1) Set live config via API (admin/editor token):
```
PUT /api/v1/live/config
{ "streamUrl": "https://stream.example.com/hls/live/main/index.m3u8", "title": "Live Sustainable Engineering", "description": "Streaming now" }
```
2) Ensure the HLS URL is reachable from browsers (CORS headers if cross-domain).
3) Login as a user and visit the Live TV page; it should start playback without CloudFront cookies.

## Switching back to CloudFront
- Set `LIVE_ACCESS_MODE=cloudfront` and populate `CF_*` variables.
- `/live/access` will resume issuing signed cookies and the frontend will send credentials for HLS requests.
