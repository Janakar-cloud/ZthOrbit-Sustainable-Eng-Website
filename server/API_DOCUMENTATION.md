# ZthOrbit Backend API Documentation

**Base URL:** `http://your-domain.com/api` (or your configured API base)

**Authentication:** Most write operations require a JWT access token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## 🚀 Migration Guide: Videos & Podcasts → Unified Media

### Why Migrate?

The new unified `/media` endpoint provides:
- ✅ Single endpoint for videos + podcasts (simpler API surface)
- ✅ Better filtering with `menu` (LiveTv/Podcast) and `mediaType` (video/audio)
- ✅ Processing status tracking (`processing` → `ready` / `failed`)
- ✅ Encoder callback support via `PATCH /media/:id/status`
- ✅ Consistent response format with pagination metadata

### Migration Mapping

| Legacy Endpoint | New Unified Endpoint | Notes |
|----------------|----------------------|-------|
| `GET /videos` | `GET /media?menu=LiveTv&mediaType=video` | Add menu + mediaType filters |
| `GET /videos?tag=tech` | `GET /media?menu=LiveTv&mediaType=video&category=tech` | Use `category` param |
| `POST /videos` | `POST /media` | Set `"menu": "LiveTv", "mediaType": "video"` |
| `PUT /videos/:id` | `PUT /media/:id` | Same payload structure |
| `DELETE /videos/:id` | `DELETE /media/:id` | Direct replacement |
| `GET /podcasts` | `GET /media?menu=Podcast&mediaType=audio` | Add menu + mediaType filters |
| `POST /podcasts` | `POST /media` | Set `"menu": "Podcast", "mediaType": "audio"` |
| `PUT /podcasts/:id` | `PUT /media/:id` | Same payload structure |
| `DELETE /podcasts/:id` | `DELETE /media/:id` | Direct replacement |

### Example Migration

**Before (Legacy):**
```javascript
// Fetch videos
const videos = await fetch('/api/videos?tag=climate');

// Fetch podcasts
const podcasts = await fetch('/api/podcasts?search=tech');
```

**After (Unified):**
```javascript
// Fetch videos
const videos = await fetch('/api/media?menu=LiveTv&mediaType=video&category=climate');

// Fetch podcasts  
const podcasts = await fetch('/api/media?menu=Podcast&mediaType=audio&search=tech');

// Or fetch both at once!
const allMedia = await fetch('/api/media?search=climate');
```

### Timeline
- ✅ **v1.x** - Both legacy and unified endpoints available
- ⚠️ **v2.0** - Legacy endpoints (`/videos`, `/podcasts`) will be removed

---

## 🛠 Dashboard API Quick Reference (Frontend)

Use these for admin upload/edit flows. All write routes need `Authorization: Bearer <accessToken>` with role `superadmin`/`admin`/`editor` as noted.

### Uploads (presigned S3)
- POST `/uploads/presign` (superadmin/admin/editor)
  - Body: `{ "prefix": "Thumbnail/videos/filename.jpg", "contentType": "image/jpeg" }`
  - Returns: presigned URL/fields; `PUT`/form upload file, then store the resulting S3 URL in create/update payloads.

### Categories (tags)
- GET `/tags?kind=category` → use for category dropdowns. Each returned tag `_id` goes into `tags: ["<id>"]` in create/update payloads.

### Media (preferred for videos + podcasts)
- GET `/media?menu=LiveTv&mediaType=video&category=<tagId>&page=1&limit=50` (videos)
- GET `/media?menu=Podcast&mediaType=audio&category=<tagId>&page=1&limit=50` (podcasts)
- POST `/media` (superadmin/admin/editor)
  - Body (video example): `{ "title","description","menu":"LiveTv","mediaType":"video","streamUrl","thumbnailUrl","tags":["<tagId>"],"status":"published","publishDate":"2026-03-01","seriesId":"series-key","partNumber":1,"partTitle":"Part 1" }`
  - Body (podcast example): same but `menu:"Podcast"`, `mediaType:"audio"`, `fileUrl` (or `audioUrl` if using legacy), `thumbnailUrl`.
- PUT `/media/:id` (superadmin/admin/editor) → partial update, same fields as POST.
- DELETE `/media/:id` (superadmin) → remove item.

### Legacy Videos (if still used)
- POST `/videos` / PUT `/videos/:id` accept `seriesId`, `partNumber`, `partTitle`, `thumbnailUrl`, `streamUrl`, `tags`, `status`, `publishDate`.

