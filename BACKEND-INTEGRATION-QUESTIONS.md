# Backend Integration Questions

**Date:** March 27, 2026  
**Context:** Frontend integration guide verification  
**Reference:** [FRONTEND_INTEGRATION.md](server/FRONTEND_INTEGRATION.md)

> **✅ UPDATE:** Many questions answered! See [FRONTEND-QUICK-START.md](FRONTEND-QUICK-START.md) for ready-to-use endpoints and code examples based on actual codebase review.

---

## 1. Authentication Endpoints

### `/auth/register`
**Current documentation:**
```typescript
POST /api/v1/auth/register
Body: { email, password, name? }
Response: { message: "Verification code sent..." }
```

**Questions:**
- ✓ Confirm exact response shape - is it `{ message: string }` or does it include other fields?
- ✓ Is `name` truly optional or required?
- ✓ Any password requirements (min length, complexity)?
- ✓ Error responses: what status codes and error formats?

### `/auth/verify-email`
**Current documentation:**
```typescript
POST /api/v1/auth/verify-email
Body: { email, code }
Response: { accessToken, refreshToken }
```

**Questions:**
- ✓ Confirm exact response field names: `accessToken` and `refreshToken` (not `access_token`, `refresh_token`)?
- ✓ Are there any additional fields in response (user object, expiresIn, etc.)?
- ✓ What happens if code is invalid? Status code and error format?
- ✓ Code expiration time?

### `/auth/login`
**Current documentation:**
```typescript
POST /api/v1/auth/login
Body: { email, password }
Response: { accessToken, refreshToken }
Status 403 if email not verified
```

**Questions:**
- ✓ Confirm 403 status specifically for unverified email (vs 401 for wrong credentials)?
- ✓ Response includes just tokens or also user data?
- ✓ Field names confirmed as `accessToken` and `refreshToken`?

### `/auth/refresh`
**Current documentation:**
```typescript
POST /api/v1/auth/refresh
Body: { refreshToken }
Response: { accessToken }
```

**Questions:**
- ✓ Does it return only `accessToken` or also a new `refreshToken`?
- ✓ What status code if refresh token is expired/invalid?
- ✓ Is the old refresh token invalidated after use?

**General Auth Questions:**
- ✓ Are refresh tokens stored httpOnly in cookies or client-side in localStorage?
- ✓ Token expiration times (access & refresh)?
- ✓ Do we need CSRF protection for cookie-based auth?

---

## 2. File Upload (S3 Presigned URLs)

### `/uploads/presign`
**Current documentation:**
```typescript
POST /api/v1/uploads/presign
Body: { prefix: 'videos' | 'podcasts' | 'images' | 'thumbnails', contentType: string }
Response: { url: string, fileUrl: string }
```

**Questions:**
- ✓ Confirm path is `/api/v1/uploads/presign` (not `/api/v1/upload/presign`)?
- ✓ Confirm response keys are exactly `url` and `fileUrl`?
- ✓ What does `url` contain? (presigned S3 upload URL)
- ✓ What does `fileUrl` contain? (permanent public URL for database storage)
- ✓ File size limits per prefix type?
- ✓ Allowed content types per prefix?
- ✓ Presigned URL expiration time?
- ✓ Do we need to pass any ACL or metadata parameters?
- ✓ After uploading to presigned URL, any callback needed or is file immediately accessible?

**S3 Configuration:**
- ✓ Bucket name: `greentv-s3` confirmed?
- ✓ Region: `ap-south-1` confirmed?
- ✓ Public read access configured for uploaded files?
- ✓ CORS configured on S3 bucket for direct uploads from browser?

---

## 3. Media API (Unified Endpoint)

### `GET /media`
**Current documentation:**
```typescript
GET /api/v1/media?page=1&limit=20&search=...&menu=LiveTv&mediaType=video&category=...&status=ready
Response: { data: MediaItem[], meta: { page, limit, total } }
```

**Questions:**
- ✓ Confirm query parameter names exactly as documented?
- ✓ Response shape confirmed: `{ data: [], meta: { page, limit, total } }`?
- ✓ Default pagination values (page=1, limit=20)?
- ✓ Maximum limit allowed?
- ✓ Search behavior: searches which fields (title, description, tags)?

### `POST /media`
**Current documentation:**
```typescript
POST /api/v1/media
Body: {
  title: string,
  description?: string,
  mediaType: 'video' | 'audio',
  menu: 'LiveTv' | 'Podcast',
  category?: string,
  tags?: string[],
  duration?: number,
  fileUrl: string,
  thumbnailUrl?: string,
  status?: 'processing' | 'ready' | 'failed'
}
```

