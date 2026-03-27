# ZthOrbit Deployment Checklist

Complete validation checklist to ensure browser URLs and API endpoints work perfectly on both production domain (www.thegreentv.com) and server IP (13.205.72.30).

## 🔧 Pre-Deployment Configuration

### 1. Server Environment (.env files)

#### Backend (`server/.env`)
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
```

Required variables:
- [ ] `PORT=4000` - Backend listening port
- [ ] `MONGODB_URI=mongodb://localhost:27017/zthorbit` - Or Atlas connection string
- [ ] `JWT_SECRET=<32-byte-random-secret>` - Access token secret
- [ ] `JWT_REFRESH_SECRET=<32-byte-different-secret>` - Refresh token secret
- [ ] `APP_URL=https://www.thegreentv.com` - Public URL (no trailing slash)
- [ ] `# APP_URL=http://13.205.72.30` - IP fallback
- [ ] `CORS_ORIGINS=https://www.thegreentv.com,http://13.205.72.30,https://13.205.72.30,http://13.205.72.30:3000` - Allowed origins
- [ ] `SEED_DEFAULT_PASSWORD=ChangeMe123!` - Default password for seeded users
- [ ] `NODE_ENV=production` - Production mode

**S3/Media (if using)**:
- [ ] `S3_REGION=ap-south-1`
- [ ] `S3_BUCKET=thegreentv-media`
- [ ] `AWS_ACCESS_KEY_ID=<your-key>`
- [ ] `AWS_SECRET_ACCESS_KEY=<your-secret>`

**SMTP (optional for email verification)**:
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_SECURE=false`
- [ ] `SMTP_USER=<email>`
- [ ] `SMTP_PASS=<app-password>`

**Verify .env exists and is readable:**
```bash
ls -la /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server/.env
cat /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server/.env  # verify no syntax errors
```

#### Frontend Root (root `.env`)
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website
```

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

Required variables:
- [ ] `VITE_API_BASE=https://www.thegreentv.com/api/v1` - Backend API base URL (no trailing slash)
- [ ] `# VITE_API_BASE=http://13.205.72.30/api/v1` - IP fallback
- [ ] `VITE_LIVE_STREAM_URL=https://stream.thegreentv.com/live/main/master.m3u8` - Live stream URL
- [ ] `# VITE_LIVE_STREAM_URL=http://13.205.72.30/hls/live/main/master.m3u8` - IP fallback

**Verify .env exists:**
```bash
cat /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/.env
```

---

### 2. Nginx Configuration

#### Check Active Config
```bash
sudo nginx -T | grep -A 30 "location /api"
```

#### Required Settings

**CRITICAL: API proxy must preserve `/api` prefix**

```nginx
location /api/ {
    # Use $request_uri to pass the full path including /api
    proxy_pass http://127.0.0.1:4000$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}
```

**DO NOT use:**
- ❌ `proxy_pass http://127.0.0.1:4000/;` (trailing slash strips /api)
- ❌ `rewrite ^/api/(.*)$ /$1 break;` (strips /api prefix)

#### Update Config
```bash
sudo nano /etc/nginx/sites-available/default  # or your site config
# Make the changes above
sudo nginx -t  # validate syntax
sudo systemctl reload nginx
```

Checklist:
- [ ] Nginx config uses `proxy_pass http://127.0.0.1:4000$request_uri`
- [ ] No trailing slash on proxy_pass
- [ ] No rewrite rules stripping /api
- [ ] Nginx syntax is valid (`sudo nginx -t` passes)
- [ ] Nginx reloaded successfully

---

### 3. Database Setup

#### MongoDB Connection
```bash
# If using local MongoDB
sudo systemctl status mongod
mongosh "mongodb://localhost:27017/zthorbit"

# If using Atlas
mongosh "$MONGODB_URI"
```

Checklist:
- [ ] MongoDB is running and accessible
- [ ] Database `zthorbit` exists (or will be created on first connect)
- [ ] Connection string in `server/.env` is correct

