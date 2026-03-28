# Frontend Quick Start Guide - Replace Mock Data with Real API

**Last Updated:** March 27, 2026  
**Target:** Dashboard frontend developers ready to integrate real backend APIs

---

## 🚀 Quick Setup (5 Minutes)

### 1. Environment Configuration

Create `.env.local` in your frontend project root:

```bash
# Development
VITE_API_URL=http://localhost:4000/api/v1

# Production (when ready)
# VITE_API_URL=https://www.thegreentv.com/api/v1
```

**Note:** Use `VITE_API_URL` (not `VITE_API_BASE`). Vite requires `VITE_` prefix.

---

### 2. Test Account Credentials

**Development Login:**
```
Email: admin@zthorbit.com
Password: [Contact backend team for password]
```

**Alternative:** Create your own account via `/api/v1/auth/register` endpoint.

---

### 3. Required Headers for All Requests

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,  // After login
};

const fetchOptions = {
  headers,
  credentials: 'include',  // ⭐ CRITICAL for CORS
};
```

**Important:**
- ✅ Always include `credentials: 'include'`
- ✅ Use `Authorization: Bearer <token>` (with space after "Bearer")
- ✅ No other headers required (CORS, Accept, etc. handled by backend)

---

## 📡 Confirmed Endpoint Reference

All endpoints are prefixed with base URL: `/api/v1/`

### Authentication Endpoints

#### POST `/auth/register`
```typescript
// Request
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Optional Name"  // optional
}

// Response (202 Accepted)
{
  "message": "Verification code sent to email. Please verify before logging in."
}
```

#### POST `/auth/verify-email`
```typescript
// Request (after registration)
POST /api/v1/auth/verify-email
{
  "email": "user@example.com",
  "code": "123456"  // From email
}

// Response
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "random-uuid-token"
}
```

#### POST `/auth/login`
```typescript
// Request
POST /api/v1/auth/login
{
  "email": "admin@zthorbit.com",
  "password": "password"
}

// Response
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "random-uuid-token"
}

// Error if email not verified (403 Forbidden)
{
  "error": "Email not verified. Please complete verification."
}
```

#### POST `/auth/refresh`
```typescript
// Request
POST /api/v1/auth/refresh
{
  "refreshToken": "previous-refresh-token"
}

// Response
{
  "accessToken": "new-eyJhbGci..."
}
```

---

### Dashboard Summary

#### GET `/admin/summary`
**Path:** `/api/v1/admin/summary` (confirmed, NOT `/dashboard/summary`)

```typescript
// Request
GET /api/v1/admin/summary?from=2026-01-01T00:00:00Z&to=2026-03-27T23:59:59Z
Headers: { Authorization: Bearer <token>, credentials: 'include' }

// Query Parameters (both optional)
- from: ISO 8601 date string (default: 30 days ago)
- to: ISO 8601 date string (default: now)

// Response
{
  "metrics": {
    "numberOfVideo": 42,
    "totalUsers": 156,
    "onlineUsers": 12,      // Currently active
    "totalPodcasts": 28
  },
  "trendingPodcastCategory": {
    "categories": ["Climate Change", "Sustainability", "Renewable Energy"],
    "series": [
      { "name": "Views", "data": [245, 189, 156] }
    ]
  },
  "trendingArticleCategory": {
    "categories": ["Environment", "Solar", "Wind"],
    "series": [
      { "name": "Views", "data": [312, 267, 198] }
    ]
  },
  "usersStatus": [
    { "label": "Active", "value": 142 },
    { "label": "Inactive", "value": 14 }
  ],
  "recentActivity": [
    // Array of Post objects (see Posts section below)
  ]
}
```

**Required Role:** `superadmin`, `admin`, or `editor`

---

### Notifications

#### GET `/notifications`
```typescript
// Request
GET /api/v1/notifications?page=1&limit=20&isUnread=true
Headers: { Authorization: Bearer <token>, credentials: 'include' }

// Query Parameters
- page: number (default: 1)
- limit: number (default: 20)
- isUnread: "true" | "false" (optional, filter by read status)