### Articles
- GET `/articles` (supports `status`, paging)
- POST `/articles` (superadmin/admin/editor)
  - Body: `{ "title","subtitle","bodyMd","coverImage","tags":["<tagId>"],"status":"published","publishDate":"2026-01-15","readTime":"8 min","featured":true }`
  - For docx content, set `bodyMd` to include the doc URL (frontend embeds via Office viewer).
- PUT `/articles/:id` (superadmin/admin/editor) → partial update.
- PATCH `/articles/:id/status` → `{ "status": "published" | "draft" }`
- DELETE `/articles/:id` (superadmin/admin)

### Podcast Comments (with replies)
- GET `/podcasts/:id/comments` → visible comments, sorted oldest-first.
- POST `/podcasts/:id/comments` → `{ "author", "message", "parentCommentId"? }` (any user). If `parentCommentId` is set, it must belong to the same podcast.
- GET `/podcasts/:id/comments/all` (superadmin/admin/editor) → includes hidden.
- PATCH `/podcasts/:podcastId/comments/:commentId/status` (superadmin/admin/editor) → `{ "status": "visible" | "hidden" }`.
- DELETE `/podcasts/:podcastId/comments/:commentId` (superadmin/admin).

### Admin auth basics
- POST `/auth/login` → store `accessToken` and send as `Authorization: Bearer <token>` for the above write routes.

## Authentication & Authorization

### POST `/auth/register`
Register a new user and send email verification code.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Verification code sent to email. Please verify before logging in."
}
```

**Error Codes:**
- `400` - Validation error (invalid email, password too short < 8 chars)
- `400` - Email already registered

---

### POST `/auth/verify-email`
Verify email with 6-digit code sent during registration.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "name": "Admin User"
  },
  "app": {
    "publicUrl": "https://www.thegreentv.com",
    "dashboardUrl": "https://dashboard.thegreentv.com",
    "preferredUrl": "https://dashboard.thegreentv.com",
    "shouldUseDashboard": true,
    "dashboardLoginUrl": "https://dashboard.thegreentv.com/login",
    "publicLoginUrl": "https://www.thegreentv.com/login"
  }
}
```

**Error Codes:**
- `400` - Validation error (invalid email, code not 6 digits)
- `404` - User not found
- `400` - Invalid or expired code

---

### POST `/auth/resend-verification`
Resend verification code to email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Verification code resent"
}
```

**Error Codes:**
- `400` - Validation error (invalid email)
- `404` - User not found

---

### POST `/auth/login`
Login with email and password. Email must be verified first.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "viewer",
    "name": "User"
  },
  "app": {
    "publicUrl": "https://www.thegreentv.com",
    "dashboardUrl": "https://dashboard.thegreentv.com",
    "preferredUrl": "https://www.thegreentv.com",
    "shouldUseDashboard": false,
    "dashboardLoginUrl": "https://dashboard.thegreentv.com/login",
    "publicLoginUrl": "https://www.thegreentv.com/login"
  }
}
```

**Error Codes:**
- `400` - Validation error (invalid email/password format)
- `401` - Invalid credentials
- `403` - Email not verified

---

### POST `/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_access_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "name": "Admin User"
  },
  "app": {
    "publicUrl": "https://www.thegreentv.com",
    "dashboardUrl": "https://dashboard.thegreentv.com",
    "preferredUrl": "https://dashboard.thegreentv.com",
    "shouldUseDashboard": true,
    "dashboardLoginUrl": "https://dashboard.thegreentv.com/login",
    "publicLoginUrl": "https://www.thegreentv.com/login"
  }
}
```

**Error Codes:**
- `400` - Missing refreshToken
- `401` - Invalid or expired refresh token

---

### GET `/auth/me`
Get the authenticated user's profile and app-target metadata.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Admin User",
    "role": "admin",
    "emailVerified": true
  },
  "app": {
    "publicUrl": "https://www.thegreentv.com",
    "dashboardUrl": "https://dashboard.thegreentv.com",
    "preferredUrl": "https://dashboard.thegreentv.com",
    "shouldUseDashboard": true,
    "dashboardLoginUrl": "https://dashboard.thegreentv.com/login",
    "publicLoginUrl": "https://www.thegreentv.com/login"
  }
}
```
- `404` - User not found

---

### POST `/auth/logout`
Revoke refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Codes:**
- `400` - Missing refreshToken

---

### POST `/auth/request-reset`
Request password reset link via email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Codes:**
- `400` - Validation error (invalid email)

**Note:** Always returns success even if email doesn't exist (security best practice).

---

### POST `/auth/reset`
Reset password using token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Error Codes:**
- `400` - Validation error (password too short < 8 chars)
- `400` - Invalid or expired token
- `404` - User not found

---

## Live Stream Configuration

### GET `/live/config`
Get current live stream configuration (public).

