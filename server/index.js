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

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const saveUsers = (users) =>
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

// ========================
// === SESSIONS CONFIG ===
// ========================

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
      secure: true, // NODE_ENV === 'production'
    },
  })
);

// CORS settings (for local testing)
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// CORS settings (for deployment on Render)
app.use(
  cors({
    origin: "https://secure-login-full.onrender.com",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfiguracja katalogu uploadów
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// for local testing
/** 
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);
*/
// for deployment on Render
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpg, .png, .webp files are allowed"));
    }
    cb(null, true);
  },
});

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////
///// ====== LOGIN ====== /////////////
app.post(
  "/api/login",
  (req, res, next) => {
    req.body.username = xss(req.body.username);
    req.body.password = xss(req.body.password);
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    console.log("LOGIN SUCCESS:", req.user);
    console.log("SESSION ID:", req.sessionID); // 💡 dodaj to
    res.json({ success: true, user: req.user });
  }
);

///////////////////////////////////////////////
///// ======= GET USER DATA ======== /////////////
app.get("/api/user", (req, res) => {
  console.log("AUTH CHECK:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
  });

  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

///////////////////////////////////////
///// ====== LOGOUT ====== ////////////
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.sendStatus(200);
  });
});

//
////////////////////////////////////////
///// ====== UPDATE PROFILE ====== ////

app.post("/api/update-profile", upload.single("avatar"), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  // sprawdzanie czy login nie jest już zajęty (ale nie przez samego siebie)
  const usernameTaken = users.some(
    (u, i) => u.username === username && i !== userIndex
  );
  if (usernameTaken) {
    return res.status(400).json({ message: "Username already taken" });
  }

  // aktualizacja danych
  users[userIndex].username = username;
  users[userIndex].email = email;
  users[userIndex].firstName = firstName;
  users[userIndex].lastName = lastName;

  if (req.file) {
    const oldAvatar = users[userIndex].avatar;
    if (oldAvatar && oldAvatar.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, oldAvatar);
      fs.unlink(oldPath, (err) => {
        if (err)
          console.warn("Nie udało się usunąć starego avatara:", err.message);
      });
    }

    users[userIndex].avatar = `/uploads/${req.file.filename}`;
  }

  saveUsers(users);

  res.json({ message: "Profile updated", user: users[userIndex] });
});

////////////////////////////////////////
///// ====== DELETE AVATAR ====== ////

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
  if (oldAvatar && oldAvatar.startsWith("/uploads/")) {
    const oldPath = path.join(__dirname, oldAvatar);
    fs.unlink(oldPath, (err) => {
      if (err) {
        console.warn("Failed to delete avatar:", err.message);
      }
    });
  }

  users[userIndex].avatar = null;
  saveUsers(users);

  req.login(users[userIndex], (err) => {
    if (err) {
      return res.status(500).json({ message: "Session update failed" });
    }
    res.json({ message: "Avatar deleted" });
  });
});

////////////////////////////////////////
///// ====== HANDLE MULTER ERROR ====== ////

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "Avatar is too large (max 2 MB)" });
  } else if (err.message.startsWith("Only ")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Unexpected server error" });
  next(err);
});

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

//
////////////////////////////////////////
///// ====== SERVER LISTEN ====== ////

// app.listen(3001, () => console.log("Server running on http://localhost:3001"));

// For testing the deployment on render
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
