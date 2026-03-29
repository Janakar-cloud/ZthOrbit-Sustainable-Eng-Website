# Dashboard API Checklist 📋

**For Frontend Dashboard Team**  
Complete list of available APIs for content management UI.

---

## ✅ Content Upload & Management APIs

### 1. **Media (Videos & Podcasts)** - Unified Endpoint

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List all media | `GET /api/media` | GET | Optional | ✅ Ready |
| Get single media | `GET /api/media/:id` | GET | Optional | ✅ Ready |
| Create media | `POST /api/media` | POST | Admin/Editor | ✅ Ready |
| Update media | `PUT /api/media/:id` | PUT | Admin/Editor | ✅ Ready |
| Delete media | `DELETE /api/media/:id` | DELETE | Admin | ✅ Ready |
| Update status | `PATCH /api/media/:id/status` | PATCH | Admin/Editor | ✅ Ready |
| **Search media** | `GET /api/media?search=query` | GET | Optional | ✅ Ready |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in title/description
- `menu` - Filter: `LiveTv` or `Podcast`
- `mediaType` - Filter: `video` or `audio`
- `category` - Filter by category/tag
- `status` - Filter: `processing`, `ready`, or `failed`

**Create Media Example:**
```json
POST /api/media
{
  "title": "Climate Action Documentary",
  "description": "Exploring renewable energy solutions",
  "mediaType": "video",
  "menu": "LiveTv",
  "category": "climate",
  "tags": ["sustainability", "energy"],
  "duration": 3600,
  "fileUrl": "https://cdn.example.com/video.m3u8",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "status": "ready"
}
```

---

### 2. **Articles Management**

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List articles | `GET /api/articles` | GET | Optional | ✅ Ready |
| Get single article | `GET /api/articles/:id` | GET | Optional | ✅ Ready |
| Create article | `POST /api/articles` | POST | Admin/Editor | ✅ Ready |
| Update article | `PUT /api/articles/:id` | PUT | Admin/Editor | ✅ Ready |
| Delete article | `DELETE /api/articles/:id` | DELETE | Admin | ✅ Ready |
| Publish/Draft | `PATCH /api/articles/:id/status` | PATCH | Admin/Editor | ✅ Ready |
| **Search articles** | `GET /api/articles?search=query` | GET | Optional | ✅ NEW |

**Query Parameters:**
- `page`, `pageSize` - Pagination
- `search` - Search in title/subtitle/body (NEW)
- `tag` - Filter by tag
- `featured` - Filter: `true` or `false`
- `status` - Filter: `published` or `draft`

**Create Article Example:**
```json
POST /api/articles
{
  "title": "Sustainable Engineering Practices",
  "subtitle": "Building a greener future",
  "bodyMd": "# Introduction\n\nMarkdown content...",
  "coverImage": "https://cdn.example.com/cover.jpg",
  "readTime": "5 min read",
  "publishDate": "2026-03-26T10:00:00Z",
  "status": "published",
  "featured": true,
  "tags": ["sustainability", "engineering"]
}
```

---

### 3. **Blog Posts Management**

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List posts | `GET /api/posts` | GET | Optional | ✅ Ready |
| Get single post | `GET /api/posts/:id` | GET | Optional | ✅ Ready |
| Create post | `POST /api/posts` | POST | Admin/Editor | ✅ Ready |
| Update post | `PUT /api/posts/:id` | PUT | Admin/Editor | ✅ Ready |
| Delete post | `DELETE /api/posts/:id` | DELETE | Admin | ✅ Ready |
| **Search posts** | `GET /api/posts?search=query` | GET | Optional | ✅ Ready |

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in title/description
- `category` - Filter by category
- `sort` - Sort: `latest`, `popular`, or `oldest`

---

### 4. **Case Stories Management**

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List case stories | `GET /api/case-stories` | GET | Optional | ✅ Ready |
| Get single story | `GET /api/case-stories/:id` | GET | Optional | ✅ Ready |
| Create case story | `POST /api/case-stories` | POST | Admin/Editor | ✅ Ready |
| Update case story | `PUT /api/case-stories/:id` | PUT | Admin/Editor | ✅ Ready |
| Delete case story | `DELETE /api/case-stories/:id` | DELETE | Admin | ✅ Ready |
| **Search stories** | `GET /api/case-stories?search=query` | GET | Optional | ✅ NEW |

