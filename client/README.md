# Secure Login — React Frontend

The frontend part of a user profile management application with secure login, built in React. The project is connected to an Express backend hosted on Render.com.

## 🧩 Features

- ✅ Login using Passport.js and session-based authentication
- 👤 User profile view with edit functionality
- 🖼️ Avatar upload support (including preview)
- 🚪 Secure logout
- 🛡️ Backend-side XSS protection
- 📱 Responsive interface styled with SCSS

## 📦 Tech Stack

### Frontend:

- React 19 (with React Router)
- SCSS (modular files + media queries)
- Vite (dev server + build)
- ESLint (configured for React Hooks)

### Backend (Render):

- Express.js + session-file-store
- Passport.js (local strategy)
- Multer (for avatar uploads)
- XSS (text field sanitization)
- JSON as a simple user database

## 🔐 Security

- Login credentials are not stored in `localStorage` or cookies
- Server saves sessions to disk (session-file-store) and authenticates each route
- Avatar uploads are limited to 2MB with file type validation
- Input data is validated and sanitized on the server side

## 🛠️ Running the Project

1. Install dependencies:
   npm install
2. Start the dev server:
   npm run dev
3. Make sure the backend is running at http://localhost:3001.
   Note: Vite is configured with a proxy so the frontend can access the backend via /api → http://localhost:3001.

## 🌐 Deployment

- The frontend can be hosted on GitHub Pages (built with Vite)
- The backend is hosted on Render and communicates with the frontend via API endpoints (/api/login, /api/user, etc.)

## 🎯 This project was developed as part of a recruitment task for a Frontend Developer position.