#### Seed Database (Initial Setup Only)
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
npm run seed
```

Expected output:
```
Seed complete. Test users (password = ChangeMe123!):
- superadmin: superadmin@zthorbit.local
- superadmin: janakar.ganesan@gmail.com
- admin: admin1@zthorbit.local
- admin: admin2@zthorbit.local
- viewer: user1@zthorbit.local
- viewer: user2@zthorbit.local
```

Checklist:
- [ ] Seed script ran without errors
- [ ] All 6 users were created
- [ ] Users are auto-verified (emailVerified: true)
- [ ] LiveConfig, sample videos, podcasts, articles created

#### Verify Seeded Users
```bash
mongosh "$MONGODB_URI" --eval 'db.users.find({}, {email:1, role:1, emailVerified:1}).pretty()'
```

Expected: All users have `emailVerified: true`

---

## 🚀 Clean Deployment Steps

### 4. Stop All Running Processes

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server

# Stop and delete PM2 processes
pm2 stop thegreentv-api || true
pm2 delete thegreentv-api || true

# Verify nothing is running
pm2 list
```

Checklist:
- [ ] All PM2 processes stopped
- [ ] `pm2 list` shows empty or no `thegreentv-api`

---

### 5. Clean Install & Build Backend

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server

# Fresh dependency install
rm -rf node_modules package-lock.json
npm ci

# Build TypeScript to dist/
npm run build

# Verify dist/ was created
ls -la dist/
```

Checklist:
- [ ] `node_modules` reinstalled cleanly
- [ ] `npm run build` completed without errors
- [ ] `dist/index.js` exists
- [ ] No TypeScript errors in build output

---

### 6. Start Backend with PM2

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website

# Start using CJS config (CommonJS module format)
pm2 start ops/pm2.config.cjs

# Check status
pm2 status

# View logs
pm2 logs thegreentv-api --lines 50
```

Expected logs:
```
[server] listening on :4000
```

Checklist:
- [ ] PM2 shows `thegreentv-api` status: **online**
- [ ] No startup errors in logs
- [ ] Backend listening on port 4000

---

### 7. Build & Deploy Frontend (Vite)

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website

# Clean install
rm -rf node_modules package-lock.json
npm ci

# Build for production (outputs to dist/)
npm run build

# Verify build artifacts
ls -la dist/
```

Checklist:
- [ ] `npm run build` completed without errors
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` contains JS and CSS bundles
- [ ] Build included correct `VITE_API_BASE` from `.env`

---

### 8. Serve Frontend via Nginx

Nginx should already be configured to serve from `/var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/dist`.

```bash
# Verify Nginx root path
sudo nginx -T | grep "root"
```

Expected:
```
root /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/dist;
```

Checklist:
- [ ] Nginx root points to correct dist folder
- [ ] `dist/index.html` is readable by nginx (`ls -la dist/index.html`)

---

## ✅ Validation & Testing

### 9. Backend Health Checks (On Server)

```bash
# Health endpoint
curl -i http://127.0.0.1:4000/healthz
# Expected: HTTP 200, {"status":"ok"}

# Ready endpoint
curl -i http://127.0.0.1:4000/readyz
# Expected: HTTP 200, {"status":"ready","envPath":"..."}

# API route (should preserve /api/v1)
curl -i http://127.0.0.1:4000/api/v1/healthz
# Expected: HTTP 404 (no such route) or if you have this route: 200

# Login endpoint (POST)
curl -i -X POST http://127.0.0.1:4000/api/v1/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"janakar.ganesan@gmail.com","password":"ChangeMe123!"}'
# Expected: HTTP 200, returns {"accessToken":"...","refreshToken":"..."}
# NOT 404, NOT 403 "Email not verified"
```

Checklist:
- [ ] `/healthz` returns 200
- [ ] `/readyz` returns 200
- [ ] `/api/v1/auth/login` POST returns 200 with tokens (not 404, not 403)

---

### 10. Nginx Proxy Validation (On Server)

```bash
# Through Nginx on localhost
curl -i http://127.0.0.1/api/v1/healthz
# Expected: same as backend direct (200 or 404 depending on if you have this route)

curl -i http://127.0.0.1/api/v1/auth/login
# Expected: 405 Method Not Allowed (GET not supported) or 401 if POST

# POST through Nginx
curl -i -X POST http://127.0.0.1/api/v1/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"janakar.ganesan@gmail.com","password":"ChangeMe123!"}'
# Expected: HTTP 200 with tokens

# Live config endpoint (public GET)
curl -i http://127.0.0.1/api/v1/live/config
# Expected: HTTP 200, returns {"streamUrl":"...","title":"..."}
```

**Critical Check:**
- [ ] Nginx passes `/api/v1/auth/login` to backend correctly
- [ ] Backend does NOT see `/v1/...` (prefix stripped) - if you see `"Not found: /v1"` in response, Nginx is still stripping `/api`
- [ ] All responses have status code as expected (200/401/403, NOT 404)

