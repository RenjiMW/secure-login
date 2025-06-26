// 📦 React hooks and navigation
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// 🌐 Backend API base URL (from .env file)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 🧼 Basic input sanitization to strip out < and > characters
const sanitizeInput = (str) => str.replace(/</g, "").replace(/>/g, "");

// ===================================
// 🔐 Login Component
// ===================================
function Login() {
  const navigate = useNavigate();

  // 🧾 Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ===================================
  // 🚀 Handle form submission
  // ===================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚫 Check for empty fields
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    // 🧼 Block HTML tags (basic protection)
    if (username.includes("<") || username.includes(">")) {
      setError("Username cannot contain HTML tags.");
      return;
    }

    // ✅ Sanitize input
    const cleanUsername = sanitizeInput(username);
    const cleanPassword = password;

    // 📡 Send login request to backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        credentials: "include", // send cookies for session
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      // ✅ On success — store login marker and redirect to profile
      if (res.ok) {
        sessionStorage.setItem("loggedIn", "true");
        navigate("/profile");
      } else {
        // ❌ Handle server-side errors
        try {
          const data = await res.json();
          setError(data.message || "Invalid credentials");
        } catch (err) {
          console.error("Login parse error:", err);
          setError("Invalid credentials");
        }
      }
    } catch (err) {
      // 🛑 Handle network errors
      console.error("Network login error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  // ////////////////////////////////////////////
  // =================== JSX ====================
  // ////////////////////////////////////////////
  return (
    <div className="loginContainer">
      <h1 className="loginTitle">User login</h1>

      <form className="loginForm" onSubmit={handleSubmit}>
        <div className="loginForm__usernameDiv loginForm__rowsLayout">
          <label className="loginForm__label" htmlFor="username">
            Username:
          </label>

          <input
            className="loginForm__input"
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="loginForm__passwordDiv loginForm__rowsLayout">
          <label className="loginForm__label" htmlFor="password">
            Password:
          </label>

          <input
            className="loginForm__input"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="loginForm__submitBtn" type="submit">
          Login
        </button>

        {error && <p className="loginForm__errorMessage">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