**Questions:**
- ✓ Which fields are truly required vs optional?
- ✓ Is `duration` required for video/audio? (should be required)
- ✓ Is `thumbnailUrl` required for video? (best practice)
- ✓ Does `category` auto-create if not exists, or must exist first?
- ✓ Same for `tags` — auto-create or must exist?
- ✓ Validation: allowed values for `menu` field exactly `'LiveTv'` and `'Podcast'` (case matters)?
- ✓ Default `status` if not provided? (`'ready'` or `'processing'`?)
- ✓ Response: returns created media item with `id` and timestamps?

### `PATCH /media/{id}/status`
**Current documentation:**
```typescript
PATCH /api/v1/media/{id}/status
Body: { 
  status: 'processing' | 'ready' | 'failed',
  fileUrl?: string,
  thumbnailUrl?: string,
  duration?: number
}
```

**Questions:**
- ✓ Confirm this endpoint exists and accepts partial updates?
- ✓ Can we update `fileUrl`, `thumbnailUrl`, `duration` via this endpoint?
- ✓ Or should there be separate `PATCH /media/{id}` for updating metadata?
- ✓ Response: returns updated media item?

### MediaItem Interface
**Questions:**
- ✓ Confirm all fields in `MediaItem` interface match backend model:
  - `id: string` (or number?)
  - `createdAt: string` (ISO 8601 format?)
  - `updatedAt: string` (ISO 8601 format?)
- ✓ Any additional fields not documented (author, views, likes, etc.)?

---

## 4. Dashboard & Analytics

### `/admin/summary` vs `/dashboard/summary`
**Current documentation:** Shows `/api/v1/admin/summary`
**OpenAPI spec:** Need to verify path

**Questions:**
- ✓ Confirm canonical path: `/api/v1/admin/summary` or `/api/v1/dashboard/summary`?
- ✓ Query params `from` and `to`: required or optional?
- ✓ Date format: ISO 8601 string?
- ✓ Response shape matches documentation exactly?
- ✓ What does `trendingPodcastCategory.series[].data` contain? (counts per category?)
- ✓ Same for `trendingArticleCategory`?
- ✓ `usersStatus` fields: what are typical labels (`'active'`, `'inactive'`, etc.)?
- ✓ `recentActivity` is array of Post objects - confirm fields match Post interface?

---

## 5. Notifications

### `GET /notifications`
**Current documentation:**
```typescript
GET /api/v1/notifications?page=1&limit=20&isUnread=true
Response: { data: Notification[], meta: { page, limit, total } }
```

**Questions:**
- ✓ Response shape confirmed as `{ data, meta }`?
- ✓ `isUnread` query param: boolean or string `'true'`/`'false'`?
- ✓ Notification fields match interface exactly?
- ✓ `postedAt` format: ISO 8601?

### `PATCH /notifications/{id}`
**Questions:**
- ✓ Body: `{ isUnread: boolean }` - confirm field name?
- ✓ Response: returns updated notification?

### `PATCH /notifications/read-all`
**Questions:**
- ✓ Confirm path is `/api/v1/notifications/read-all` (not `/notifications/mark-all-read`)?
- ✓ No body required?
- ✓ Response: success message or updated count?

---

## 6. Reference Data (Dropdowns/Filters)

**Current documentation shows inconsistency:**
- Guide examples: `/api/categories`, `/api/menus`, `/api/tags`
- Full path should be: `/api/v1/api/categories` (double `/api`?) or `/api/v1/categories`?

**Questions:**
- ✓ Confirm canonical paths:
  - `/api/v1/categories` vs `/api/v1/api/categories`
  - `/api/v1/menus` vs `/api/v1/api/menus`
  - `/api/v1/tags` vs `/api/v1/api/tags`
- ✓ `/categories` accepts `?type=media|article|post` query param?
- ✓ `/tags` accepts `?type=article|media` query param?
- ✓ Response format: `{ data: string[] }` for all three?
- ✓ Are categories/tags returned in any particular order (alphabetical, most used)?

---

## 7. Blog Posts

### `GET /posts`
**Questions:**
- ✓ Path confirmed: `/api/v1/posts`?
- ✓ `sort` param values: `'latest' | 'popular' | 'oldest'` - what's default?
- ✓ How is `'popular'` determined (views, likes, comments)?
- ✓ Post interface fields match backend exactly?
- ✓ `author.avatarUrl` - is this optional or always present?

