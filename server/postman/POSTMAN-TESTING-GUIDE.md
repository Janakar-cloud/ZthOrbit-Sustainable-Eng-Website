# Postman API Testing Guide

Comprehensive guide for testing all ZthOrbit backend APIs using Postman.

## Quick Start

1. **Import Collections** into Postman:
   - `server/postman/comprehensive-api-tests.postman_collection.json` (Main collection)
   - `server/postman/zthorbit-test-environment.postman_environment.json` (Environment)

2. **Set Environment Variables**:
   - `baseUrl`: `http://13.205.72.30/api/v1`
   - `superadminEmail`: `janakar.ganesan@gmail.com`
   - `superadminPassword`: `ChangeMe123!`

3. **Run "0-Setup" folder** to login and get tokens

4. **Run entire collection** with Collection Runner or Newman

---

## API Endpoints Overview

### Authentication (No Auth Required)
- `POST /auth/register` - Register new user (returns 202, needs email verification)
- `POST /auth/login` - Login with email/password
- `POST /auth/verify-email` - Verify email with 6-digit code
- `POST /auth/resend-verification` - Resend verification code
- `POST /auth/request-reset` - Request password reset
- `POST /auth/reset` - Reset password with token
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)

### Live Streaming
- `GET /live/config` - Get live stream configuration (Public)
- `PUT /live/config` - Update live config (Admin+)

### Videos
- `GET /videos` - List published videos (Public, supports pagination & filters)
- `GET /videos/:id` - Get single video by ID (Public)
- `POST /videos` - Create video (Editor+)
- `PUT /videos/:id` - Update video (Editor+)
- `DELETE /videos/:id` - Delete video (Superadmin only)

### Podcasts
- `GET /podcasts` - List podcasts (Public)
- `POST /podcasts` - Create podcast (Editor+)
- `PUT /podcasts/:id` - Update podcast (Editor+)
- `DELETE /podcasts/:id` - Delete podcast (Admin+)
- `POST /podcasts/:id/comments` - Add comment (Public)
- `GET /podcasts/:id/comments` - Get approved comments (Public)
- `GET /podcasts/:id/comments/all` - Get all comments (Editor+)
- `PATCH /podcasts/:podcastId/comments/:commentId/status` - Moderate comment (Editor+)
- `DELETE /podcasts/:podcastId/comments/:commentId` - Delete comment (Admin+)

### Articles
- `GET /articles` - List articles (Public)
- `GET /articles/:id` - Get single article (Public)
- `POST /articles` - Create article (Editor+)
- `PUT /articles/:id` - Update article (Editor+)
- `DELETE /articles/:id` - Delete article (Admin+)
- `PATCH /articles/:id/status` - Change article status (Editor+)

### Case Stories
- `GET /case-stories` - List case stories (Public)
- `GET /case-stories/:id` - Get single case story (Public)
- `POST /case-stories` - Create case story (Editor+)
- `PUT /case-stories/:id` - Update case story (Editor+)
- `DELETE /case-stories/:id` - Delete case story (Admin+)

### About Blocks
- `GET /about` - Get all about blocks (Public)
- `POST /about` - Create about block (Editor+)
- `PUT /about/:id` - Update about block (Editor+)
- `DELETE /about/:id` - Delete about block (Admin+)

### Tags
- `GET /tags` - List all tags (Public)
- `POST /tags` - Create tag (Editor+)
- `DELETE /tags/:id` - Delete tag (Admin+)

### Media (Unified Content)
- `GET /media` - List media items (Public, supports pagination & filters)
- `GET /media/:id` - Get single media item (Public)
- `POST /media` - Create media (Editor+)
- `PUT /media/:id` - Update media (Editor+)
- `DELETE /media/:id` - Delete media (Admin+)
- `PATCH /media/:id/status` - Change media status (Editor+)

### Posts
- `GET /posts` - List posts (Public)
- `GET /posts/:id` - Get single post (Public)
- `POST /posts` - Create post (Editor+)
- `PUT /posts/:id` - Update post (Editor+)
- `DELETE /posts/:id` - Delete post (Admin+)

### Notifications
- `GET /notifications` - Get user notifications (Authenticated)
- `PATCH /notifications/:id` - Mark notification as read (Authenticated)
- `PATCH /notifications/read-all` - Mark all as read (Authenticated)
- `DELETE /notifications/:id` - Delete notification (Authenticated)
- `DELETE /notifications` - Delete all notifications (Authenticated)

### Users Management
- `GET /users` - List users (Editor+, supports pagination)
- `POST /users` - Create user (Admin+)
- `PUT /users/:id` - Update user (Admin+)
- `DELETE /users/:id` - Delete user (Admin+)
- `PATCH /users/:id/status` - Change user status (Admin+)