**Response:** `200 OK`
```json
{
  "streamUrl": "https://stream-url.m3u8",
  "title": "Live Sustainable Engineering Channel",
  "description": "Streaming sustainable engineering content 24/7"
}
```

**Error Codes:** None (returns empty config if not set)

---

### PUT `/live/config`
Update live stream configuration.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "streamUrl": "https://new-stream-url.m3u8",
  "title": "Updated Live Channel",
  "description": "New description"
}
```

**Response:** `200 OK`
```json
{
  "_id": "config_id",
  "streamUrl": "https://new-stream-url.m3u8",
  "title": "Updated Live Channel",
  "description": "New description",
  "updatedBy": "admin@example.com",
  "updatedAt": "2026-03-26T10:00:00.000Z"
}
```

**Error Codes:**
- `400` - Validation error (invalid URL, missing title)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient role)

---

## Media (Unified Videos & Podcasts) 🆕

> **Recommended:** Use the unified `/media` endpoint for all video and podcast operations. Legacy `/videos` and `/podcasts` endpoints remain available but are deprecated.

### GET `/media`
List media items (videos + podcasts) with pagination and filters.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `search` (optional) - Search in title and description
- `menu` (optional) - Filter by menu: `LiveTv` or `Podcast`
- `mediaType` (optional) - Filter by type: `video` or `audio`
- `category` (optional) - Filter by category/tag
- `status` (optional) - Filter by status: `processing`, `ready`, or `failed`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "media_id",
      "title": "Episode Title",
      "description": "Episode description",
      "mediaType": "video",
      "menu": "LiveTv",
      "category": "sustainability",
      "tags": ["climate", "engineering"],
      "duration": 3600,
      "fileUrl": "https://cdn.example.com/video.m3u8",
      "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
      "status": "ready",
      "createdAt": "2026-03-26T10:00:00.000Z",
      "updatedAt": "2026-03-26T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Examples:**
```bash
# Get all LiveTV videos
GET /media?menu=LiveTv&mediaType=video

# Get all podcasts
GET /media?menu=Podcast&mediaType=audio

# Search for climate content
GET /media?search=climate

# Get processing media
GET /media?status=processing
```

**Error Codes:** None

---

### GET `/media/:id`
Get a single media item by ID.

**Response:** `200 OK`
```json
{
  "id": "media_id",
  "title": "Episode Title",
  "description": "Episode description",
  "mediaType": "video",
  "menu": "LiveTv",
  "category": "sustainability",
  "tags": ["climate"],
  "duration": 3600,
  "fileUrl": "https://cdn.example.com/video.m3u8",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "status": "ready"
}
```

**Error Codes:**
- `404` - Media not found

---

### POST `/media`
Create a new media item (video or podcast).

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Episode",
  "description": "Episode description",
  "mediaType": "video",
  "menu": "LiveTv",
  "category": "sustainability",
  "tags": ["climate", "engineering"],
  "duration": 3600,
  "fileUrl": "https://cdn.example.com/video.m3u8",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "status": "processing"
}
```

**Response:** `201 Created`
```json
{
  "id": "new_media_id",
  "title": "New Episode",
  ...
}
```

**Error Codes:**
- `400` - Validation error (missing title, invalid mediaType/menu, invalid URL)
- `401` - Unauthorized
- `403` - Forbidden (insufficient role)

---

### PUT `/media/:id`
Update an existing media item.

**Auth Required:** `admin` or `editor`

**Request:** Same as POST (all fields optional)

**Response:** `200 OK` (updated media object)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Media not found

---

### DELETE `/media/:id`
Delete a media item.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Media not found

---

### PATCH `/media/:id/status`
Update media processing status (typically called by encoding service).

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "status": "ready",
  "fileUrl": "https://cdn.example.com/final-video.m3u8",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "duration": 3600
}
```

**Response:** `200 OK` (updated media object)

**Error Codes:**
- `400` - Validation error (invalid status: must be `processing`, `ready`, or `failed`)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Media not found

---

## Videos ⚠️ DEPRECATED

> **⚠️ Legacy Endpoint:** Use `/media?menu=LiveTv&mediaType=video` instead. This endpoint remains for backward compatibility but will be removed in v2.0.

### GET `/videos`
List videos with pagination and filters.

**Query Parameters:**
- `tag` (optional) - Filter by tag
- `status` (optional) - Filter by status (`draft` or `published`)
- `page` (default: 1) - Page number
- `pageSize` (default: 20) - Items per page

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "video_id",
      "title": "Video Title",
      "description": "Video description",
      "streamUrl": "https://video-url.mp4",
      "thumbnailUrl": "https://thumbnail.jpg",
      "duration": "12:34",
      "publishDate": "2026-03-26T10:00:00.000Z",
      "status": "published",
      "isLive": false,
      "tags": ["sustainability", "engineering"]
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:** None

---

### POST `/videos`
Create a new video.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Video",
  "description": "Video description",
  "streamUrl": "https://video-url.mp4",
  "thumbnailUrl": "https://thumbnail.jpg",
  "duration": "12:34",
  "publishDate": "2026-03-26T10:00:00.000Z",
  "status": "published",
  "isLive": false,
  "tags": ["sustainability"]
}
```