---

## 8. User Management

### `GET /users`
**Questions:**
- ✓ Confirm pagination params: `page` and `pageSize` (not `limit`)?
- ✓ Response shape: `{ data, meta }` or different?
- ✓ What user fields are returned?

### `PATCH /users/{userId}/status`
**Questions:**
- ✓ Confirm path uses `userId` in URL?
- ✓ Status values: exactly `'active'` and `'inactive'` (no other values)?
- ✓ Response: returns updated user?

---

## 9. CORS Configuration

**Critical for deployment:**

**Questions:**
- ✓ Final list of allowed origins for:
  - **Development:** `http://localhost:5173`, `http://localhost:3000`, others?
  - **Staging:** URLs?
  - **Production:** `https://www.thegreentv.com`, `http://13.205.72.30`, others?
- ✓ Are refresh tokens stored in httpOnly cookies or localStorage?
  - If cookies: cookie domain, path, sameSite, secure settings?
  - If localStorage: how to handle token refresh?
- ✓ CORS credentials setting: `credentials: true` confirmed on backend?
- ✓ Preflight requests: all endpoints handle OPTIONS correctly?
- ✓ Allowed headers: `Authorization`, `Content-Type`, others?
- ✓ Exposed headers: any custom headers we need to read client-side?

---

## 10. Error Handling

**Questions:**
- ✓ Standard error response format across all endpoints:
  ```json
  { "error": "Error message" }
  ```
  or different (e.g., `{ "message": "...", "code": "..." }`)?
- ✓ Status codes used:
  - 400: Bad request / validation errors?
  - 401: Unauthorized / missing token?
  - 403: Forbidden / insufficient permissions or unverified email?
  - 404: Not found?
  - 409: Conflict (e.g., duplicate email)?
  - 429: Rate limit exceeded?
  - 500: Server error?
- ✓ Validation errors: field-specific errors returned? Format?

---

## 11. Rate Limiting

**Current ENV example:** 
```
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=200          # 200 requests
```

**Questions:**
- ✓ Confirm rate limits for:
  - Authentication endpoints (separate limit?)
  - Upload endpoints (separate limit?)
  - General API endpoints
- ✓ Rate limit headers returned (`X-RateLimit-*`)?
- ✓ Error response when rate limited (status 429)?

---

## 12. Legacy Endpoints (Deprecation)

**Questions:**
- ✓ Timeline for deprecating `/api/v1/videos` and `/api/v1/podcasts`?
- ✓ Should frontend show deprecation warnings when using old endpoints?
- ✓ Are old endpoints still fully functional or limited?
- ✓ Do they return same data structure as `/media` endpoint?

---

## 13. OpenAPI Specification

**Questions:**
- ✓ Is `server/openapi.yaml` up to date with current implementation?
- ✓ Can frontend team import into Postman/Insomnia for testing?
- ✓ Any endpoints in openapi.yaml not in integration guide (or vice versa)?
- ✓ Request/response examples in spec match actual responses?

---

## 14. Testing & Development

**Questions:**
- ✓ Test user credentials for development:
  - Admin: email, password, role
  - Editor: email, password, role
  - Regular user: email, password
- ✓ Test data available in dev database?
- ✓ Mock S3 setup for local development or use actual S3?
- ✓ Development environment URLs:
  - Backend API: `http://localhost:4000`?
  - Database: connection string?
  - S3: dev bucket or prod bucket?

---

## 15. Security

**Questions:**
- ✓ JWT signing algorithm (HS256, RS256)?
- ✓ Token payload: what fields included (userId, role, permissions)?
- ✓ Role-based access control: what roles exist (admin, editor, user)?
- ✓ Which endpoints require authentication vs public?
- ✓ XSS protection: response headers configured?
- ✓ SQL injection: using parameterized queries?
- ✓ File upload security: virus scanning, file type validation?

---

## Priority Questions (Answer First!)

**CRITICAL for frontend development to proceed:**

1. **Auth response fields:** Confirm exact field names (`accessToken` vs `access_token`)
2. **CORS setup:** Final origins list for current environment
3. **Upload flow:** Exact request/response for `/uploads/presign`
4. **Media creation:** Required vs optional fields
5. **Reference data paths:** Correct routes for categories/menus/tags
6. **Error format:** Standard error response structure

**MEDIUM priority:**
- Dashboard summary path and response shape
- Notification endpoints exact behavior
- Rate limiting configuration

