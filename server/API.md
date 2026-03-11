# ZthOrbit Backend API (v1)

Base URL: `/api/v1`

## Auth
- `POST /auth/register` — email, password, name; returns accessToken + refreshToken
- `POST /auth/login` — email, password; returns accessToken + refreshToken
- `POST /auth/refresh` — body { refreshToken }; returns accessToken
- `POST /auth/logout` — body { refreshToken }; revokes stored token
- `POST /auth/request-reset` — body { email }; sends reset email if SMTP configured
- `POST /auth/reset` — body { token, password }; resets password

### Headers
- Authenticated routes require `Authorization: Bearer <accessToken>`

## Admin
- `GET /admin/summary` — counts (admin/editor)
- `POST /admin/test-email` — optional body { to }; sends SMTP test (admin/editor)

## Users (admin)
- `GET /users?page=&pageSize=` — paginated list
- `POST /users` — create { email, password, role, name, status }
- `PUT /users/:id` — update { name?, role?, status?, password? }
- `DELETE /users/:id`

## Live
- `GET /live/config` — public
- `PUT /live/config` — (admin/editor) { streamUrl, title, description }

## Videos
- `GET /videos?page=&pageSize=&tag=&status=` — paginated list
- `POST /videos` — (admin/editor) { title, streamUrl, ... }
- `PUT /videos/:id` — (admin/editor)
- `DELETE /videos/:id` — (admin)

## Podcasts
- `GET /podcasts?page=&pageSize=&tag=&status=` — paginated list
- `POST /podcasts` — (admin/editor)
- `PUT /podcasts/:id` — (admin/editor)
- `DELETE /podcasts/:id` — (admin)
- `POST /podcasts/:id/comments` — public { author, message }
- `GET /podcasts/:id/comments` — public

## Articles
- `GET /articles?page=&pageSize=&tag=&featured=&status=` — paginated list
- `GET /articles/:id`
- `POST /articles` — (admin/editor)
- `PUT /articles/:id` — (admin/editor)
- `DELETE /articles/:id` — (admin)

## Case Stories
- `GET /case-stories?page=&pageSize=&tag=` — paginated list
- `GET /case-stories/:id`
- `POST /case-stories` — (admin/editor)
- `PUT /case-stories/:id` — (admin/editor)
- `DELETE /case-stories/:id` — (admin)

## About
- `GET /about` — list blocks
- `POST /about` — (admin/editor)
- `PUT /about/:id` — (admin/editor)
- `DELETE /about/:id` — (admin)

## Tags
- `GET /tags`
- `POST /tags` — (admin/editor)
- `DELETE /tags/:id` — (admin)

## Uploads (S3 presign)
- `POST /uploads/presign` — (admin/editor) body { prefix, contentType }; returns presigned URL

## Pagination shape
Responses with pagination return `{ items, total, page, pageSize }`.

## Env (server/.env)
- Mongo/JWT: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- App URL: `APP_URL`
- CORS: `CORS_ORIGINS`
- AWS S3: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- SMTP (used for password reset emails and test-email endpoint):
	- `SMTP_HOST` (set to `smtp.gmail.com`)
	- `SMTP_PORT` (set to `465`)
	- `SMTP_SECURE` (`true` for SSL)
	- `SMTP_USER` (`greentvsupport@gmail.com`)
	- `SMTP_PASS` (Gmail app password)
	- `SMTP_FROM` (`"Green TV Support <greentvsupport@gmail.com>"`)

## Local SMTP test flow
1) Set SMTP_* env (for Gmail app password) and APP_URL.
2) Start server: `npm run dev` in `server/`.
3) Call `POST /api/v1/admin/test-email` with Authorization (admin/editor token) and optional `{ "to": "you@example.com" }` to verify delivery.

## Seeds
- Run `npm run seed` to create admin user and starter content.