**Query Parameters:**
- `page`, `pageSize` - Pagination
- `search` - Search in title/impact/body (NEW)
- `tag` - Filter by tag

**Create Case Story Example:**
```json
POST /api/case-stories
{
  "title": "40% CO2 Reduction at Factory X",
  "impact": "Reduced emissions by 40%",
  "duration": "6 months",
  "heroImage": "https://cdn.example.com/hero.jpg",
  "metrics": [
    { "label": "CO2 Reduction", "value": "40%" },
    { "label": "Cost Savings", "value": "$500K" }
  ],
  "bodyMd": "# Project Overview\n\nDetailed story...",
  "tags": ["renewable-energy", "manufacturing"]
}
```

---

## 🔍 Search Functionality (NEW)

### **Global Search API** 🆕

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| **Search all content** | `GET /api/search` | GET | Optional | ✅ NEW |

**Query Parameters:**
- `q` (required) - Search query string
- `type` (optional) - Filter by type: `all` (default), `media`, `articles`, `posts`, `caseStories`
- `limit` (optional) - Max results per type (default: 20, max: 50)

**Search Example:**
```bash
GET /api/search?q=climate&type=all
```

**Response:**
```json
{
  "query": "climate",
  "results": {
    "media": [
      {
        "id": "...",
        "type": "video",
        "menu": "LiveTv",
        "title": "Climate Action Now",
        "description": "...",
        "thumbnailUrl": "...",
        "url": "...",
        "publishDate": "2026-03-20T10:00:00Z"
      }
    ],
    "articles": [
      {
        "id": "...",
        "type": "article",
        "title": "Climate Policy Update",
        "subtitle": "...",
        "coverImage": "...",
        "publishDate": "2026-03-15T10:00:00Z"
      }
    ],
    "posts": [],
    "caseStories": []
  },
  "totalResults": 15
}
```

**Features:**
- Searches across title, description, body, and tags
- Returns results grouped by content type
- Sorted by publish date (newest first)
- Only returns published articles

---

## 📤 File Upload API

### **S3 Presigned URL Upload**

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| Request upload URL | `POST /api/uploads/presign` | POST | Admin/Editor | ✅ Ready |

**Request:**
```json
POST /api/uploads/presign
{
  "prefix": "videos",
  "contentType": "video/mp4"
}
```

**Response:**
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
1. Dashboard requests presigned URL from backend
2. Backend returns presigned `url` + permanent `fileUrl`
3. Dashboard uploads file directly to S3 using `url` (PUT request)
4. Dashboard uses `fileUrl` when creating media/article/post

**Supported Prefixes:**
- `videos` - Video files
- `podcasts` - Audio files
- `images` - Cover images, thumbnails
- `articles` - Article assets

---

## 👥 User Management APIs

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List users | `GET /api/users` | GET | Admin/Editor | ✅ Ready |
| Create user | `POST /api/users` | POST | Admin | ✅ Ready |
| Update user | `PUT /api/users/:id` | PUT | Admin | ✅ Ready |
| Delete user | `DELETE /api/users/:id` | DELETE | Admin | ✅ Ready |
| Update status | `PATCH /api/users/:id/status` | PATCH | Admin | ✅ Ready |

**User Roles:**
- `admin` - Full access (create/update/delete everything)
- `editor` - Manage content (create/update videos, articles, posts)
- `viewer` - Read-only access

**Update User Status:**
```json
PATCH /api/users/:id/status
{
  "status": "inactive"
}
```

---

## � Podcast Comments Management 🆕

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List public comments | `GET /api/podcasts/:id/comments` | GET | None | ✅ Ready |
| Add comment | `POST /api/podcasts/:id/comments` | POST | None | ✅ Ready |
| **List all comments (admin)** | `GET /api/podcasts/:id/comments/all` | GET | Admin/Editor | ✅ NEW |
| **Moderate comment** | `PATCH /api/podcasts/:podcastId/comments/:commentId/status` | PATCH | Admin/Editor | ✅ NEW |
| **Delete comment** | `DELETE /api/podcasts/:podcastId/comments/:commentId` | DELETE | Admin | ✅ NEW |

**Moderate Comment Example:**
```json
PATCH /api/podcasts/:podcastId/comments/:commentId/status
{
  "status": "hidden"  // or "visible"
}
```

