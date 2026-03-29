# TheGreenTV EC2 Deployment Guide

This document covers end-to-end setup to run TheGreenTV (`thegreentv.com`) on AWS EC2 with Nginx + PM2, plus options for HTTPS and low-latency HLS.

## Domains
- App: https://thegreentv.com and https://www.thegreentv.com
- API: https://api.thegreentv.com
- Media/CDN: https://media.thegreentv.com (for HLS segments/manifests)

Point DNS A/ALIAS records to your ALB or CloudFront once they are ready.

## AWS resources to create
1) **Region**: pick closest to users (e.g., ap-south-1).
2) **S3 bucket** for media: `thegreentv-media` (unique, versioning on, SSE-S3).
3) **MongoDB**: preferred MongoDB Atlas M10+ in same region (VPC peering) with DB name `thegreentv`; or self-managed Mongo on EC2 with gp3 EBS and backups.
4) **ACM cert** for `thegreentv.com`, `*.thegreentv.com` (same region as ALB; us-east-1 if using CloudFront).
5) **Security groups**:
  - Web/ALB: allow 80/443 from 0.0.0.0/0; 22 only from your IP; 1935 (optional RTMP ingest) from your IP.
  - Mongo: allow 27017 only from the web/ALB SG (or peered CIDR if using Atlas private link/peering).

## Launch EC2 (Ubuntu 24.04 LTS AMI: `amazon/ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-20260313`)
- Size: t3.small is fine for initial low traffic; scale to t3.medium or larger when users grow.
- Enable public IP. Attach the web SG above.
- User data (optional bootstrap):
  ```bash
  #!/bin/bash
  apt-get update -y
  apt-get install -y git nginx curl
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  npm install -g pm2
  systemctl enable nginx && systemctl start nginx
  ```

## SSH in
```bash
chmod 600 ~/.ssh/thegreentv-ec2
ssh -i ~/.ssh/thegreentv-ec2 ubuntu@13.205.72.30
```

## Keep the same IP (Elastic IP)
- In EC2 console, allocate a new Elastic IP (EIP).
- Associate the EIP to your EC2 instance (Actions -> Associate Elastic IP -> select instance and private IP). Current EIP: **13.205.72.30**.
- Update DNS records for `thegreentv.com`, `www.thegreentv.com`, `api.thegreentv.com`, and `media.thegreentv.com` to point to the Elastic IP (or to ALB/CloudFront if you add them later). The EIP will persist across restarts.

## Clone repo (branch PreDeployment)
```bash
sudo mkdir -p /var/www/zthorbit && sudo chown ubuntu:ubuntu /var/www/zthorbit
cd /var/www/zthorbit
git clone https://github.com/Janakar-cloud/ZthOrbit-Sustainable-Eng-Website.git .
git checkout PreDeployment
```

## Install dependencies
```bash
# Full install (needed for build tools like TypeScript, Vite)
npm install            # root (Vite app)
cd server && npm install && cd ..
cd live-channel-app && npm install && cd ..  # if using Next app
```

