import { useNavigate } from "react-router-dom";
import { useState } from "react";

const sanitizeInput = (str) => str.replace(/</g, "").replace(/>/g, "");

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧠 prosta walidacja
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    if (username.includes("<") || username.includes(">")) {
      setError("Username cannot contain HTML tags.");
      return;
    }

    const cleanUsername = sanitizeInput(username);
    const cleanPassword = sanitizeInput(password);

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      if (res.ok) {
        sessionStorage.setItem("loggedIn", "true");
        navigate("/profile");
      } else {
        // 🧠 próba odczytania wiadomości błędu z serwera
        const data = await res.json();
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      // 🛑 np. błąd sieci
      setError("Something went wrong. Please try again later.");
      console.error(err);
    }
  };

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

        {error && <p className="errorMessage">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