**Admin Comment Management:**
- Public endpoint shows only "visible" comments
- Admin endpoint `/all` shows all comments (visible + hidden)
- Moderate to hide spam/inappropriate comments
- Delete permanently removes comment

---

## �🔔 Notifications (Optional for Dashboard)

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List notifications | `GET /api/notifications` | GET | All roles | ✅ Ready |
| Mark read/unread | `PATCH /api/notifications/:id` | PATCH | All roles | ✅ Ready |
| Mark all read | `PATCH /api/notifications/read-all` | PATCH | All roles | ✅ Ready |
| Delete notification | `DELETE /api/notifications/:id` | DELETE | All roles | ✅ Ready |
| Delete all | `DELETE /api/notifications` | DELETE | All roles | ✅ Ready |

---

## 📊 Dashboard Analytics

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| Get dashboard summary | `GET /api/admin/summary` | GET | Admin/Editor | ✅ Ready |
| Test email | `POST /api/admin/test-email` | POST | Admin/Editor | ✅ Ready |

**Dashboard Summary Response:**
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
    "series": [{ "name": "Podcast Count", "data": [15, 10, 5] }]
  },
  "trendingArticleCategory": {
    "categories": ["sustainability", "policy"],
    "series": [{ "name": "Article Count", "data": [25, 20] }]
  },
  "usersStatus": [
    { "label": "active", "value": 135 },
    { "label": "inactive", "value": 15 }
  ],
  "recentActivity": [
    {
      "_id": "...",
      "title": "Recent Blog Post",
      "coverUrl": "...",
      "totalViews": 50,
      "postedAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

---

## 🏷️ Reference Data (Dropdowns/Filters)

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| Get categories | `GET /api/api/categories` | GET | None | ✅ Ready |
| Get menus | `GET /api/api/menus` | GET | None | ✅ Ready |
| Get tags | `GET /api/api/tags` | GET | None | ✅ Ready |
| List all tags | `GET /api/tags` | GET | None | ✅ Ready |
| Create tag | `POST /api/tags` | POST | Admin/Editor | ✅ Ready |
| Delete tag | `DELETE /api/tags/:id` | DELETE | Admin | ✅ Ready |

**Categories:**
```bash
GET /api/api/categories?type=media
# Returns: { "data": ["sustainability", "climate", "tech"] }
```

**Menus:**
```bash
GET /api/api/menus
# Returns: { "data": ["LiveTv", "Podcast"] }
```

---

## 📺 Live TV Configuration

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| Get live config | `GET /api/live/config` | GET | None | ✅ Ready |
| Update live config | `PUT /api/live/config` | PUT | Admin/Editor | ✅ Ready |

**Live Config Example:**
```json
{
  "streamUrl": "https://cdn.example.com/live/stream.m3u8",
  "title": "Live: Climate Summit 2026",
  "description": "Watch live coverage",
  "thumbnailUrl": "https://cdn.example.com/live-thumb.jpg",
  "isActive": true
}
```

---

## 🔐 Authentication APIs

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| Register | `POST /api/auth/register` | POST | None | ✅ Ready |
| Verify email | `POST /api/auth/verify-email` | POST | None | ✅ Ready |
| Resend code | `POST /api/auth/resend-verification` | POST | None | ✅ Ready |
| Login | `POST /api/auth/login` | POST | None | ✅ Ready |
| Refresh token | `POST /api/auth/refresh` | POST | None | ✅ Ready |
| Logout | `POST /api/auth/logout` | POST | None | ✅ Ready |
| Request password reset | `POST /api/auth/request-reset` | POST | None | ✅ Ready |
| Reset password | `POST /api/auth/reset` | POST | None | ✅ Ready |

---

## 📄 About Page Management

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List about blocks | `GET /api/about` | GET | None | ✅ Ready |
| **Search about blocks** | `GET /api/about?search=query` | GET | None | ✅ NEW |
| Create about block | `POST /api/about` | POST | Admin/Editor | ✅ Ready |
| Update about block | `PUT /api/about/:id` | PUT | Admin/Editor | ✅ Ready |
| Delete about block | `DELETE /api/about/:id` | DELETE | Admin | ✅ Ready |

**Query Parameters:**
- `search` - Search in title and body (NEW)

---

## ❌ What's NOT Available (Potential Future Features)

### Missing APIs:
1. **Bulk Operations** ❌
   - Bulk delete multiple items
   - Bulk status update (use PATCH /media/:id/status)
   - Thumbnail auto-generation callback
   - Duration auto-detection

3  - Comments are only on podcasts currently
   - No admin interface to moderate comments
   - No comment approval workflow

4. **Analytics Tracking** ❌
   - No view/play tracking endpoints
   - No user behavior analytics
   - No content performance metrics

5. **Scheduling** ❌
   - No scheduled publishing
   - No content calendar API

6. **Versioning** ❌
   - No content version history
   - No draft/revision system

7. **Multi-language** ❌
   - No i18n support
   - No translation management

---

## ✅ API Coverage Assessment

### **Content Management: 100% Complete** ✅

| Content Type | Create | Read | Update | Delete | Search | Status |
|--------------|--------|------|--------|--------|--------|--------|
| Videos/Podcasts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Articles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog Posts | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Case Stories | ✅ | ✅ | ✅ | ✅ | ✅ | - |Moderate |
|--------------|--------|------|--------|--------|--------|----------|
| Videos/Podcasts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Articles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog Posts | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Case Stories | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| About Blocks | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Podcast Comments | ✅ | ✅ | - | ✅ | - | ✅

---

## 🚀 Dashboard UI Must-Haves

### **Core Features:**
1. ✅ **Login/Authentication** - `/auth/login`
2. ✅ **Video Upload & Management** - `/media` + `/uploads/presign`
3. ✅ **Podcast Upload & Management** - `/media` + `/uploads/presign`
4. ✅ **Article Editor (Markdown)** - `/articles`
5. ✅ **Blog Post Management** - `/posts`
6. ✅ **Case Story Management** - `/case-stories`
7. ✅ **User Management** - `/users`
8. ✅ **Dashboard Analytics** - `/admin/summary`
9. ✅ **Global Search** - `/search` (NEW)
10. ✅ **Tag Management** - `/tags`
11. ✅ **Live TV Config** - `/live/config`

### **Nice-to-Have:**
- ⚠️ Bulk operations (not available - implement client-side loops)
- ⚠️ Comment moderation (only podcast comments available)
- ⚠️ Scheduled publishing (handle client-side)

---

## 📝 Quick Start for Dashboard Team

### 1. **Environment Setup**
```env
REACT_APP_API_URL=https://api.zthorbit.com/api
# or for local dev
REACT_APP_API_URL=http://localhost:4000/api
```

### 2. **Authentication Flow**
```typescript
// 1. Login
const { accessToken, refreshToken } = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// 2. Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 3. Use in requests
fetch('/api/media', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. **File Upload Flow**
```typescript
// 1. Get presigned URL
const { uploadUrl, fileUrl } = await fetch('/api/uploads/presign', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ 
    prefix: 'videos', 
    contentType: file.type 
  })
}).then(r => r.json());