// Response
{
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "title": "New video uploaded",
      "description": "Climate Change documentary is now live",
      "avatarUrl": "https://example.com/avatar.jpg",  // optional
      "type": "video",
      "postedAt": "2026-03-27T10:30:00.000Z",
      "isUnread": true
    },
    // ... more notifications
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### PATCH `/notifications/{id}`
```typescript
// Request - Mark single notification as read/unread
PATCH /api/v1/notifications/65f1234567890abcdef12345
Headers: { Authorization: Bearer <token>, credentials: 'include' }
{
  "isUnread": false  // true = mark unread, false = mark read
}

// Response - Returns updated notification
{
  "id": "65f1234567890abcdef12345",
  "title": "New video uploaded",
  // ... same fields as GET response
  "isUnread": false
}
```

#### PATCH `/notifications/read-all`
```typescript
// Request - Mark all notifications as read
PATCH /api/v1/notifications/read-all
Headers: { Authorization: Bearer <token>, credentials: 'include' }
// No body required

// Response (204 No Content)
// Empty response on success
```

**Required Role:** Any authenticated user (`superadmin`, `admin`, `editor`, `viewer`)

---

### Posts / Blog

#### GET `/posts`
```typescript
// Request
GET /api/v1/posts?page=1&limit=20&search=climate&category=Environment&sort=popular

// Query Parameters (all optional)
- page: number (default: 1)
- limit: number (default: 20)
- search: string (searches title)
- category: string (filter by category)
- sort: "latest" | "popular" | "oldest" (default: "latest")

// Response
{
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Understanding Climate Change",
      "description": "A comprehensive guide to climate change and its impacts",
      "coverUrl": "https://s3.amazonaws.com/greentv-s3/images/post-cover.jpg",
      "totalViews": 1245,
      "totalComments": 34,
      "totalShares": 67,
      "totalFavorites": 89,
      "postedAt": "2026-03-15T08:00:00.000Z",
      "author": {
        "name": "Dr. Jane Smith",
        "avatarUrl": "https://example.com/avatar.jpg"  // optional
      },
      "createdAt": "2026-03-15T08:00:00.000Z",
      "updatedAt": "2026-03-27T10:30:00.000Z"
    },
    // ... more posts
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

#### GET `/posts/{id}`
```typescript
// Request - Get single post details
GET /api/v1/posts/65f1234567890abcdef12345

// Response - Same as individual post object above
{
  "_id": "65f1234567890abcdef12345",
  "title": "Understanding Climate Change",
  // ... all fields
}
```

#### POST `/posts` (Create new post)
```typescript
// Request
POST /api/v1/posts
Headers: { Authorization: Bearer <token>, credentials: 'include' }
{
  "title": "Understanding Climate Change",
  "description": "A comprehensive guide",
  "coverUrl": "https://s3.amazonaws.com/greentv-s3/images/cover.jpg",
  "totalViews": 0,        // optional, default: 0
  "totalComments": 0,     // optional, default: 0
  "totalShares": 0,       // optional, default: 0
  "totalFavorites": 0,    // optional, default: 0
  "postedAt": "2026-03-27T10:00:00Z",  // optional, default: now
  "author": {
    "name": "Dr. Jane Smith",
    "avatarUrl": "https://example.com/avatar.jpg"  // optional
  }
}

// Response (201 Created)
// Returns created post with _id and timestamps
```

**Required Role for POST:** `superadmin`, `admin`, or `editor`

---

### Users

#### GET `/users`
```typescript
// Request
GET /api/v1/users?page=1&pageSize=20
Headers: { Authorization: Bearer <token>, credentials: 'include' }

// Query Parameters
- page: number (default: 1)
- pageSize: number (default: 20)  ⚠️ Note: "pageSize", NOT "limit"