---

### 11. Browser Testing (From Your Machine)

#### Frontend
- [ ] Visit `https://www.thegreentv.com/` → Should load the homepage
- [ ] Visit `http://13.205.72.30/` → Should load the homepage (IP fallback)
- [ ] Check browser console for errors (should be clean)
- [ ] Check Network tab: requests to `/api/v1/*` should return expected status (NOT 404)

#### API Endpoints
Open these in browser or Postman:

- [ ] `https://www.thegreentv.com/api/v1/live/config` (and `http://13.205.72.30/api/v1/live/config`) → Returns JSON with live config
- [ ] `https://www.thegreentv.com/api/v1/videos?limit=10` (and `http://13.205.72.30/api/v1/videos?limit=10`) → Returns videos array
- [ ] `https://www.thegreentv.com/api/v1/podcasts?limit=10` (and `http://13.205.72.30/api/v1/podcasts?limit=10`) → Returns podcasts array
- [ ] `https://www.thegreentv.com/api/v1/articles?limit=10` (and `http://13.205.72.30/api/v1/articles?limit=10`) → Returns articles array
- [ ] `https://www.thegreentv.com/api/v1/tags?kind=category` (and `http://13.205.72.30/api/v1/tags?kind=category`) → Returns tags array

**All should return HTTP 200, NOT 404 "Not found: /v1"**

---

### 12. Login Flow Test (Browser)

1. [ ] Navigate to `https://www.thegreentv.com/` (or `/login` if you have a login page)
  - [ ] Also verify `http://13.205.72.30/`
2. [ ] Open browser DevTools → Network tab
3. [ ] Submit login form with:
   - Email: `janakar.ganesan@gmail.com`
   - Password: `ChangeMe123!`
4. [ ] Observe POST to `/api/v1/auth/login`:
   - [ ] Status: **200 OK**
   - [ ] Response contains `accessToken` and `refreshToken`
   - [ ] NOT 404 "Not found: /v1"
   - [ ] NOT 403 "Email not verified"
5. [ ] User is logged in successfully

---

### 13. Postman Collection Test

Use the Postman collection at `server/postman/backend-api.postman_collection.json`.

Base URL should be: `https://www.thegreentv.com/api/v1`

IP fallback base URL: `http://13.205.72.30/api/v1`

Test sequence:
1. [ ] **POST** `/auth/login` → 200, returns tokens
2. [ ] Copy `accessToken` from response
3. [ ] **GET** `/live/config` (no auth needed) → 200, returns config
4. [ ] **GET** `/videos` (no auth needed) → 200, returns videos
5. [ ] **POST** `/videos` with Bearer token (admin/superadmin only) → 201 or 403 depending on role
6. [ ] **DELETE** `/videos/:id` with Bearer token (superadmin only) → 204 or 403

Checklist:
- [ ] Login works and returns tokens
- [ ] Public endpoints return data
- [ ] Protected endpoints require valid token
- [ ] Role-based permissions enforced

---

## 🔍 Troubleshooting Common Issues

### Issue 1: 404 "Not found: /v1"
**Symptom:** Browser/curl shows `{"error":"Not found: /v1"}` when calling `/api/v1/auth/login`

**Root Cause:** Nginx is stripping the `/api` prefix.

**Fix:**
```bash
sudo nano /etc/nginx/sites-available/default
# Change proxy_pass line to:
proxy_pass http://127.0.0.1:4000$request_uri;

sudo nginx -t && sudo systemctl reload nginx
```

**Verify:**
```bash
curl -i -X POST http://127.0.0.1/api/v1/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# Should NOT see "Not found: /v1"
```

---

### Issue 2: 403 "Email not verified"
**Symptom:** Login returns `{"error":"Email not verified. Please complete verification."}`

**Root Cause:** Seeded users have `emailVerified: false` (if using old seed script).

**Fix Option A (Manual - One-time):**
```bash
mongosh "$MONGODB_URI" --eval 'db.users.updateMany({}, {$set:{emailVerified:true}})'
```

