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
- **Frontend**: Next.js + Tailwind CSS (responsive, fast, SEO‑friendly)
- **Backend**: Node.js + Express (modular APIs, scalable architecture)
- **Database**: MongoDB (flexible schema, optimized for content storage)
- **AI Integration**: Infused modules for intelligent content recommendations and personalization
- **Hosting & Infrastructure**: AWS (EC2, S3, CloudFront) for secure, scalable deployment


## Purpose
- Showcase sustainable engineering projects and initiatives  
- Educate the general public about sustainability practices  
- Provide a professional platform for potential clients, investors, and partners  

---

## Current Status (Build & Tests)
- `npm run test:run` currently fails because several component imports cannot be resolved (e.g., `AboutUs`, `HomePage`, and `header.css` case mismatch). The Live TV data mapping tests pass.
- `npm run build` currently fails on TypeScript unused-variable errors in `src/CaseStories.tsx`, `src/pages/Articles/Articles.tsx`, and `src/pages/HomePage/HomePage.tsx`.
- UI flows (Home, About, Articles, Live TV, Podcast, Login/Signup, Admin shell) render from static data with simulated auth; no backend/APIs are wired up yet.

## Pending Work
- Fix the TypeScript build blockers by removing unused state/handlers in the files noted above.
- Correct component exports/import paths so `AboutUs`, `HomePage`, and header styles resolve in tests.
- Replace simulated authentication with a real provider (e.g., Clerk/Supabase) and connect forms to live APIs and persistence (MongoDB/Cloudinary/S3 as designed).
- Wire video/podcast/article content to backend/CMS sources instead of static lists; ensure asset URLs and env vars are configured.
- Add routing (React Router or Next.js pages), deployment pipeline (Vercel/Netlify), and CI to run build/tests on each push.

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