**Response:** `201 Created`
```json
{
  "_id": "new_video_id",
  "title": "New Video",
  ...
}
```

**Error Codes:**
- `400` - Validation error (missing title, invalid URL)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/videos/:id`
Update an existing video.

**Auth Required:** `admin` or `editor`

**Request:** Same as POST (all fields optional)

**Response:** `200 OK` (updated video object)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Video not found

---

### DELETE `/videos/:id`
Delete a video.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Video not found

---

## Podcasts ⚠️ DEPRECATED

> **⚠️ Legacy Endpoint:** Use `/media?menu=Podcast&mediaType=audio` instead. This endpoint remains for backward compatibility but will be removed in v2.0.

### GET `/podcasts`
List podcasts with pagination and filters.

**Query Parameters:**
- `tag` (optional) - Filter by tag
- `status` (optional) - Filter by status
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "podcast_id",
      "title": "Podcast Episode",
      "description": "Episode description",
      "audioUrl": "https://audio-url.mp3",
      "imageUrl": "https://cover-image.jpg",
      "duration": "45:30",
      "publishDate": "2026-03-26T10:00:00.000Z",
      "status": "published",
      "tags": ["climate", "technology"]
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:** None

---

### POST `/podcasts`
Create a new podcast.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Podcast",
  "description": "Episode description",
  "audioUrl": "https://audio-url.mp3",
  "imageUrl": "https://cover-image.jpg",
  "duration": "45:30",
  "publishDate": "2026-03-26T10:00:00.000Z",
  "status": "published",
  "tags": ["climate"]
}
```

**Response:** `201 Created` (podcast object)

**Error Codes:**
- `400` - Validation error (missing title/audioUrl, invalid URL)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/podcasts/:id`
Update a podcast.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK` (updated podcast)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Podcast not found

---

### DELETE `/podcasts/:id`
Delete a podcast.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Podcast not found

---

### POST `/podcasts/:id/comments`
Add a comment to a podcast (public).

**Request:**
```json
{
  "author": "John Doe",
  "message": "Great episode!"
}
```

**Response:** `201 Created`
```json
{
  "_id": "comment_id",
  "podcastId": "podcast_id",
  "author": "John Doe",
  "message": "Great episode!",
  "createdAt": "2026-03-26T10:00:00.000Z",
  "status": "visible"
}
```

**Error Codes:**
- `400` - Validation error (missing author/message)
- `404` - Podcast not found

---

### GET `/podcasts/:id/comments`
Get all visible comments for a podcast (public).

**Response:** `200 OK`
```json
[
  {
    "_id": "comment_id",
    "podcastId": "podcast_id",
    "author": "John Doe",
    "message": "Great episode!",
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
]
```

**Error Codes:** None

---

### GET `/podcasts/:id/comments/all` 🆕
Get all comments (including hidden) for admin/editor.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK`
```json
[
  {
    "_id": "comment_id",
    "podcastId": "podcast_id",
    "author": "John Doe",
    "message": "Great episode!",
    "status": "visible",
    "createdAt": "2026-03-26T10:00:00.000Z"
  },
  {
    "_id": "comment_id_2",
    "podcastId": "podcast_id",
    "author": "Spam User",
    "message": "Click here!",
    "status": "hidden",
    "createdAt": "2026-03-25T10:00:00.000Z"
  }
]
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden

---