// 2. Upload file to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Create media with fileUrl
await fetch('/api/media', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    title: 'My Video',
    mediaType: 'video',
    menu: 'LiveTv',
    fileUrl: fileUrl, // Use this URL
    // ... other fields
  })
});
```

### 4. **Search Implementation**
```typescript
// Global search
const results = await fetch(`/api/search?q=${query}&type=all`)
  .then(r => r.json());

// Specific search
const articles = await fetch(`/api/articles?search=${query}`)
  .then(r => r.json());
```

---

## 📚 Documentation Links

- **Full API Docs:** `server/API_DOCUMENTATION.md`
- **Frontend Integration Guide:** `server/FRONTEND_INTEGRATION.md`
- **OpenAPI Spec:** `server/openapi.yaml`

---

## ✅ Final Checklist

**Everything needed for dashboard UI is ready:**

- [x] Authentication & user management
- [x] Media (video/podcast) upload & management
- [x] Article creation & editing (with Markdown)
- [x] Blog post management
- [x] Case story management
- [x] File upload to S3 (presigned URLs)
- [x] Search functionality (global + per-content-type)
- [x] Dashboard analytics
- [x] User role management
- [x] Tag & category management
- [x] Live TV configuration
- [x] Status management (publish/draft/active/inactive)

**No blocking APIs missing!** 🎉

**Last Updated:** March 26, 2026
