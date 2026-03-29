# CORS Troubleshooting Guide - Podcast APIs

## Issue: CORS Errors on Podcast API Requests

### Common CORS Error Messages

```
Access to fetch at 'https://www.thegreentv.com/api/v1/podcasts' from origin 'http://localhost:5173' has been blocked by CORS policy
```

OR

```
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header
```

---

## Root Causes & Solutions

### 1. ✅ Backend CORS Configuration (Already Correct)

Your backend (`server/src/index.ts`) already has CORS properly configured:

```typescript
app.use(cors({
  origin: env.corsOrigins.includes("*") ? true : env.corsOrigins,
  credentials: true,
}));
```

This allows:
- ✅ Credentials (cookies, auth headers)
- ✅ Multiple origins from CORS_ORIGINS env variable

---

## 🔧 SOLUTION: Configure server/.env

### Problem

The `server/.env` file doesn't exist or has incorrect CORS_ORIGINS configuration.

### Fix: Create/Update server/.env

**For Development (localhost):**
```bash
cd server
cat > .env << 'EOF'
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/zthorbit
JWT_SECRET=dev-secret-at-least-32-characters-long-12345
JWT_REFRESH_SECRET=dev-refresh-secret-at-least-32-chars-678

# ⭐ CORS Configuration for Development
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000

# S3 Configuration
S3_REGION=ap-south-1
S3_BUCKET=greentv-s3
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key

# Live Streaming
LIVE_ACCESS_MODE=s3_playlist
LIVE_S3_FOLDER=LiveTV

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=greentvsupport@gmail.com
SMTP_PASS=your-smtp-password
SMTP_FROM="Green TV Support <greentvsupport@gmail.com>"

SEED_DEFAULT_PASSWORD=ChangeMe123!
EOF
```

**For Production (EC2 deployment):**
```bash
cd server
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/zthorbit
JWT_SECRET=production-secret-min-32-chars-CHANGE-THIS-12345
JWT_REFRESH_SECRET=production-refresh-secret-min-32-chars-67890

# ⭐ CORS Configuration for Production
APP_URL=https://www.thegreentv.com
CORS_ORIGINS=https://www.thegreentv.com,http://13.205.72.30,https://13.205.72.30,http://13.205.72.30:3000

# ... rest of config same as above
S3_REGION=ap-south-1
S3_BUCKET=greentv-s3
S3_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_ACCESS_KEY=your-actual-secret-key

LIVE_ACCESS_MODE=s3_playlist
LIVE_S3_FOLDER=LiveTV

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=greentvsupport@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Green TV Support <greentvsupport@gmail.com>"

SEED_DEFAULT_PASSWORD=ChangeMe123!
EOF
```

---

## ⚡ Quick Fix Steps

### Step 1: Stop Backend Server
```bash
# If using PM2
pm2 stop zthorbit-backend

# Or press Ctrl+C if running in terminal
```

### Step 2: Create server/.env with CORS_ORIGINS
```bash
cd server
# Copy the appropriate config from above into .env
nano .env
# Or use notepad/VS Code
```

### Step 3: Verify CORS_ORIGINS
```bash
cat server/.env | grep CORS_ORIGINS
# Should show: CORS_ORIGINS=http://localhost:5173,http://localhost:3000...
```

### Step 4: Restart Backend
```bash
cd server
npm run build
npm start
# Or: pm2 restart zthorbit-backend
```

### Step 5: Check Backend Logs
```bash
# Should see your origin in the allowed list
pm2 logs zthorbit-backend --lines 50
```

---

## 🔍 Verify CORS is Working

### Test with curl
```bash
# Test preflight (OPTIONS) request
curl -X OPTIONS https://www.thegreentv.com/api/v1/podcasts \
  -H "Origin: https://www.thegreentv.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# Should include:
# < Access-Control-Allow-Origin: https://www.thegreentv.com
# < Access-Control-Allow-Credentials: true
```

### Test in Browser Console
```javascript
// Open browser console (F12) and run:
fetch('http://localhost:4000/api/v1/podcasts', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ CORS working:', data))
.catch(err => console.error('❌ CORS error:', err));
```

---

## 🚨 Common Mistakes

### ❌ WRONG: Using wildcard (*) with credentials
```bash
# This will FAIL:
CORS_ORIGINS=*  # Doesn't work with credentials: true
```