### PATCH `/podcasts/:podcastId/comments/:commentId/status` 🆕
Moderate a comment (hide/show).

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "status": "hidden"
}
```

**Response:** `200 OK` (updated comment object)

**Error Codes:**
- `400` - Validation error (invalid status: must be `visible` or `hidden`)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Comment not found

---

### DELETE `/podcasts/:podcastId/comments/:commentId` 🆕
Delete a comment permanently.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Comment not found

---

## Articles

### GET `/articles`
List articles with pagination and filters.

**Query Parameters:**
- `tag` (optional)
- `featured` (optional) - `true` or `false`
- `status` (optional)
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "article_id",
      "title": "Article Title",
      "subtitle": "Article subtitle",
      "bodyMd": "# Markdown content...",
      "readTime": "5 min read",
      "coverImage": "https://cover.jpg",
      "publishDate": "2026-03-26T10:00:00.000Z",
      "status": "published",
      "featured": true,
      "tags": ["sustainability", "policy"]
    }
  ],
  "total": 75,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:** None

---

### GET `/articles/:id`
Get a single article by ID.

**Response:** `200 OK` (article object)

**Error Codes:**
- `404` - Article not found

---

### POST `/articles`
Create a new article.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Article",
  "subtitle": "Subtitle",
  "bodyMd": "# Article content in Markdown",
  "readTime": "5 min read",
  "coverImage": "https://cover.jpg",
  "publishDate": "2026-03-26T10:00:00.000Z",
  "status": "published",
  "featured": false,
  "tags": ["sustainability"]
}
```

**Response:** `201 Created` (article object)

**Error Codes:**
- `400` - Validation error (missing title, invalid URL)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/articles/:id`
Update an article.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK` (updated article)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Article not found

---

### DELETE `/articles/:id`
Delete an article.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Article not found

---

## Case Stories

### GET `/case-stories`
List case stories with pagination and filters.

**Query Parameters:**
- `tag` (optional)
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "story_id",
      "title": "Case Study Title",
      "impact": "Reduced emissions by 40%",
      "duration": "6 months",
      "heroImage": "https://hero.jpg",
      "metrics": [
        { "label": "CO2 Reduction", "value": "40%" },
        { "label": "Cost Savings", "value": "$500K" }
      ],
      "bodyMd": "# Detailed story...",
      "tags": ["renewable-energy"]
    }
  ],
  "total": 30,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:** None

---

### GET `/case-stories/:id`
Get a single case story by ID.

**Response:** `200 OK` (case story object)

**Error Codes:**
- `404` - Case story not found

---

### POST `/case-stories`
Create a new case story.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Case Study",
  "impact": "Environmental impact statement",
  "duration": "12 months",
  "heroImage": "https://hero.jpg",
  "metrics": [
    { "label": "Metric", "value": "100%" }
  ],
  "bodyMd": "# Case study content",
  "tags": ["renewable-energy"]
}
```

**Response:** `201 Created` (case story object)

**Error Codes:**
- `400` - Validation error (missing title)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/case-stories/:id`
Update a case story.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK` (updated case story)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Case story not found

---

### DELETE `/case-stories/:id`
Delete a case story.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Case story not found

---

## About Blocks

### GET `/about`
Get all about page blocks (sorted by order).

**Query Parameters:**
- `search` (optional) 🆕 - Search in title and body

**Response:** `200 OK`
```json
[
  {
    "_id": "block_id",
    "kind": "theme",
    "title": "Our Mission",
    "body": "Mission statement...",
    "mediaUrl": "https://media.jpg",
    "order": 0
  }
]
```

**Examples:**
```bash
# Get all blocks
GET /about

# Search blocks
GET /about?search=mission
```

**Error Codes:** None

---

### POST `/about`
Create a new about block.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "kind": "theme",
  "title": "Our Vision",
  "body": "Vision statement...",
  "mediaUrl": "https://media.jpg",
  "order": 1
}
```

**Response:** `201 Created` (about block object)

**Error Codes:**
- `400` - Validation error (invalid kind: must be `theme`, `timeline`, `gallery`, or `cta`)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/about/:id`
Update an about block.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK` (updated block)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Block not found

---

### DELETE `/about/:id`
Delete an about block.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Block not found

---

## Tags

### GET `/tags`
Get all tags (sorted alphabetically).

**Response:** `200 OK`
```json
[
  {
    "_id": "tag_id",
    "name": "sustainability",
    "kind": "category"
  },
  {
    "_id": "tag_id_2",
    "name": "renewable-energy",
    "kind": "topic"
  }
]
```

**Error Codes:** None

---

### POST `/tags`
Create a new tag.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "name": "climate-action",
  "kind": "category"
}
```

**Response:** `201 Created` (tag object)

**Error Codes:**
- `400` - Validation error (invalid kind: must be `category`, `topic`, or `role`)
- `401` - Unauthorized
- `403` - Forbidden

---

### DELETE `/tags/:id`
Delete a tag.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Tag not found

---

## File Uploads

### POST `/uploads/presign`
Request a pre-signed S3 URL for file upload.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "prefix": "videos",
  "contentType": "video/mp4"
}
```

**Response:** `200 OK`
```json
{
  "url": "https://s3-presigned-upload-url...",
  "fileUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/uuid.mp4",
  "key": "videos/uuid.mp4",
  "bucket": "your-bucket",
  "region": "us-east-1"
}
```