// Response
{
  "items": [
    {
      "_id": "65f1234567890abcdef12345",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "viewer",  // "superadmin" | "admin" | "editor" | "viewer"
      "status": "active",  // "active" | "inactive"
      "emailVerified": true,
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-03-27T10:30:00.000Z"
      // passwordHash is excluded
    },
    // ... more users
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

#### PATCH `/users/{id}/status`
```typescript
// Request - Update user status
PATCH /api/v1/users/65f1234567890abcdef12345/status
Headers: { Authorization: Bearer <token>, credentials: 'include' }
{
  "status": "inactive"  // "active" | "inactive"
}

// Response - Returns updated user (without passwordHash)
{
  "_id": "65f1234567890abcdef12345",
  "email": "user@example.com",
  "status": "inactive",
  // ... other fields
}
```

**Note:** There's also `PUT /users/{id}` for full user updates (name, role, password).

**Required Role:** `superadmin` or `admin`

---

### Articles

#### GET `/articles`
```typescript
// Request
GET /api/v1/articles?page=1&pageSize=20&search=climate&tag=environment&featured=true&status=published

// Query Parameters (all optional)
- page: number (default: 1)
- pageSize: number (default: 20)  ⚠️ Note: "pageSize", NOT "limit"
- search: string (searches title, subtitle, bodyMd)
- tag: string (filter by tag)
- featured: "true" | "false" (filter featured articles)
- status: "draft" | "published" (filter by status)

// Response
{
  "items": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Solar Energy Revolution",
      "subtitle": "How solar is changing the world",  // optional
      "bodyMd": "# Article Content\n\nMarkdown content here...",
      "readTime": "5 min",  // optional
      "coverImage": "https://s3.amazonaws.com/greentv-s3/images/article.jpg",  // optional
      "publishDate": "2026-03-15T08:00:00.000Z",  // optional
      "status": "published",  // "draft" | "published"
      "featured": true,
      "tags": ["solar", "renewable", "energy"],
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-27T10:30:00.000Z"
    },
    // ... more articles
  ],
  "total": 89,
  "page": 1,
  "pageSize": 20
}
```

#### GET `/articles/{id}`
```typescript
// Request - Get single article
GET /api/v1/articles/65f1234567890abcdef12345

// Response - Same as individual article object above
```

#### POST `/articles` (Create new article)
```typescript
// Request
POST /api/v1/articles
Headers: { Authorization: Bearer <token>, credentials: 'include' }
{
  "title": "Solar Energy Revolution",
  "subtitle": "Optional subtitle",  // optional
  "bodyMd": "# Article\n\nMarkdown content",  // default: ""
  "readTime": "5 min",  // optional
  "coverImage": "https://...",  // optional
  "publishDate": "2026-03-27T10:00:00Z",  // optional
  "status": "published",  // "draft" | "published", default: "published"
  "featured": true,  // default: false
  "tags": ["solar", "renewable"]  // default: []
}

// Response (201 Created)
// Returns created article with _id and timestamps
```

#### PUT `/articles/{id}` (Update article)
```typescript
// Request
PUT /api/v1/articles/65f1234567890abcdef12345
Headers: { Authorization: Bearer <token>, credentials: 'include' }
{
  // Any fields from POST schema (all fields optional for PUT)
  "status": "published",
  "featured": true
}

// Response - Returns updated article
```

**Required Role for POST/PUT:** `superadmin`, `admin`, or `editor`

---

## 🔐 Authentication Flow Example

```typescript
// 1. Login
const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@zthorbit.com',
    password: 'your-password'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. Use token for authenticated requests
const dashboardResponse = await fetch('http://localhost:4000/api/v1/admin/summary', {
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  }
});

const dashboardData = await dashboardResponse.json();

// 3. Handle token expiration (401)
if (dashboardResponse.status === 401) {
  // Refresh token
  const refreshResponse = await fetch('http://localhost:4000/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refreshToken')
    })
  });
  
  const { accessToken: newToken } = await refreshResponse.json();
  localStorage.setItem('accessToken', newToken);
  
  // Retry original request
  // ...
}
```

---

## 🎯 API Client Helper (Recommended)

Create `src/utils/apiClient.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Auto-refresh on 401
  if (response.status === 401 && endpoint !== '/auth/refresh') {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      localStorage.setItem('accessToken', accessToken);

      // Retry original request
      return apiRequest(endpoint, options);
    } else {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}

// Usage examples:
export const dashboardApi = {
  getSummary: (from?: string, to?: string) => {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    return apiRequest(`/admin/summary?${query}`).then(r => r.json());
  },
};

export const notificationsApi = {
  list: (page = 1, limit = 20, isUnread?: boolean) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (isUnread !== undefined) query.set('isUnread', String(isUnread));
    return apiRequest(`/notifications?${query}`).then(r => r.json());
  },
  
  markRead: (id: string) =>
    apiRequest(`/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isUnread: false }),
    }).then(r => r.json()),
  
  markAllRead: () =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }),
};

export const postsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );
    return apiRequest(`/posts?${query}`).then(r => r.json());
  },
  
  getById: (id: string) =>
    apiRequest(`/posts/${id}`).then(r => r.json()),
};

