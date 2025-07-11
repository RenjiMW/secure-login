# 🔐 Secure Login – React + Express App

A full-stack web application for secure user authentication and profile management. Built with **React 19** and **Express.js**. Features include login via sessions, profile editing, avatar upload, and security measures like XSS protection.

---

## 💻 Application preview

#### See the app running online:

Click this link: <a href="https://secure-login-full.onrender.com/" target="_blank" rel="noopener noreferrer">https://secure-login-full.onrender.com/</a>

#### OR

#### Run the app locally:

Go to the [Getting Started](#-getting-started) section

---

## ✨ Features

- ✅ Login with **Passport.js** and **express-session**
- 👤 User profile view with avatar and personal data
- ✏️ Editable profile form (nickname, email, first name, last name)
- 🖼️ Avatar upload, preview, and deletion (with default fallback)
- 🚪 Secure logout that destroys the session
- 🛡️ Backend protection against XSS
- 📱 Responsive SCSS styling

---

## 🧰 Stack

### Frontend

- React 19 (with React Router)
- SCSS (modular, responsive)
- Vite (development server + build)
- Fetch API (`credentials: "include"`)

### Backend

- Express.js
- Passport.js (local strategy)
- Multer (file upload & validation)
- Session-file-store
- Helmet + Content Security Policy
- XSS sanitization (`xss` package)
- JSON-based user store (`users.json`)

---

## 🚀 Getting Started

### 1. Clone the repo

- git clone https://github.com/RenjiMW/secure-login
- cd secure-login

### 2. Set environment variables (not required)

For demonstration purposes, the environment variables have been manually defined in vite.config.js, so no additional setup is required to run the project locally.
You can read more about this in the [Environment Variables](#-environment-variables-vite_backend_url) section.

### 3. Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

### 4. Run the app locally

#### Terminal 1: frontend

```bash
cd client
npm run dev
```

#### Terminal 2: backend

```bash
cd server
npm run start:dev
```

---

## 👤 Sample Users

Example entries in users.json:

```json
[
  {
    "id": 1,
    "username": "skybug5",
    "password": "mix852",
    "email": "mcperson.human@example.com",
    "firstName": "Human",
    "lastName": "McPerson",
    "avatar": "/imgs/account-default-w.png"
  },
  {
    "id": 2,
    "username": "zapfox3",
    "password": "sun456",
    "email": "chuck.norris@instance.com",
    "firstName": "Chuck",
    "lastName": "Norris",
    "avatar": "/imgs/account-default-w.png"
  }
]
```

---

## 🔗 Routes

### Frontend (React)

| **Path**   | **Component**     | **Description**        |
| ---------- | ----------------- | ---------------------- |
| `/login`   | `Login.jsx`       | Login form             |
| `/profile` | `Profile.jsx`     | Protected profile view |
| `/edit`    | `EditProfile.jsx` | Profile editing form   |

### Backend (API)

| **Method** | **Route**             | **Description**                    |
| ---------- | --------------------- | ---------------------------------- |
| `POST`     | `/api/login`          | Authenticate user                  |
| `GET`      | `/api/user`           | Get current user data              |
| `POST`     | `/api/logout`         | Logout and destroy session         |
| `POST`     | `/api/update-profile` | Update profile & avatar            |
| `POST`     | `/api/delete-avatar`  | Delete uploaded avatar (if exists) |

---

## 🌐 Environment Variables (`VITE_BACKEND_URL`)

In this project, the frontend application communicates with the backend via an environment variable called `VITE_BACKEND_URL`.  
In typical Vite-based projects, this variable would be defined in a `.env` file, for example:

```ini
VITE_BACKEND_URL=http://localhost:3001
```

And then used in code like this:

```js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
```

### 🔧 Current Approach

To make local development easier after cloning the repository (without requiring manual .env setup), a different approach is used:

In vite.config.js, the VITE_BACKEND_URL variable is manually overridden:

```js
define: {
  "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
    isProduction
      ? "https://secure-login-full-v3.onrender.com"
      : "http://localhost:3001"
  ),
}
```

---

## 🛡️ Security Features

- Input sanitization (xss) on sensitive fields
- Protected avatar uploads (max 2MB, file type whitelist)
- Session cookie options: httpOnly, secure, sameSite
- Content Security Policy (helmet)
- Session store backed by file system (session-file-store)

---

## 🧪 To Improve

- Hashing passwords (bcrypt)
- Database instead of users.json
- Password reset via email
- Dark/Light mode toggle

---

## 🧠 Author Notes

Created as part of a frontend recruitment task to demonstrate full-stack authentication and user profile editing capabilities in React + Express.

---