**Upload Flow:**
1. Request presigned URL from this endpoint
2. Upload file directly to S3 using `url` (PUT request with file as body)
3. Use `fileUrl` when creating media/article/post (this is the permanent public URL)

**Error Codes:**
- `400` - Validation error (missing prefix/contentType)
- `401` - Unauthorized
- `403` - Forbidden
- `500` - S3 configuration error

**Example:**
```bash
# 1. Get presigned URL
curl -X POST http://api/uploads/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prefix":"videos","contentType":"video/mp4"}'

# Response:
# {
#   "url": "https://bucket.s3.amazonaws.com/videos/uuid?...",
#   "fileUrl": "https://bucket.s3.amazonaws.com/videos/uuid.mp4",
#   "key": "videos/uuid.mp4"
# }

# 2. Upload file to presigned URL
curl -X PUT "$PRESIGNED_URL" \
  -H "Content-Type: video/mp4" \
  --data-binary @video.mp4

# 3. Create media with fileUrl
curl -X POST http://api/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Video",
    "mediaType": "video",
    "menu": "LiveTv",
    "fileUrl": "https://bucket.s3.amazonaws.com/videos/uuid.mp4"
  }'
```

---

## Admin Dashboard

### GET `/admin/summary`
Get aggregate counts for dashboard.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK`
```json
{
  "users": 150,
  "videos": 45,
  "podcasts": 30,
  "articles": 75,
  "caseStories": 20
}
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden

---

### POST `/admin/test-email`
Send a test email to verify SMTP configuration.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "to": "test@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "to": "test@example.com"
}
```

**Error Codes:**
- `400` - Missing 'to' field and no SMTP_USER configured
- `401` - Unauthorized
- `403` - Forbidden
- `500` - SMTP error (invalid credentials, connection failed, etc.)

---

## User Management

### GET `/users`
List all users (paginated).

**Auth Required:** `admin` or `editor`

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "viewer",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2026-03-26T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden

---

### POST `/users`
Create a new user (bypasses email verification).

**Auth Required:** `admin` only

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "editor",
  "name": "Jane Smith",
  "status": "active"
}
```

**Response:** `201 Created` (user object)

**Error Codes:**
- `400` - Validation error (email exists, password too short)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/users/:id`
Update a user.

**Auth Required:** `admin` only

**Request:**
```json
{
  "name": "Updated Name",
  "role": "admin",
  "status": "inactive",
  "password": "newpassword123"
}
```

**Response:** `200 OK` (updated user object)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - User not found

---

### DELETE `/users/:id`
Delete a user.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - User not found

---

### PATCH `/users/:id/status` 🆕
Update user status (active/inactive) without full update.

**Auth Required:** `admin` only

**Request:**
```json
{
  "status": "inactive"
}
```

**Response:** `200 OK` (updated user object)

**Error Codes:**
- `400` - Validation error (invalid status)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - User not found

---

## Posts 🆕

### GET `/posts`
List blog posts with pagination and filters.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `search` (optional) - Search in title and description
- `category` (optional) - Filter by category
- `sort` (default: `latest`) - Sort by `latest`, `popular`, or `oldest`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "_id": "post_id",
      "id": "post_id",
      "title": "Blog Post Title",
      "description": "Post description",
      "coverUrl": "https://cover.jpg",
      "totalViews": 1250,
      "totalComments": 45,
      "totalShares": 23,
      "totalFavorites": 89,
      "postedAt": "2026-03-26T10:00:00.000Z",
      "author": {
        "name": "John Doe",
        "avatarUrl": "https://avatar.jpg"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Error Codes:** None

---

### GET `/posts/:id`
Get a single blog post by ID.

**Response:** `200 OK` (post object)

**Error Codes:**
- `404` - Post not found

---

### POST `/posts`
Create a new blog post.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "title": "New Blog Post",
  "description": "Post description",
  "coverUrl": "https://cover.jpg",
  "totalViews": 0,
  "totalComments": 0,
  "totalShares": 0,
  "totalFavorites": 0,
  "author": {
    "name": "Jane Smith",
    "avatarUrl": "https://avatar.jpg"
  }
}
```

**Response:** `201 Created` (post object)

**Error Codes:**
- `400` - Validation error (missing title/description/coverUrl)
- `401` - Unauthorized
- `403` - Forbidden

---

### PUT `/posts/:id`
Update a blog post.

**Auth Required:** `admin` or `editor`

**Response:** `200 OK` (updated post)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Post not found

---

### DELETE `/posts/:id`
Delete a blog post.

**Auth Required:** `admin` only

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Post not found

---

## Notifications 🆕