**LOW priority (can clarify later):**
- Test credentials
- Deprecation timeline
- OpenAPI spec verification

---

## ✅ ANSWERS (Based on Code Review - March 27, 2026)

### 1. Authentication Endpoints ✅

✅ **Confirmed from `server/src/routes/auth.ts`:**

**POST `/auth/register`:**
- Response: `{ message: "Verification code sent to email. Please verify before logging in." }` (202 Accepted)
- Fields: `email` (required), `password` (required, min 8 chars), `name` (optional)

**POST `/auth/verify-email`:**
- Response: `{ accessToken: string, refreshToken: string }`
- Field names confirmed: `accessToken` and `refreshToken` (camelCase)

**POST `/auth/login`:**
- Response: `{ accessToken: string, refreshToken: string }`
- Status 403 if email not verified: `{ error: "Email not verified. Please complete verification." }`
- Status 401 for wrong credentials: `{ error: "Invalid credentials" }`

**POST `/auth/refresh`:**
- Response: `{ accessToken: string }` (only returns new access token, NOT new refresh token)
- Old refresh token is NOT invalidated

**Token Storage:**
- Client-side in localStorage (NOT httpOnly cookies)
- Frontend responsible for storing tokens
- Refresh token: random UUID, stored in database

### 2. Dashboard Summary ✅

✅ **Confirmed from `server/src/routes/admin.ts`:**

**Path:** `/api/v1/admin/summary` (NOT `/dashboard/summary`)

**Query Params (both optional):**
- `from`: ISO 8601 date string (default: 30 days ago)
- `to`: ISO 8601 date string (default: now)

**Response structure confirmed:**
```json
{
  "metrics": {
    "numberOfVideo": number,
    "totalUsers": number,
    "onlineUsers": number,
    "totalPodcasts": number
  },
  "trendingPodcastCategory": {
    "categories": string[],
    "series": [{ "name": string, "data": number[] }]
  },
  "trendingArticleCategory": {
    "categories": string[],
    "series": [{ "name": string, "data": number[] }]
  },
  "usersStatus": [
    { "label": "Active" | "Inactive", "value": number }
  ],
  "recentActivity": Post[]
}
```

**Required Role:** `superadmin`, `admin`, or `editor`

### 3. Notifications ✅

✅ **Confirmed from `server/src/routes/notifications.ts`:**

**GET `/notifications`:**
- Response: `{ data: Notification[], meta: { page, limit, total } }`
- Query param `isUnread`: string `"true"` or `"false"` (compared with `===`)
- Notification fields: `id`, `title`, `description`, `avatarUrl`, `type`, `postedAt`, `isUnread`

**PATCH `/notifications/{id}`:**
- Body: `{ isUnread: boolean }`
- Response: Returns updated notification object

**PATCH `/notifications/read-all`:**
- Path confirmed: `/api/v1/notifications/read-all`
- No body required
- Response: 204 No Content (empty response)

**Required Role:** Any authenticated user

### 4. Posts/Blog ✅

✅ **Confirmed from `server/src/routes/posts.ts`:**

**GET `/posts`:**
- Path: `/api/v1/posts`
- Response: `{ data: Post[], meta: { page, limit, total } }`
- Query params: `page`, `limit`, `search`, `category`, `sort`
- Sort values: `"latest"` (default), `"popular"`, `"oldest"`
- Popular = sorted by `totalViews` descending

**POST `/posts`:**
- Required fields: `title`, `description`, `coverUrl`, `author.name`
- Optional fields: `totalViews`, `totalComments`, `totalShares`, `totalFavorites`, `postedAt`, `author.avatarUrl`
- Required role: `superadmin`, `admin`, or `editor`

### 5. Users ✅

✅ **Confirmed from `server/src/routes/users.ts`:**

**GET `/users`:**
- Response: `{ items: User[], total: number, page: number, pageSize: number }`
- Query params: `page`, `pageSize` (⚠️ NOT `limit`!)
- Default: page=1, pageSize=20

**PATCH `/users/{userId}/status`:**
- ⚠️ **ISSUE:** Route doesn't exist in code!
- Available: `PUT /users/{id}` for full updates (includes status)
- Body for PUT: `{ status?: "active" | "inactive", name?: string, role?: string, password?: string }`

**Required Role:** `superadmin` or `admin`

### 6. Articles ✅

✅ **Confirmed from `server/src/routes/articles.ts`:**

