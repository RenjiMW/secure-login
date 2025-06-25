// 📦 Core modules and middleware imports
import fs from "fs";
import multer from "multer";
import path from "path";
import express from "express";
import cors from "cors";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";
import xss from "xss";
import helmet from "helmet";
import initializePassport from "./auth/passport-config.js";
import { getUsers } from "./auth/passport-config.js";
import { fileURLToPath } from "url";

// 🚀 Initialize Express app
const app = express();
app.set("trust proxy", 1);

// 🛡️ Set Content Security Policy with Helmet (protect image sources)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  })
);

// 🌍 Detect production environment (used for cookies and CORS)
const isProduction = process.env.NODE_ENV === "production";

// 💾 Helper function to persist users to users.json
const saveUsers = (users) =>
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

// ==========================
// === 🧠 SESSIONS CONFIG ===
// ==========================
// Configure session middleware with file-based session storage
const FileStoreInstance = FileStore(session);
app.use(
  session({
    store: new FileStoreInstance({
      path: "./sessions",
      ttl: 86400,
      retries: 1,
    }),
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction, // cookies are secure only in production
    },
  })
);

// =============================
// === 🌐 CORS CONFIGURATION ===
// =============================
// Allow frontend access (either from localhost or Render)
app.use(
  cors({
    origin: isProduction
      ? "https://secure-login-full-v3.onrender.com"
      : "http://localhost:5173",
    credentials: true,
  })
);

// =============================
// === 📁 FILE UPLOADS SETUP ===
// =============================
// Create and expose the uploads directory for serving avatar images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure multer for avatar image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 Max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpg, .png, .webp files are allowed"));
    }
    cb(null, true);
  },
});

// =============================================
// === 🧱 Middleware for JSON and form data ====
// ==============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// ==== 🔐 PASSPORT AUTH INIT ====
// ================================
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////
// 🔑 LOGIN ROUTE — /api/login
///////////////////////////////////////
app.post("/api/login", (req, res, next) => {
  // 🧼 Sanitize input against XSS
  req.body.username = xss(req.body.username);
  req.body.password = xss(req.body.password);

  // Authenticate user using local strategy
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Auth error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });
    }

    // Create session after login
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login session error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      return res.json({ success: true, user });
    });
  })(req, res, next);
});

///////////////////////////////////////////
// 🧠 GET AUTHENTICATED USER — /api/user
///////////////////////////////////////////
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

///////////////////////////////////////
// 🚪 LOGOUT ROUTE — /api/logout
///////////////////////////////////////
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.sendStatus(200);
  });
});

///////////////////////////////////////////////////////////////
// ✏️ UPDATE PROFILE — /api/update-profile
// Allows updating user details and avatar
///////////////////////////////////////////////////////////////
app.post("/api/update-profile", (req, res, next) => {
  // Handle file upload
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "Multer error: " + err.message });
    } else if (err) {
      return res
        .status(500)
        .json({ message: "Unexpected Multer error: " + err.message });
    }

    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // ============================================================
      // 🧼 Validate and sanitize fields

      const username = xss(req.body.username);
      const email = xss(req.body.email);
      const firstName = xss(req.body.firstName);
      const lastName = xss(req.body.lastName);

      if (!username || username.length < 3 || username.length > 20) {
        return res
          .status(400)
          .json({ message: "Username must be 3–20 characters long." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address." });
      }

      if (!firstName || firstName.length > 30) {
        return res
          .status(400)
          .json({ message: "First name is required (max 30 chars)." });
      }

      if (!lastName || lastName.length > 30) {
        return res
          .status(400)
          .json({ message: "Last name is required (max 30 chars)." });
      }

      // ===========================================================
      // 🧠 Find user and update data

      const users = getUsers();
      const userIndex = users.findIndex((u) => u.id === req.user.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      // Checking if the selected username is not already taken
      const usernameTaken = users.some(
        (u, i) => u.username === username && i !== userIndex
      );
      if (usernameTaken) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Update text fields
      users[userIndex].username = username;
      users[userIndex].email = email;
      users[userIndex].firstName = firstName;
      users[userIndex].lastName = lastName;

      // ===========================================================
      // Handle new avatar file

      if (req.file) {
        const oldAvatar = users[userIndex].avatar;

        // Delete old file if exists
        if (oldAvatar && oldAvatar.startsWith("/uploads/")) {
          const oldPath = path.join(__dirname, oldAvatar);
          fs.unlink(oldPath, (err) => {
            if (err)
              console.warn(
                "Nie udało się usunąć starego avatara:",
                err.message
              );
          });
        }

        // Saving path to new file
        users[userIndex].avatar = `/uploads/${req.file.filename}`;
      }

      // Save updated user
      saveUsers(users);
      res.json({ message: "Profile updated", user: users[userIndex] });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

///////////////////////////////////////////////////////////////
// 🗑️ DELETE AVATAR — /api/delete-avatar
///////////////////////////////////////////////////////////////
app.post("/api/delete-avatar", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const oldAvatar = users[userIndex].avatar;

  // Prevent deleting default avatar
  if (!oldAvatar || !oldAvatar.startsWith("/uploads/")) {
    return res
      .status(400)
      .json({ message: "Default avatar cannot be deleted" });
  }

  // Delete avatar file
  const oldPath = path.join(__dirname, oldAvatar);
  fs.unlink(oldPath, (err) => {
    if (err) {
      console.warn("Failed to delete avatar:", err.message);
    }
  });

  users[userIndex].avatar = null;
  saveUsers(users);

  req.login(users[userIndex], (err) => {
    if (err) {
      return res.status(500).json({ message: "Session update failed" });
    }
    res.json({ message: "Avatar deleted" });
  });
});

// =============================================
// === 🧱 SERVE FRONTEND (Vite build folder) ===
// =============================================
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// ============================================
// ============ 🚀 START SERVER ==============
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
