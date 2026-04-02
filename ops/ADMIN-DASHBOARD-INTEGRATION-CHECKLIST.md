# Admin Dashboard Integration Checklist

This document explains what must change so that admin users are routed to the separate dashboard frontend instead of the embedded dashboard inside the public website.

It is written for three teams:

- Public frontend team (`www.thegreentv.com`)
- Dashboard frontend team (`dashboard.thegreentv.com`)
- Backend/API team

## Current Constraint

The current auth flow stores `accessToken` and `refreshToken` in `localStorage`.

That means login state is scoped per origin:

- `https://www.thegreentv.com` localStorage is separate from
- `https://dashboard.thegreentv.com` localStorage

Because of that, **admin users must not log in on the public website and then be redirected to the dashboard expecting the token to carry over**.

The correct flow is:

1. User clicks `Admin` on the public site
2. Public site redirects to the dashboard URL
3. User logs in on the dashboard frontend
4. Dashboard frontend stores tokens under the dashboard origin
5. Dashboard frontend calls the same backend API

## Recommended Target Flow

### Public website

- `Admin` button should redirect to `https://dashboard.thegreentv.com/login`
- Public site should not try to complete admin login locally
- Public site can keep user-facing login for normal viewers if needed

### Dashboard frontend

- Own login page
- Own token storage in dashboard domain localStorage
- Own refresh-token flow
- Own logout flow
- Uses the same backend auth APIs

### Backend

- Continue serving a single auth system
- Allow both public-site origin and dashboard origin in CORS
- Support a dedicated dashboard URL for reset/login links
- Return user and app-target metadata from auth responses so frontends do not hardcode role routing
- Expose a current-user endpoint for dashboard bootstrap

## Environment Variables

## Public Frontend Team

Add these values to the public website frontend env.

Example:

```env
VITE_API_BASE=https://www.thegreentv.com/api/v1
VITE_DASHBOARD_URL=https://dashboard.thegreentv.com
```

Required meaning:

- `VITE_API_BASE`: existing backend API base for the public site
- `VITE_DASHBOARD_URL`: target dashboard URL used when admin users click `Admin`

## Dashboard Frontend Team

Add these values to the dashboard frontend env.

Preferred same-origin API setup behind Nginx:

```env
VITE_API_BASE_URL=/api/v1
VITE_PUBLIC_SITE_URL=https://www.thegreentv.com
VITE_DASHBOARD_URL=https://dashboard.thegreentv.com
```

If the dashboard repo uses different env names, use the actual names referenced by that repo's code.

Required meaning:

- `VITE_API_BASE_URL` or equivalent: backend API base
- `VITE_PUBLIC_SITE_URL`: optional link back to the main site
- `VITE_DASHBOARD_URL`: optional absolute dashboard base URL

## Backend Team

Add or confirm these values in `server/.env`.

```env
APP_URL=https://www.thegreentv.com
CORS_ORIGINS=https://www.thegreentv.com,https://dashboard.thegreentv.com,http://13.205.72.30,https://13.205.72.30
```

Required addition if password reset and admin auth links should open on the dashboard:

```env
DASHBOARD_URL=https://dashboard.thegreentv.com
```

Notes:

- `APP_URL` is currently used by the backend when it creates reset links
- Backend now supports `DASHBOARD_URL` for admin/editor-facing reset links
- Frontends can also pass `{ app: "dashboard" }` or `{ app: "public" }` to `POST /auth/request-reset`

## Public Frontend Team Checklist

### Routing and navigation

- Add a dashboard URL env var: `VITE_DASHBOARD_URL`
- Update the `Admin` navigation action to redirect to the dashboard frontend instead of rendering the local embedded admin screen
- Redirect target should be `https://dashboard.thegreentv.com/login`

### Login flow

- Do not perform admin login on the public site and then redirect to the dashboard
- Do not rely on `localStorage` tokens from the public site being visible on the dashboard domain
- Keep normal viewer login flow on the public site only if the product still needs it

### Existing code areas to review

- `src/App.tsx`
- `src/pages/Login/Login.tsx`
- Header/admin navigation links
- Any `/admin` route handling in the public site