### GET `/notifications`
List notifications for the authenticated user.

**Auth Required:** All roles (returns only notifications for current user)

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `isUnread` (optional) - Filter by read status (`true` or `false`)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "_id": "notification_id",
      "id": "notification_id",
      "title": "New Comment",
      "description": "John Doe commented on your post",
      "avatarUrl": "https://avatar.jpg",
      "type": "comment",
      "postedAt": "2026-03-26T10:00:00.000Z",
      "isUnread": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

**Error Codes:**
- `401` - Unauthorized

---

### PATCH `/notifications/:id`
Mark notification as read or unread.

**Auth Required:** All roles (only own notifications)

**Request:**
```json
{
  "isUnread": false
}
```

**Response:** `200 OK` (updated notification)

**Error Codes:**
- `400` - Validation error
- `401` - Unauthorized
- `404` - Notification not found (or not owned by user)

---

### PATCH `/notifications/read-all`
Mark all notifications as read for current user.

**Auth Required:** All roles

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized

---

### DELETE `/notifications/:id`
Delete a single notification.

**Auth Required:** All roles (only own notifications)

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized
- `404` - Notification not found

---

### DELETE `/notifications`
Delete all notifications for current user.

**Auth Required:** All roles

**Response:** `204 No Content`

**Error Codes:**
- `401` - Unauthorized

---

## Reference Data 🆕

### GET `/api/categories`
Get list of categories aggregated from content.

**Query Parameters:**
- `type` (optional) - Filter by type: `media`, `article`, or `post`

**Response:** `200 OK`
```json
{
  "data": ["sustainability", "renewable-energy", "climate-action"]
}
```

**Error Codes:** None

---

### GET `/api/menus`
Get list of available menus.

**Response:** `200 OK`
```json
{
  "data": ["LiveTv", "Podcast"]
}
```

**Error Codes:** None

---

### GET `/api/tags`
Get list of tags aggregated from content.

**Query Parameters:**
- `type` (optional) - Filter by type: `article` or `media`

**Response:** `200 OK`
```json
{
  "data": ["sustainability", "tech", "climate"]
}
```

**Error Codes:** None

---

## Search API 🆕

### GET `/search`
Global cross-content search across all content types.

**Query Parameters:**
- `q` (required) - Search query
- `type` (optional) - Filter by content type: `all` (default), `media`, `articles`, `posts`, `caseStories`
- `limit` (optional) - Results per type (default: 50)

**Response:** `200 OK`
```json
{
  "media": [
    {
      "_id": "media_id",
      "menu": "LiveTv",
      "mediaType": "video",
      "title": "Climate Action Now",
      "description": "Documentary about climate...",
      "videoUrl": "https://video.mp4",
      "thumbnailUrl": "https://thumb.jpg",
      "duration": 3600,
      "publishDate": "2026-03-20T00:00:00.000Z",
      "tags": ["climate", "action"]
    }
  ],
  "articles": [
    {
      "_id": "article_id",
      "title": "Renewable Energy Future",
      "subtitle": "Analysis of trends",
      "bodyMd": "# Content...",
      "thumbnailUrl": "https://thumb.jpg",
      "publishDate": "2026-03-15T00:00:00.000Z",
      "status": "published"
    }
  ],
  "posts": [
    {
      "_id": "post_id",
      "title": "Green Tech Innovation",
      "description": "Latest developments...",
      "coverUrl": "https://cover.jpg",
      "totalViews": 150,
      "author": {
        "name": "John Doe",
        "avatarUrl": "https://avatar.jpg"
      }
    }
  ],
  "caseStories": [
    {
      "_id": "case_id",
      "title": "Solar Village Project",
      "impact": "Reduced emissions by 50%",
      "bodyMd": "# Story...",
      "imageUrl": "https://image.jpg"
    }
  ]
}
```

**Search Behavior:**
- **Media:** Searches in title, description, tags
- **Articles:** Searches in title, subtitle, bodyMd, tags (published only)
- **Posts:** Searches in title, description, tags
- **Case Stories:** Searches in title, impact, bodyMd

**Examples:**
```bash
# Global search
GET /search?q=climate

# Search only media
GET /search?q=renewable&type=media

# Search with limit
GET /search?q=energy&limit=20
```

**Error Codes:**
- `400` - Bad Request (missing query parameter)

**Per-Endpoint Search:**
- Articles: `GET /articles?search=climate`
- Case Stories: `GET /case-stories?search=solar`
- About Blocks: `GET /about?search=mission`

---

## Enhanced Dashboard Analytics 🆕

### GET `/admin/summary`
Get comprehensive dashboard analytics with trending data.

