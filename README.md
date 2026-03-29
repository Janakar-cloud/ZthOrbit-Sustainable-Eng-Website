# ZthOrbit-Sustainable-Eng-Website
ZthOrbit Sustainable Eng Website is an **AI‑infused, content‑driven digital platform** designed to showcase sustainable engineering solutions with a modern, engaging user experience. The site emphasizes speed, scalability, and intelligent content delivery, ensuring visitors can access videos, articles, and case stories seamlessly.

## Key Features
- **Homepage with Featured Content**: Highlighting sustainability initiatives and engineering breakthroughs.
- **Video Section**: Scrolling gallery with optimized playback (loads within 2 seconds on high‑speed internet).
- **Articles & Case Stories**: Rich content modules for thought leadership and project showcases.
- **User Authentication**: Secure login via email and mobile number (future‑ready for OTP integration).
- **Admin Dashboard**: Analytics and user reports for performance tracking.
- **Contact & Enquiry Forms**: Easy communication channel for prospective clients and partners.
- **About Us Section**: Company profile and mission statement.

## Tech Stack
- **Primary Frontend**: React + Vite at the repo root, built to `dist/`
- **Secondary App**: Next.js app in `live-channel-app` for live/admin flows
- **Backend**: Node.js + Express API in `server/`
- **Database**: MongoDB
- **Storage / Delivery**: AWS S3 for media, Nginx + PM2 on EC2, optional CloudFront for CDN/HLS


## Purpose
- Showcase sustainable engineering projects and initiatives  
- Educate the general public about sustainability practices  
- Provide a professional platform for potential clients, investors, and partners  

---

## Current Status (Build & Deployment)
- The root Vite app builds successfully and is intended to be served as static files from `dist/` via Nginx.
- The Express API builds and runs under PM2 from `server/dist/index.js`.
- The `live-channel-app` Next.js project is a separate deployment unit and should be built and run independently if you need the admin/live experience from that app.
- The repo now includes EC2-ready Nginx and PM2 examples under `ops/`.

## Pending Work
- Decide whether production should expose only the root Vite app, or also reverse-proxy the `live-channel-app` Next.js service.
- Finalize AWS media delivery for live TV: either Nginx RTMP + FFmpeg + HLS on EC2 or AWS Elemental / MediaLive + CloudFront.
- Add CI to run root build, server build, and optional Next build on every push.
- Move production secrets fully into server-side environment management or AWS Systems Manager / Secrets Manager.

---

## Design Theme
- Corporate professional look blended with eco‑friendly visuals  
- Use of greens, earthy tones, and sustainability imagery  
- Responsive, SEO‑friendly layouts  

---

## Admin Dashboard
- User management (create, update, deactivate accounts)  
- Add/manage videos, podcasts, and articles  
- Handle enquiry forms with database storage  
- View analytics and insights  

---

## Database
- **MongoDB** for scalable storage of:  
  - Users  
  - Videos  
  - Articles  
  - Podcasts  
  - Enquiry submissions  
  - Analytics data  