export const usersApi = {
  list: (page = 1, pageSize = 20) =>
    apiRequest(`/users?page=${page}&pageSize=${pageSize}`).then(r => r.json()),
  
  updateStatus: (id: string, status: 'active' | 'inactive') =>
    apiRequest(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then(r => r.json()),
};

export const articlesApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; tag?: string; featured?: boolean; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.search) query.set('search', params.search);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.status) query.set('status', params.status);
    return apiRequest(`/articles?${query}`).then(r => r.json());
  },
  
  getById: (id: string) =>
    apiRequest(`/articles/${id}`).then(r => r.json()),
};
```

---

## ⚠️ Common Issues & Solutions

### Issue: CORS errors
**Solution:** 
1. Ensure backend `server/.env` has your frontend URL in `CORS_ORIGINS`:
   ```bash
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
2. Always include `credentials: 'include'` in fetch requests
3. Restart backend after changing `.env`

See [CORS-TROUBLESHOOTING.md](CORS-TROUBLESHOOTING.md) for detailed debugging.

### Issue: 401 Unauthorized
**Solutions:**
- Token expired → Use refresh token endpoint
- No token → User needs to login
- Invalid token → Force re-login

### Issue: 403 Forbidden
**Causes:**
- Email not verified (for login)
- Insufficient role permissions (for admin endpoints)

### Issue: Different pagination params
**Note:** Some endpoints use `limit`, others use `pageSize`:
- ✅ `/notifications`, `/posts`, `/media` → use `limit`
- ✅ `/users`, `/articles` → use `pageSize`

---

## 📊 Quick Reference Table

| Feature | Endpoint | Method | Auth Required | Pagination Param |
|---------|----------|--------|---------------|------------------|
| Login | `/auth/login` | POST | ❌ No | - |
| Dashboard | `/admin/summary` | GET | ✅ Yes (admin+) | - |
| Notifications List | `/notifications` | GET | ✅ Yes | `limit` |
| Mark Read | `/notifications/{id}` | PATCH | ✅ Yes | - |
| Mark All Read | `/notifications/read-all` | PATCH | ✅ Yes | - |
| Posts List | `/posts` | GET | ❌ No | `limit` |
| Users List | `/users` | GET | ✅ Yes (admin+) | `pageSize` |
| Update User | `/users/{id}/status` | PATCH | ✅ Yes (admin+) | - |
| Articles List | `/articles` | GET | ❌ No | `pageSize` |
| Media List | `/media` | GET | ❌ No | `limit` |

---

## 🚀 Migration Checklist

Replace your mock data with real APIs:

**Dashboard Overview:**
- [ ] Replace mock dashboard stats with `GET /admin/summary`
- [ ] Parse `metrics`, `trendingPodcastCategory`, `trendingArticleCategory`
- [ ] Wire up date range filters (`from`, `to` query params)

**Notifications:**
- [ ] Replace mock notifications with `GET /notifications`
- [ ] Implement mark as read: `PATCH /notifications/{id}`
- [ ] Implement mark all read: `PATCH /notifications/read-all`
- [ ] Update badge count from `meta.total` with `isUnread=true` filter

**Posts/Blog:**
- [ ] Replace mock posts with `GET /posts`
- [ ] Implement search, category filter, sort
- [ ] Parse pagination from `meta` object

**Users:**
- [ ] Replace mock users with `GET /users`
- [ ] Note: Uses `pageSize` not `limit`!
- [ ] Implement status toggle: `PATCH /users/{id}/status`

**Articles:**
- [ ] Replace mock articles with `GET /articles`
- [ ] Note: Uses `pageSize` not `limit`!
- [ ] Implement filters (tag, featured, status, search)

---

## 📞 Need Help?

**Backend Team Contact:** [Specify contact method]

**Common Questions:**
- Test account password → Ask backend team
- CORS issues → See [CORS-TROUBLESHOOTING.md](CORS-TROUBLESHOOTING.md)
- API discrepancies → Refer to [BACKEND-INTEGRATION-QUESTIONS.md](BACKEND-INTEGRATION-QUESTIONS.md)

**Additional Resources:**
- Full API docs: [server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)
- Frontend integration guide: [server/FRONTEND_INTEGRATION.md](server/FRONTEND_INTEGRATION.md)
- OpenAPI spec: [server/openapi.yaml](server/openapi.yaml)

---

**Document Version:** 1.0  
**Last Verified:** March 27, 2026  
**Backend API Version:** v1
