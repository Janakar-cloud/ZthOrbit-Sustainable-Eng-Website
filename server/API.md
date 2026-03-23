# GreenTvDashboard API (v0.1.0)

Spec: OpenAPI 3.1.0 at `server/openapi.yaml`.
Servers: production and staging URLs are placeholders in the spec; fill in real hosts when ready.

## Auth & Headers
- Bearer JWT on all protected routes: `Authorization: Bearer <accessToken>`
- Auth endpoints
  - `POST /api/auth/login` — body { email, password } ⇒ { accessToken, refreshToken, user }
  - `POST /api/auth/refresh` — body { refreshToken } ⇒ { accessToken }
  - `POST /api/auth/forgot-password` — body { email } ⇒ 204
  - `POST /api/auth/reset-password` — body { token, newPassword } ⇒ 204

## Common Shapes
- Error: `{ status, code, message, details?, traceId? }`
- Pagination meta: `{ page, limit, total }`

## Users
- `GET /api/users` — list (query: page, limit, search, status, role, sort, order)
- `POST /api/users` — create (multipart: name, email, role, status?, avatar?, instagram?, facebook?)
- `GET /api/users/{id}` — fetch
- `PUT /api/users/{id}` — update
- `DELETE /api/users/{id}` — delete
- `PATCH /api/users/{id}/status` — update status

## Media
- `GET /api/media` — list (page, limit, search, category, menu, mediaType, status)
- `POST /api/media` — upload (multipart: file, thumbnail?, mediaType, title, description?, menu, category, tags?, duration?)
- `GET /api/media/{id}` — fetch
- `PUT /api/media/{id}` — update metadata
- `DELETE /api/media/{id}` — delete
- `PATCH /api/media/{id}/status` — encoder callback (status, fileUrl?, thumbnailUrl?, duration?)

## Articles
- `GET /api/articles` — list (page, limit, search, status, category, sort)
- `POST /api/articles` — create (multipart: title, subTitle?, category, status?, tags?, cover?, content?)
- `GET /api/articles/{id}` — fetch
- `PUT /api/articles/{id}` — update
- `DELETE /api/articles/{id}` — delete
- `PATCH /api/articles/{id}/status` — publish/draft

## Posts (blog)
- `GET /api/posts` — list (page, limit, search, category, sort)
- `POST /api/posts` — create (body matches Post schema)
- `GET /api/posts/{id}` — fetch
- `PUT /api/posts/{id}` — update
- `DELETE /api/posts/{id}` — delete

## Notifications
- `GET /api/notifications` — list (page, limit, isUnread?)
- `DELETE /api/notifications` — delete all
- `PATCH /api/notifications/{id}` — mark read/unread (isUnread)
- `DELETE /api/notifications/{id}` — delete one
- `PATCH /api/notifications/read-all` — mark all read

## Dashboard
- `GET /api/dashboard/summary` — aggregated metrics (query: from, to, interval)

## Reference Data
- `GET /api/categories` — list categories (type: media | article | post)
- `GET /api/menus` — list menus
- `GET /api/tags` — list tags (type: article | media)

## Key Schemas (abbrev)
- User: { id, name, email, role (Admin|User|Moderator), status (active|inactive|banned), isVerified, avatarUrl?, socials? }
- MediaItem: { id, title, mediaType (video|audio), menu (LiveTv|Podcast), category, tags[], status, fileUrl?, thumbnailUrl?, duration?, createdAt }
- Article: { id, title, subTitle?, category, status, tags[], coverUrl?, content?, publishedAt?, author? }
- Post: { id, title, description?, coverUrl, totals..., postedAt, author }
- Notification: { id, title, description?, avatarUrl|null, type, postedAt, isUnread }
- DashboardSummary: { metrics, trendingPodcastCategory, trendingArticleCategory, usersStatus[], recentActivity[] }

For full request/response details and examples, see the OpenAPI file.