### Admin Dashboard
- `GET /admin/summary` - Get dashboard summary stats (Editor+)
- `POST /admin/test-email` - Test email configuration (Editor+)

### Reference Data
- `GET /api/categories` - Get all categories (Public)
- `GET /api/menus` - Get menu structure (Public)
- `GET /api/tags` - Get all tags (Public)

### Search
- `GET /search` - Global search across content (Public, query param: `q`)

### File Uploads
- `POST /uploads/presign` - Get pre-signed S3 upload URL (Editor+)

---

## Test Workflow

### 1. Setup & Authentication

```bash
# Run tests in this sequence:
1. POST /auth/login → Stores access & refresh tokens
2. Verify token is set in environment
```

**Expected Response (200)**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "long-hex-string..."
}
```

**Automated Test Script**:
```javascript
pm.test('Login successful', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json).to.have.property('accessToken');
  pm.expect(json).to.have.property('refreshToken');
  
  // Store tokens for subsequent requests
  pm.environment.set('accessToken', json.accessToken);
  pm.environment.set('refreshToken', json.refreshToken);
});
```

---

### 2. Public Endpoints (No Auth)

Test these without authentication:

```bash
GET /live/config
GET /videos
GET /videos/:id
GET /podcasts
GET /articles
GET /case-stories
GET /about
GET /tags
GET /media
GET /posts
GET /api/categories
GET /api/menus
GET /api/tags
GET /search?q=sustainability
```

**Test Scripts** (Add to each):
```javascript
pm.test('Status is 200', () => {
  pm.response.to.have.status(200);
});

pm.test('Response is JSON', () => {
  pm.response.to.be.json;
});

pm.test('Has expected structure', () => {
  const json = pm.response.json();
  // Add specific assertions based on endpoint
  pm.expect(json).to.be.an('object');
});
```

---

### 3. Protected Endpoints (Auth Required)

**Test Permission Levels**:

#### Editor+ (Superadmin, Admin, Editor)
```bash
POST /videos (create)
PUT /videos/:id (update)
POST /articles (create)
PUT /articles/:id (update)
POST /case-stories (create)
PUT /case-stories/:id (update)
POST /about (create)
PUT /about/:id (update)
POST /tags (create)
POST /media (create)
PUT /media/:id (update)
POST /posts (create)
PUT /posts/:id (update)
POST /uploads/presign
GET /admin/summary
POST /admin/test-email
```

#### Admin+ (Superadmin, Admin)
```bash
POST /users (create user)
PUT /users/:id (update user)
DELETE /users/:id (delete user)
PATCH /users/:id/status (change status)
DELETE /videos/:id (delete - wait, this is Superadmin only!)
DELETE /articles/:id
DELETE /case-stories/:id
DELETE /about/:id
DELETE /tags/:id
DELETE /media/:id
DELETE /posts/:id
DELETE /podcasts/:id
DELETE /podcasts/:podcastId/comments/:commentId
```

#### Superadmin Only
```bash
DELETE /videos/:id
```

**Authorization Test Script** (for protected routes):
```javascript
pm.test('Auth required - 401 without token', () => {
  // Run request without Authorization header
  // pm.response.to.have.status(401);
});

pm.test('Forbidden for insufficient role - 403', () => {
  // Run with viewer token on editor+ endpoint
  // pm.response.to.have.status(403);
});

pm.test('Success with correct role - 200/201', () => {
  pm.response.to.be.oneOf([200, 201, 204]);
});
```

---

### 4. CRUD Test Sequences

#### Example: Videos CRUD

1. **CREATE** (POST /videos):
```json
{
  "title": "Test Video {{$timestamp}}",
  "description": "Automated test video",
  "streamUrl": "https://example.com/test.m3u8",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "status": "published",
  "isLive": false,
  "tags": []
}
```

**Test Script**:
```javascript
pm.test('Video created - 201', () => {
  pm.response.to.have.status(201);
  const json = pm.response.json();
  pm.expect(json).to.have.property('_id');
  pm.expect(json).to.have.property('title');
  
  // Store ID for subsequent tests
  pm.environment.set('lastVideoId', json._id);
});
```

2. **READ** (GET /videos/:id):
```javascript
pm.test('Video retrieved - 200', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json._id).to.equal(pm.environment.get('lastVideoId'));
  pm.expect(json.title).to.include('Test Video');
});
```

3. **UPDATE** (PUT /videos/:id):
```json
{
  "title": "Updated Test Video",
  "description": "Updated description"
}
```

**Test Script**:
```javascript
pm.test('Video updated - 200', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json.title).to.equal('Updated Test Video');
});
```

4. **DELETE** (DELETE /videos/:id):
```javascript
pm.test('Video deleted - 204 or 403', () => {
  // 204 if superadmin, 403 if not
  pm.expect([204, 403]).to.include(pm.response.code);
});