**GET `/articles`:**
- Response: `{ items: Article[], total: number, page: number, pageSize: number }`
- Query params: `page`, `pageSize` (⚠️ NOT `limit`!), `tag`, `featured`, `status`, `search`
- Default: page=1, pageSize=20

**POST `/articles`:**
- Required fields: `title`
- Optional fields: `subtitle`, `bodyMd`, `readTime`, `coverImage`, `publishDate`, `status`, `featured`, `tags`
- Defaults: `bodyMd=""`, `status="published"`, `featured=false`, `tags=[]`

**PUT `/articles/{id}`:**
- All fields optional (partial update)

**Required Role for POST/PUT:** `superadmin`, `admin`, or `editor`

### 7. Reference Data Paths ✅

✅ **Confirmed from `server/src/routes/index.ts`:**

**Routes mounted under `/api`:**
- `/api/v1/api/categories` ⚠️ (yes, double `/api`)
- `/api/v1/api/menus`
- `/api/v1/api/tags`

**Why double `/api`?**
- Base path: `/api/v1/`
- Reference router: `router.use("/api", reference)`
- Results in: `/api/v1/api/*`

### 8. CORS Configuration ✅

✅ **Confirmed from `server/src/index.ts` and `server/src/config/env.ts`:**

**Backend CORS setup:**
```typescript
cors({
  origin: env.corsOrigins.includes("*") ? true : env.corsOrigins,
  credentials: true,
})
```

**CORS_ORIGINS parsed as:**
- Split by comma
- Trimmed
- Array of strings
- Supports `"*"` wildcard (though not recommended with credentials)

**Current `.env` configured for:**
- Development: `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000`
- Production: Update to actual domain

### 9. Error Format ✅

✅ **Confirmed standard format:**

**Error responses:**
```json
{ "error": "Error message string" }
```

**Validation errors (from Zod):**
```json
{ "error": { "fieldErrors": {...}, "formErrors": [...] } }
```

**Status codes:**
- 400: Bad request / validation errors
- 401: Unauthorized / missing or invalid token
- 403: Forbidden (email not verified or insufficient role)
- 404: Not found
- 409: Conflict (e.g., email already registered)
- 500: Server error

---

## Response Template for Backend Team

Please copy and fill in:

```markdown
## 1. Authentication ✅ CONFIRMED
- /auth/register response: { message: "Verification code sent..." } (202)
- /auth/verify-email response: { accessToken, refreshToken }
- /auth/login response: { accessToken, refreshToken }
- /auth/refresh response: { accessToken } (only access, not refresh)
- Token storage: Client-side localStorage
- Token expiration: access=___ (TODO: specify), refresh=___ (TODO: specify)

## 2. File Upload ⚠️ TODO
- Path: /api/v1/uploads/presign ✅
- Response: { url: "...", fileUrl: "..." } ✅
- Size limits: videos=___ MB, podcasts=___ MB, images=___ MB
- Presigned URL TTL: ___ seconds

## 3. Media API ⚠️ TODO
- Required fields for POST /media: title, mediaType, menu, fileUrl
- Optional fields: description, category, tags, duration, thumbnailUrl, status
- Default status: "ready" or "processing"?
- Response shape: { data: [...], meta: {...} } ✅

## 4. Reference Data Paths ✅ CONFIRMED
- Categories: /api/v1/api/categories (double /api intentional)
- Menus: /api/v1/api/menus
- Tags: /api/v1/api/tags

## 5. CORS Origins ✅ CONFIGURED
- Development: http://localhost:5173,http://localhost:3000
- Production: TODO: update server/.env with production domains

## 6. Error Format ✅ CONFIRMED
- Standard: { "error": "..." }
- Validation: { "error": { "fieldErrors": {...}, "formErrors": [...] } }

## 7. Other Clarifications
- ⚠️ PATCH /users/{id}/status doesn't exist - use PUT /users/{id} instead
- ⚠️ Reference data has double /api in path (/api/v1/api/categories)
- ⚠️ Some endpoints use "limit", others use "pageSize" for pagination
- ⚠️ Token expiration times not documented - need to specify
- ⚠️ File upload size limits not specified
```

---

## Next Steps

1. **Backend team:** Please review and respond to questions above
2. **Frontend team:** Block on CRITICAL questions, proceed with MEDIUM/LOW as info available
3. **Schedule:** Follow-up sync meeting if needed to clarify remaining questions

---

**Document Owner:** Frontend Integration Team  
**Requires Response From:** Backend/API Team  
**Target Response Date:** ___ (please specify)