**Auth Required:** `admin` or `editor`

**Query Parameters:**
- `from` (optional) - Start date for trending data (ISO 8601)
- `to` (optional) - End date for trending data (ISO 8601)

**Response:** `200 OK`
```json
{
  "metrics": {
    "numberOfVideo": 45,
    "totalUsers": 150,
    "onlineUsers": 12,
    "totalPodcasts": 30
  },
  "trendingPodcastCategory": {
    "categories": ["climate", "tech", "energy"],
    "series": [
      {
        "name": "Podcast Count",
        "data": [15, 10, 5]
      }
    ]
  },
  "trendingArticleCategory": {
    "categories": ["sustainability", "policy", "innovation"],
    "series": [
      {
        "name": "Article Count",
        "data": [25, 20, 15]
      }
    ]
  },
  "usersStatus": [
    { "label": "active", "value": 135 },
    { "label": "inactive", "value": 15 }
  ],
  "recentActivity": [
    {
      "_id": "post_id",
      "title": "Recent Blog Post",
      "description": "Description",
      "coverUrl": "https://cover.jpg",
      "totalViews": 50,
      "postedAt": "2026-03-26T10:00:00.000Z"
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Forbidden

---

## Article Status Management 🆕

### PATCH `/articles/:id/status`
Publish or draft an article without full update.

**Auth Required:** `admin` or `editor`

**Request:**
```json
{
  "status": "published"
}
```

**Response:** `200 OK` (updated article object)

**Error Codes:**
- `400` - Validation error (invalid status: must be `published` or `draft`)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Article not found

---

## Common Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message" 
}
```

Or for validation errors:

```json
{
  "error": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["String must contain at least 8 character(s)"]
    },
    "formErrors": []
  }
}
```

---

## HTTP Status Codes Summary

| Code | Meaning |
|------|---------|
| `200` | OK - Request succeeded |
| `201` | Created - Resource created successfully |
| `202` | Accepted - Request accepted (async operation, e.g., email sending) |
| `204` | No Content - Deletion successful |
| `400` | Bad Request - Validation error or malformed request |
| `401` | Unauthorized - Missing or invalid authentication token |
| `403` | Forbidden - Authenticated but insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error - Server-side error (check logs) |

---

## User Roles

| Role | Permissions |
|------|-------------|
| `viewer` | Read-only access to public endpoints |
| `editor` | Create/update content (videos, articles, podcasts, etc.) |
| `admin` | Full access including user management and deletions |

---

## Rate Limiting

Rate limiting is applied per IP address:
- Default: 100 requests per 15 minutes
- Exceeding limit returns `429 Too Many Requests`

**Response:**
```json
{
  "error": "Too many requests, please try again later."
}
```

---

## CORS

CORS is enabled for configured origins. If you encounter CORS errors, ensure:
1. Your origin is whitelisted in `CORS_ORIGIN` environment variable
2. Credentials are included in requests if needed

---

## Environment Variables

Required server configuration (see `server/.env.example`):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/zthorbit

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# App
PORT=4000
NODE_ENV=production
APP_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# SMTP (for email verification and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com

# S3 (optional, for uploads)
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_CDN_URL=https://cdn.your-domain.com
```

---

## Example API Calls

### Register and Login Flow

```bash
# 1. Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John"}'

# 2. Verify email (check email for code)
curl -X POST http://localhost:4000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'

# Response includes accessToken and refreshToken
```

### Authenticated Request

```bash
# Get admin summary (requires admin/editor role)
curl -X GET http://localhost:4000/api/admin/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Media (Recommended)

```bash
# Create a video using unified /media endpoint
curl -X POST http://localhost:4000/api/media \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Sustainable Energy Solutions",
    "description":"Documentary on renewable energy",
    "mediaType":"video",
    "menu":"LiveTv",
    "category":"renewable-energy",
    "fileUrl":"https://cdn.example.com/video.m3u8",
    "thumbnailUrl":"https://cdn.example.com/thumb.jpg",
    "duration":2550,
    "status":"ready",
    "tags":["renewable","energy"]
  }'
```

### Create Video (Legacy)

```bash
# Legacy endpoint - use /media instead
curl -X POST http://localhost:4000/api/videos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Sustainable Energy Solutions",
    "description":"Documentary on renewable energy",
    "streamUrl":"https://cdn.example.com/video.mp4",
    "thumbnailUrl":"https://cdn.example.com/thumb.jpg",
    "duration":"42:30",
    "status":"published",
    "tags":["renewable","energy"]
  }'
```

---

**Last Updated:** March 26, 2026  
**API Version:** 1.0  
**Support:** Contact your administrator for API access and credentials