## Optional: Install MongoDB locally (if not using Atlas)
```bash
# Import MongoDB 7.0 public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

## Keep stack current (latest stable)
- Use Node 20 LTS (already installed via nodesource script). Verify with `node -v`.
- Update npm: `sudo npm install -g npm@latest`.
- Install PM2 globally: `sudo npm install -g pm2`. (If you get EACCES permission error, make sure to use `sudo`)
- To refresh dependencies to latest semver-major: `npx npm-check-updates -u` then `npm install` in each workspace (root, server, live-channel-app). Run tests/build after updating.
- Rebuild after upgrades: `npm run build` (root), `npm run build` in `live-channel-app`, and restart PM2.

## Environment files (do NOT commit secrets)
Create `.env` files only where the application actually reads them: repo root for the Vite frontend, `live-channel-app/.env` for Next, and `server/.env` for the API.

Example `server/.env` (Mongo + S3 + SMTP):
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/zthorbit
JWT_SECRET=replace-with-a-32-byte-random-secret
JWT_REFRESH_SECRET=replace-with-a-second-32-byte-random-secret
APP_URL=http://13.205.72.30
CORS_ORIGINS=http://13.205.72.30,http://13.205.72.30:3000
S3_REGION=ap-south-1
S3_BUCKET=greentv-s3
S3_ACCESS_KEY_ID=replace-with-aws-access-key
S3_SECRET_ACCESS_KEY=replace-with-aws-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=smtpgreentv@gmail.com
SMTP_PASS=replace-with-app-password
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=smtpgreentv@gmail.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

Example frontend `.env` (Vite at repo root):
```
VITE_API_BASE=http://13.205.72.30/api/v1
VITE_LIVE_STREAM_URL=http://13.205.72.30:8080/hls/channel.m3u8
```

Example Next `.env` (`live-channel-app/.env`):
```
NEXT_PUBLIC_API_BASE=http://13.205.72.30/api/v1
LIVE_STREAM_URL=https://media.thegreentv.com/hls/channel.m3u8
```

## Build
```bash
npm run build                # root Vite build → dist/
cd server && npm run build && cd ..  # server TypeScript → dist/index.js
cd live-channel-app && npm run build && cd ..  # Next.js → .next/ (if using Next)
```

**Note**: Next.js may show a warning about multiple lockfiles. This is expected in a monorepo setup and can be ignored, or add `turbopack: { root: '.' }` to `next.config.ts` to silence it.

## Production cleanup (remove dev dependencies with vulnerabilities)
```bash
# After building, clean install with production dependencies only
rm -rf node_modules package-lock.json
npm install --omit=dev
npm audit  # Should show 0 vulnerabilities
```

## Run backend with PM2
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
# Server must be built first (TypeScript → JavaScript)
npm run build
# Start the compiled JavaScript, not the TypeScript source
mkdir -p /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/logs
pm2 start dist/index.js --name thegreentv-api
pm2 save
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Alternative: Use PM2 ecosystem config**
```bash
# Use the provided PM2 config file
mkdir -p /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/logs
pm2 start /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/ops/pm2.config.cjs
pm2 save
```

## Serve frontend
- **If using Vite static**: after build, `dist/` is served by Nginx (config below).
- **If using Next**: run via PM2 and proxy with Nginx.

**Copy the provided Nginx config:**
```bash
sudo cp /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/ops/nginx.conf.example /etc/nginx/sites-available/thegreentv
sudo ln -s /etc/nginx/sites-available/thegreentv /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Or create `/etc/nginx/sites-available/thegreentv` manually:
```
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```
Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
curl http://localhost/
```

## Common Ubuntu EC2 gotchas
- If you see the default Nginx welcome page, your site file is not enabled or `/etc/nginx/sites-enabled/default` still exists.
- If the browser times out but `curl http://localhost/` works, re-check the EC2 security group inbound rules for port 80 and any NACL restrictions.
- Do not run `sudo pm2 start ...` for the app process. That creates a second PM2 daemon as root and causes hard-to-diagnose port conflicts.
- If PM2 throws EACCES on `/var/log/pm2`, use the checked-in PM2 config, which logs under the project `logs/` directory.
- If `/api/v1/...` returns 404 through Nginx, make sure `proxy_pass` does not end with a trailing slash.

## HTTPS options
- **Preferred**: Use ALB or CloudFront with ACM cert for `thegreentv.com`, `api.thegreentv.com`, `media.thegreentv.com`; forward 80/443 to EC2.
- **Alternative**: Certbot on EC2 with Nginx:
  ```bash
  sudo apt-get install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d thegreentv.com -d www.thegreentv.com -d api.thegreentv.com
  ```

## Health checks
- Add `/healthz` and `/readyz` in the Node API (server) and point ALB health checks there.

## Updates (pull from Git)
```bash
cd /var/www/zthorbit
git fetch
git checkout PreDeployment
git pull origin PreDeployment
npm install
npm run build
cd server && npm run build && cd ..
pm2 restart all
sudo systemctl reload nginx
```

- ## Optional: self-hosted live (HLS) quick start
- Install ffmpeg and nginx-rtmp:
  ```bash
  sudo apt-get update -y
  sudo apt-get install -y ffmpeg libnginx-mod-rtmp
  ```
- Add `nginx-rtmp` stanza (example path `/var/www/hls`, RTMP on 1935, HLS on 8080). Serve via `media.thegreentv.com` or CloudFront.
- Push a loop from uploaded assets:
  ```bash
  ffmpeg -re -f concat -safe 0 -i list.txt -c:v libx264 -preset veryfast -g 2 -keyint_min 2 -sc_threshold 0 \
    -c:a aac -ar 48000 -b:a 128k -f flv rtmp://localhost/live/channel
  ```
- Expose `https://media.thegreentv.com/hls/channel.m3u8` to the player.

## Monitoring and logs
- Enable CloudWatch logs for Nginx (`/var/log/nginx/access.log`, `error.log`) and PM2.
- Set alarms on ALB 5xx, EC2 CPU, Mongo connections/CPU (or Atlas metrics), and S3 error rates.

## Backups
- Atlas snapshots (or EBS snapshots if self-hosting Mongo); S3 versioning on; optional lifecycle to Glacier for older media.