**Why it fails:** Browsers don't allow `Access-Control-Allow-Origin: *` when `credentials: true`.

**Fix:** List specific origins:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### ❌ WRONG: Missing frontend origin
```bash
# If frontend is on localhost:5173, but you only have:
CORS_ORIGINS=http://localhost:3000
# 5173 will be blocked!
```

**Fix:** Add all frontend URLs:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### ❌ WRONG: Protocol mismatch
```bash
# Frontend on HTTPS, backend on HTTP (or vice versa)
CORS_ORIGINS=http://www.thegreentv.com  # Frontend actually uses https://
```

**Fix:** Match protocols exactly:
```bash
CORS_ORIGINS=https://www.thegreentv.com
```

### ❌ WRONG: Port mismatch
```bash
CORS_ORIGINS=http://localhost:3000  # But Vite runs on 5173!
```

**Fix:** Include the correct port:
```bash
CORS_ORIGINS=http://localhost:5173
```

---

## 🔧 Additional Checks

### 1. Check Frontend .env
```bash
cat .env | grep VITE_API_BASE
# Should be: VITE_API_BASE=http://localhost:4000/api/v1
# Or production: VITE_API_BASE=https://www.thegreentv.com/api/v1
```

### 2. Check Nginx (if deployed)
If using Nginx as reverse proxy, ensure it's not stripping CORS headers:

```nginx
# In nginx.conf
location /api/ {
    proxy_pass http://localhost:4000;
    
    # Don't override CORS headers - let Express handle them
    # proxy_hide_header Access-Control-Allow-Origin;
    
    # Preserve original request headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Check Browser
Clear browser cache and cookies:
```
Chrome: Ctrl+Shift+Delete > Clear browsing data
Firefox: Ctrl+Shift+Delete > Clear history
```

Or open in Incognito/Private mode.

---

## 🐛 Debugging Steps

### 1. Check what origin browser is sending
Open browser DevTools (F12) → Network tab → Click failed request → Headers:
```
Request Headers:
  Origin: http://localhost:5173
```

### 2. Check what backend received
Look at backend logs - add temporary debug logging:

```typescript
// In server/src/index.ts, add before cors():
app.use((req, res, next) => {
  console.log('[CORS DEBUG] Origin:', req.headers.origin);
  console.log('[CORS DEBUG] Method:', req.method);
  next();
});
```

Restart backend and check logs when you make the request.

### 3. Check CORS response headers
In browser Network tab → Response Headers:
```
Should see:
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Credentials: true
```

---

## ✅ Final Checklist

- [ ] `server/.env` file exists
- [ ] `CORS_ORIGINS` includes your frontend URL (with correct protocol & port)
- [ ] No wildcard (*) when using credentials
- [ ] Backend server restarted after changing .env
- [ ] Frontend .env has correct `VITE_API_BASE`
- [ ] Browser cache cleared or using Incognito
- [ ] Check Network tab - OPTIONS request succeeds
- [ ] Check Network tab - GET/POST request succeeds

---

## 🎯 Still Not Working?

### Enable Verbose CORS Logging

Add to `server/src/index.ts`:
```typescript
import cors from "cors";

app.use(cors({
  origin: function(origin, callback) {
    console.log('[CORS] Request from origin:', origin);
    console.log('[CORS] Allowed origins:', env.corsOrigins);
    
    if (!origin) {
      console.log('[CORS] No origin (same-origin), allowing');
      return callback(null, true);
    }
    
    if (env.corsOrigins.includes("*")) {
      console.log('[CORS] Wildcard allowed');
      return callback(null, true);
    }
    
    if (env.corsOrigins.includes(origin)) {
      console.log('[CORS] Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.error('[CORS] Origin BLOCKED:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

This will show you exactly why requests are being blocked.

---

## 📞 Summary

**Most likely cause:** Missing or incorrect `CORS_ORIGINS` in `server/.env`

**Quick fix:**
1. Create `server/.env` with proper `CORS_ORIGINS`
2. Restart backend: `pm2 restart zthorbit-backend`
3. Test in browser

**Key points:**
- Must include exact frontend URL (protocol + domain + port)
- No wildcard with credentials
- Backend must be restarted after changes

---

**Last Updated:** March 27, 2026