**Fix Option B (Re-seed with updated script):**
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
npm run seed  # Now auto-verifies all seeded users
```

---

### Issue 3: CORS Errors in Browser
**Symptom:** Browser console shows CORS policy errors when calling API.

**Root Cause:** `CORS_ORIGINS` in `server/.env` doesn't include the frontend origin.

**Fix:**
```bash
# In server/.env
CORS_ORIGINS=http://13.205.72.30,http://13.205.72.30:3000
```

Restart backend:
```bash
pm2 restart thegreentv-api
```

---

### Issue 4: Frontend Shows Old/Stale Data
**Symptom:** Changes to backend not reflected in browser.

**Root Cause:** Browser cache or old frontend build.

**Fix:**
```bash
# Rebuild frontend
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website
npm run build

# Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
```

---

### Issue 5: PM2 Process Restarts/Crashes
**Symptom:** `pm2 status` shows restart count > 0 or status: errored.

**Root Cause:** Backend crash (check logs).

**Fix:**
```bash
pm2 logs thegreentv-api --lines 200  # Check for errors
pm2 restart thegreentv-api
```

Common causes:
- [ ] MongoDB connection failed (check `MONGODB_URI`)
- [ ] Missing env var (check all required vars in `server/.env`)
- [ ] Port 4000 already in use (check `sudo netstat -tlnp | grep 4000`)

---

## 📋 Final Sanity Check

Before marking deployment complete:

### Environment Files
- [ ] `server/.env` exists with all required variables
- [ ] Root `.env` exists with `VITE_API_BASE=http://13.205.72.30/api/v1`
- [ ] No typos in URLs (no trailing slashes on base URLs)

### Nginx
- [ ] Config uses `proxy_pass http://127.0.0.1:4000$request_uri`
- [ ] No trailing slash or rewrite stripping `/api`
- [ ] `sudo nginx -t` passes
- [ ] Nginx reloaded after config changes

### Backend
- [ ] `npm run build` succeeded
- [ ] `dist/index.js` exists
- [ ] PM2 shows `thegreentv-api` online
- [ ] Logs show "listening on :4000"
- [ ] No startup errors

### Database
- [ ] MongoDB is running and accessible
- [ ] Seed script ran successfully
- [ ] All seeded users have `emailVerified: true`

### Frontend
- [ ] `npm run build` succeeded
- [ ] `dist/` contains index.html and assets
- [ ] Nginx serves from correct dist path

### API Testing
- [ ] `curl http://127.0.0.1:4000/healthz` → 200
- [ ] `curl -X POST http://127.0.0.1:4000/api/v1/auth/login ...` → 200 (NOT 404)
- [ ] `curl http://127.0.0.1/api/v1/live/config` → 200 (through Nginx)

### Browser Testing
- [ ] `http://13.205.72.30/` loads homepage
- [ ] `http://13.205.72.30/api/v1/live/config` returns JSON (NOT 404)
- [ ] Login form submits successfully and returns tokens
- [ ] No console errors or 404s in Network tab

### Postman Testing
- [ ] All endpoints return expected status codes
- [ ] Auth flow works (login → get token → use token)
- [ ] Role-based permissions enforced

---

## 🎯 Quick Reference Commands

### Check Backend Status
```bash
pm2 status
pm2 logs thegreentv-api --lines 50
curl http://127.0.0.1:4000/healthz
```

### Restart Backend
```bash
pm2 restart thegreentv-api
pm2 logs thegreentv-api
```

### Rebuild & Restart Backend
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website/server
npm run build
pm2 restart thegreentv-api
```

### Rebuild Frontend
```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website
npm run build
# Nginx serves automatically from dist/
```

### Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Check Nginx Config
```bash
sudo nginx -T | grep -A 30 "location /api"
```

### Test Login
```bash
curl -i -X POST http://127.0.0.1:4000/api/v1/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"janakar.ganesan@gmail.com","password":"ChangeMe123!"}'
```

---

## ✨ Success Criteria

Deployment is **complete and validated** when:

1. ✅ Backend PM2 process is online with no errors
2. ✅ Frontend loads in browser at `http://13.205.72.30/`
3. ✅ All API endpoints return expected status (NOT 404)
4. ✅ Login works and returns JWT tokens
5. ✅ Postman collection tests pass
6. ✅ No CORS errors in browser console
7. ✅ Nginx preserves `/api` prefix in proxied requests
8. ✅ Database seeded with test users (all verified)
9. ✅ Environment variables correctly set for production

---

**Last Updated:** 2026-03-26  
**Server IP:** 13.205.72.30  
**Deployment Guide:** See `ops/DEPLOYMENT-EC2.md` for full infrastructure setup
