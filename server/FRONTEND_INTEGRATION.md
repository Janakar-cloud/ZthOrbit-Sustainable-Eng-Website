# Frontend Integration Guide 🚀

## Overview
This guide helps the dashboard frontend team integrate with the ZthOrbit backend API using the unified `/media` endpoint and new dashboard features.

---

## Base Configuration

```typescript
// config/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zthorbit.com/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
};

// Add auth token to requests
export function setAuthToken(token: string) {
  if (token) {
    apiClient.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.headers['Authorization'];
  }
}
```

---

## Authentication Flow

### 1. Register New User
```typescript
async function register(email: string, password: string, name?: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json(); // { message: "Verification code sent..." }
}
```

### 2. Verify Email
```typescript
async function verifyEmail(email: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  setAuthToken(data.accessToken);
  
  return data;
}
```

### 3. Login
```typescript
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (response.status === 403) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }
  
  const data = await response.json();
  
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  setAuthToken(data.accessToken);
  
  return data;
}
```

### 4. Refresh Token
```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  localStorage.setItem('accessToken', data.accessToken);
  setAuthToken(data.accessToken);
  
  return data.accessToken;
}
```

---

## Unified Media API ⭐

### Fetch Media Items
```typescript
interface MediaItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'video' | 'audio';
  menu: 'LiveTv' | 'Podcast';
  category?: string;
  tags?: string[];
  duration: number; // seconds
  fileUrl: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

async function getMedia(params: {
  page?: number;
  limit?: number;
  search?: string;
  menu?: 'LiveTv' | 'Podcast';
  mediaType?: 'video' | 'audio';
  category?: string;
  status?: 'processing' | 'ready' | 'failed';
}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );
  
  const response = await fetch(`${API_BASE_URL}/media?${query}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  
  return await response.json(); // { data: MediaItem[], meta: { page, limit, total } }
}

// Examples:
// Get all LiveTV videos
const videos = await getMedia({ menu: 'LiveTv', mediaType: 'video' });

// Get all podcasts
const podcasts = await getMedia({ menu: 'Podcast', mediaType: 'audio' });

// Search across all media
const searchResults = await getMedia({ search: 'climate' });

// Get processing media
const processingMedia = await getMedia({ status: 'processing' });
```

### Create Media Item
```typescript
async function createMedia(data: {
  title: string;
  description?: string;
  mediaType: 'video' | 'audio';
  menu: 'LiveTv' | 'Podcast';
  category?: string;
  tags?: string[];
  duration?: number;
  fileUrl: string;
  thumbnailUrl?: string;
  status?: 'processing' | 'ready' | 'failed';
}) {
  const response = await fetch(`${API_BASE_URL}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });
  
  return await response.json();
}
```

### Update Media Status
```typescript
async function updateMediaStatus(
  id: string,
  status: 'processing' | 'ready' | 'failed',
  updates?: { fileUrl?: string; thumbnailUrl?: string; duration?: number }
) {
  const response = await fetch(`${API_BASE_URL}/media/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify({ status, ...updates }),
  });
  
  return await response.json();
}
```

---

## Dashboard Analytics

### Fetch Dashboard Summary
```typescript
interface DashboardSummary {
  metrics: {
    numberOfVideo: number;
    totalUsers: number;
    onlineUsers: number;
    totalPodcasts: number;
  };
  trendingPodcastCategory: {
    categories: string[];
    series: { name: string; data: number[] }[];
  };
  trendingArticleCategory: {
    categories: string[];
    series: { name: string; data: number[] }[];
  };
  usersStatus: { label: string; value: number }[];
  recentActivity: Post[];
}