### Recommended implementation

- If user chooses dashboard/admin access, use `window.location.href = ${VITE_DASHBOARD_URL}/login`
- Optionally replace the embedded `AdminDashboard` route with a redirect screen if you no longer want admin UI inside the public site

## Dashboard Frontend Team Checklist

### Authentication

- Build a dedicated login screen in the dashboard repo
- Use the same backend endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/request-reset`
  - `POST /api/v1/auth/reset`
- Store `accessToken` and `refreshToken` in dashboard localStorage
- Decode token or inspect protected API responses to determine admin/editor access
- If token is expired, refresh silently
- If refresh fails, send the user back to dashboard login

### API migration

- Do not use deprecated endpoints:
  - `/api/v1/videos`
  - `/api/v1/podcasts`
- Use current endpoints:
  - `/api/v1/home`
  - `/api/v1/media?menu=LiveTv&mediaType=video`
  - `/api/v1/media?menu=Podcast&mediaType=audio`
  - `/api/v1/articles`
  - `/api/v1/api/categories?type=media`
  - or `/api/v1/media/categories`

### Response shape checks

- The `/media` endpoint returns paginated data in a `data` field, not the old direct-array format
- Update API adapters so the dashboard reads the actual response shape from the current backend

### Category handling

- Use the shared category API instead of hardcoded categories
- Keep category naming identical across videos, podcasts, and articles

### Dashboard deployment checks

- Use `.env.production`
- Build static files with `npm run build`
- Deploy to `/var/www/dashboard/GreenTvDashboard`
- Serve through Nginx on `dashboard.thegreentv.com`

## Backend Team Checklist

### CORS

- Add `https://dashboard.thegreentv.com` to `CORS_ORIGINS`
- Restart PM2 after env changes

### Auth API

- Keep the existing auth endpoints stable for both frontends
- Login and verify-email responses now return:
  - `accessToken`
  - `refreshToken`
  - `user`
  - `app`
- Refresh now returns:
  - `accessToken`
  - `user`
  - `app`
- `GET /api/v1/auth/me` is available for dashboard bootstrap
- Ensure refresh/logout/reset endpoints remain enabled for dashboard frontend use

### Password reset and email links

- Current reset links use `APP_URL`
- Decide whether admin reset emails should land on:
  - public site reset page, or
  - dashboard reset page
- If dashboard reset is required, add `DASHBOARD_URL` support in backend auth mailer/reset link generation

### Origin and proxy checks

- Confirm Nginx proxies dashboard `/api/` traffic to `127.0.0.1:4000`
- Confirm backend logs show requests coming from `dashboard.thegreentv.com`

### Security checks

- Confirm admin/editor routes still require JWT auth and role checks
- Confirm token refresh/logout logic works for dashboard origin as well

## Joint Verification Checklist

After deployment, all teams should verify the following end to end:

1. Clicking `Admin` on `www.thegreentv.com` opens `https://dashboard.thegreentv.com/login`
2. Admin login works from the dashboard frontend
3. Dashboard stores tokens on the dashboard domain only
4. Protected dashboard pages reload correctly after refresh
5. Token expiry triggers refresh, not a broken session
6. Failed refresh sends the user back to dashboard login
7. Dashboard API requests hit `/api/v1/...` through Nginx
8. No CORS errors appear in the browser console
9. Dashboard uses current `/media` endpoints instead of deprecated `/videos` and `/podcasts`
10. Password reset opens the intended frontend domain

## PM2 and Nginx Commands

### Backend restart

```bash
cd /var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website
pm2 list
pm2 restart thegreentv-api
```

### Nginx verify and reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Useful logs

```bash
pm2 logs thegreentv-api
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Final Recommendation

For the current architecture, the safest and cleanest approach is:

1. Public site redirects admins to the separate dashboard frontend
2. Dashboard frontend performs its own login using the same backend auth APIs
3. Backend allows both origins and serves the same auth system to both apps

Do not attempt token handoff between `www.thegreentv.com` and `dashboard.thegreentv.com` using localStorage. That will not work reliably because the origins are different.