if (pm.response.code === 204) {
  // Verify deletion
  pm.sendRequest({
    url: pm.environment.get('baseUrl') + '/videos/' + pm.environment.get('lastVideoId'),
    method: 'GET'
  }, (err, res) => {
    pm.test('Video not found after delete - 404', () => {
      pm.expect(res.code).to.equal(404);
    });
  });
}
```

---

### 5. Pagination & Filtering Tests

#### Endpoints Supporting Pagination:
- GET /videos
- GET /podcasts
- GET /articles
- GET /case-stories
- GET /media
- GET /posts
- GET /users

**Query Parameters**:
- `limit`: Number of items (default: 10, max: 100)
- `skip`: Number to skip (default: 0)
- `page`: Page number (alternative to skip)
- `pageSize`: Items per page (alternative to limit)

**Example Test**:
```javascript
// GET /videos?limit=5&skip=0
pm.test('Pagination works', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json.videos).to.be.an('array');
  pm.expect(json.videos.length).to.be.at.most(5);
  pm.expect(json).to.have.property('total');
});
```

#### Filtering Tests:
```bash
GET /videos?status=published
GET /videos?tags=<tagId>
GET /articles?featured=true
GET /media?kind=video
GET /media?status=published
GET /search?q=sustainability
GET /api/categories?kind=category
```

**Filter Test Script**:
```javascript
pm.test('Filtering works', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json.videos).to.be.an('array');
  
  // Verify all items match filter
  json.videos.forEach(video => {
    pm.expect(video.status).to.equal('published');
  });
});
```

---

### 6. Error Handling Tests

#### Test Error Responses:

1. **401 Unauthorized** (No token):
```javascript
pm.test('401 without auth token', () => {
  // Remove Authorization header
  pm.response.to.have.status(401);
  pm.expect(pm.response.json()).to.have.property('error');
});
```

2. **403 Forbidden** (Insufficient permissions):
```javascript
pm.test('403 for insufficient role', () => {
  pm.response.to.have.status(403);
  const json = pm.response.json();
  pm.expect(json.error).to.include('Forbidden');
});
```

3. **404 Not Found**:
```javascript
pm.test('404 for non-existent resource', () => {
  // GET /videos/507f1f77bcf86cd799439011
  pm.response.to.have.status(404);
});
```

4. **400 Bad Request** (Validation errors):
```javascript
pm.test('400 for invalid data', () => {
  // POST /videos with empty title
  pm.response.to.have.status(400);
  const json = pm.response.json();
  pm.expect(json).to.have.property('error');
});
```

---

### 7. Advanced Test Scenarios

#### Podcast Comments Flow:

1. Create podcast
2. Add comment (public)
3. Get comments (verify pending)
4. Approve comment (editor+)
5. Get comments again (verify approved shows)
6. Delete comment (admin+)

**Test Chain**:
```javascript
// 1. Create podcast (save ID)
// 2. POST /podcasts/:id/comments
pm.test('Comment added', () => {
  pm.response.to.have.status(201);
  pm.environment.set('lastCommentId', pm.response.json()._id);
});

// 3. GET /podcasts/:id/comments (public - shouldn't see pending)
pm.test('Pending comments not visible publicly', () => {
  const comments = pm.response.json();
  pm.expect(comments.every(c => c.status === 'approved')).to.be.true;
});

// 4. PATCH /podcasts/:podcastId/comments/:commentId/status
pm.test('Comment approved', () => {
  pm.response.to.have.status(200);
  pm.expect(pm.response.json().status).to.equal('approved');
});

// 5. GET /podcasts/:id/comments (verify now visible)
pm.test('Approved comment now visible', () => {
  const comments = pm.response.json();
  const found = comments.find(c => c._id === pm.environment.get('lastCommentId'));
  pm.expect(found).to.exist;
});
```

#### File Upload Flow:

1. **Request pre-signed URL**:
```javascript
// POST /uploads/presign
{
  "fileName": "test-image.jpg",
  "fileType": "image/jpeg"
}