async function getDashboardSummary(params?: {
  from?: string; // ISO date
  to?: string;   // ISO date
}) {
  const query = params ? `?${new URLSearchParams(params as any)}` : '';
  
  const response = await fetch(`${API_BASE_URL}/admin/summary${query}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  
  return await response.json() as DashboardSummary;
}
```

---

## Notifications

### Fetch Notifications
```typescript
interface Notification {
  id: string;
  title: string;
  description: string;
  avatarUrl?: string;
  type: string;
  postedAt: string;
  isUnread: boolean;
}

async function getNotifications(params?: {
  page?: number;
  limit?: number;
  isUnread?: boolean;
}) {
  const query = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );
  
  const response = await fetch(`${API_BASE_URL}/notifications?${query}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  
  return await response.json(); // { data: Notification[], meta: { page, limit, total } }
}
```

### Mark as Read
```typescript
async function markNotificationRead(id: string, isUnread: boolean = false) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify({ isUnread }),
  });
  
  return await response.json();
}

async function markAllRead() {
  await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
}
```

---

## Reference Data (Dropdowns/Filters)

### Get Categories
```typescript
async function getCategories(type?: 'media' | 'article' | 'post') {
  const query = type ? `?type=${type}` : '';
  const response = await fetch(`${API_BASE_URL}/api/categories${query}`);
  return await response.json(); // { data: string[] }
}
```

### Get Menus
```typescript
async function getMenus() {
  const response = await fetch(`${API_BASE_URL}/api/menus`);
  return await response.json(); // { data: ['LiveTv', 'Podcast'] }
}
```

### Get Tags
```typescript
async function getTags(type?: 'article' | 'media') {
  const query = type ? `?type=${type}` : '';
  const response = await fetch(`${API_BASE_URL}/api/tags${query}`);
  return await response.json(); // { data: string[] }
}
```

---

## Blog Posts

### Fetch Posts
```typescript
interface Post {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  totalFavorites: number;
  postedAt: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
}

async function getPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: 'latest' | 'popular' | 'oldest';
}) {
  const query = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );
  
  const response = await fetch(`${API_BASE_URL}/posts?${query}`);
  return await response.json(); // { data: Post[], meta: { page, limit, total } }
}
```

---

## User Management

### Fetch Users
```typescript
async function getUsers(page = 1, pageSize = 20) {
  const response = await fetch(
    `${API_BASE_URL}/users?page=${page}&pageSize=${pageSize}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    }
  );
  
  return await response.json();
}
```

### Update User Status
```typescript
async function updateUserStatus(userId: string, status: 'active' | 'inactive') {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify({ status }),
  });
  
  return await response.json();
}
```

---

## Error Handling

```typescript
async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // Try to refresh token
      try {
        await refreshAccessToken();
        
        // Retry original request
        return await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            ...options.headers,
          },
        });
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## Environment Variables

Create a `.env.local` file in your frontend project:

```env
NEXT_PUBLIC_API_URL=https://api.zthorbit.com/api
```

For development:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Migration from Legacy Endpoints

### Videos → Media
```typescript
// ❌ OLD (deprecated)
const videos = await fetch('/api/videos?tag=climate');

// ✅ NEW (recommended)
const videos = await getMedia({ 
  menu: 'LiveTv', 
  mediaType: 'video', 
  category: 'climate' 
});
```

### Podcasts → Media
```typescript
// ❌ OLD (deprecated)
const podcasts = await fetch('/api/podcasts');

// ✅ NEW (recommended)
const podcasts = await getMedia({ 
  menu: 'Podcast', 
  mediaType: 'audio' 
});
```

---

## Test Credentials

For development/testing:

**Admin Account:**
- Email: `admin@zthorbit.com`
- Password: Contact backend team

**Editor Account:**
- Email: `editor@zthorbit.com`
- Password: Contact backend team

---

## API Documentation

- **Full API Docs:** See `server/API_DOCUMENTATION.md`
- **OpenAPI Spec:** See `server/openapi.yaml`
- **Postman Collection:** Available on request

---

## Support

For API access, credentials, or integration issues:
- **Backend Team:** Contact your administrator
- **API Version:** 1.0
- **Last Updated:** March 26, 2026