pm.test('Presigned URL received', () => {
  pm.response.to.have.status(200);
  const json = pm.response.json();
  pm.expect(json).to.have.property('uploadUrl');
  pm.expect(json).to.have.property('fileUrl');
  pm.environment.set('uploadUrl', json.uploadUrl);
  pm.environment.set('fileUrl', json.fileUrl);
});
```

2. **Upload to S3** (external, not in Postman collection)
3. **Use fileUrl in content** (e.g., video thumbnailUrl)

---

## Running Tests

### Option 1: Postman UI

1. Open Postman
2. Import collection and environment
3. Select "ZthOrbit Test Environment"
4. Run entire collection with **Collection Runner**:
   - Click "..." on collection → Run collection
   - Select environment
   - Click "Run ZthOrbit Comprehensive API Tests"
   - View results

### Option 2: Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
cd server/postman
newman run comprehensive-api-tests.postman_collection.json \
  -e zthorbit-test-environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export ./test-report.html

# Run with delay between requests (avoid rate limiting)
newman run comprehensive-api-tests.postman_collection.json \
  -e zthorbit-test-environment.postman_environment.json \
  --delay-request 100

# Run specific folder
newman run comprehensive-api-tests.postman_collection.json \
  --folder "Videos" \
  -e zthorbit-test-environment.postman_environment.json
```

### Option 3: CI/CD Integration

**GitHub Actions Example**:
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run Postman Tests
        run: |
          cd server/postman
          newman run comprehensive-api-tests.postman_collection.json \
            -e zthorbit-test-environment.postman_environment.json \
            --reporters cli,junit \
            --reporter-junit-export ./results.xml
      
      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v2
        if: always()
        with:
          files: server/postman/results.xml
```

---

## Test Coverage Summary

| Category | Endpoints | Tests |
|----------|-----------|-------|
| Auth | 8 | 24 |
| Videos | 4 | 16 |
| Podcasts | 9 | 27 |
| Articles | 6 | 18 |
| Case Stories | 5 | 15 |
| About | 4 | 12 |
| Tags | 3 | 9 |
| Media | 6 | 18 |
| Posts | 5 | 15 |
| Notifications | 5 | 15 |
| Users | 5 | 15 |
| Admin | 2 | 6 |
| Reference | 3 | 9 |
| Search | 1 | 3 |
| Uploads | 1 | 3 |
| Live | 2 | 6 |
| **TOTAL** | **69** | **207+** |

---

## Expected Test Results

### Successful Run Output (Newman):

```
ZthOrbit Comprehensive API Tests

→ 0-Setup / Login
  POST http://13.205.72.30/api/v1/auth/login [200 OK, 1.2KB, 245ms]
  ✓ Login successful
  ✓ Token stored

→ Videos / List Videos
  GET http://13.205.72.30/api/v1/videos [200 OK, 3.5KB, 189ms]
  ✓ Status is 200
  ✓ Response is array

... (more tests)

┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              iterations │        1 │        0 │
├─────────────────────────┼──────────┼──────────┤
│                requests │       69 │        0 │
├─────────────────────────┼──────────┼──────────┤
│            test-scripts │      138 │        0 │
├─────────────────────────┼──────────┼──────────┤
│      prerequest-scripts │       69 │        0 │
├─────────────────────────┼──────────┼──────────┤
│              assertions │      207 │        0 │
├─────────────────────────┴──────────┴──────────┤
│ total run duration: 15s                       │
├───────────────────────────────────────────────┤
│ total data received: 125KB (approx)           │
├───────────────────────────────────────────────┤
│ average response time: 217ms                  │
└───────────────────────────────────────────────┘
```

---

## Troubleshooting

### No access token / 401 errors
**Solution**: Run "0-Setup / Login" request first

### 403 Forbidden on delete operations
**Solution**: Ensure logged in as superadmin (`janakar.ganesan@gmail.com`)

### 404 on all /api/v1/* routes
**Solution**: Check Nginx configuration - ensure `proxy_pass` preserves `/api` prefix

### Rate limiting (429 errors)
**Solution**: Add delay between requests: `newman run ... --delay-request 200`

### Connection refused
**Solution**: Ensure backend is running (`pm2 status thegreentv-api`)

---

## Best Practices

1. **Always run setup first** - Login to get fresh tokens
2. **Use collection variables** - Store IDs for cleanup
3. **Test both success and failure** - Include negative test cases
4. **Verify permissions** - Test each role level
5. **Clean up after tests** - Delete created test data
6. **Use dynamic data** - `{{$timestamp}}`, `{{$randomInt}}` for unique values
7. **Chain requests** - Use pm.sendRequest for dependency chains
8. **Assert response structure** - Don't just check status codes
9. **Log useful info** - console.log() in test scripts for debugging
10. **Run regularly** - Integrate into CI/CD pipeline

---

## Next Steps

1. ✅ Import collection into Postman
2. ✅ Set environment variables
3. ✅ Run entire collection
4. 📝 Review failures and fix
5. 🔄 Add to CI/CD pipeline
6. 🎯 Aim for 100% pass rate

---

**Last Updated**: 2026-03-26  
**Collection Version**: 1.0.0  
**Maintainer**: Development Team
