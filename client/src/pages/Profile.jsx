// 🧠 React and routing hooks
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🌐 Base URL for backend API (from .env file)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ===================================
// 👤 Profile component (view only)
// ===================================
function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ================================
  // 🔄 Fetch user data on mount
  // ================================
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/user`, {
      credentials: "include", // 🔒 Include cookies for auth session
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data)) // ✅ Store user data
      .catch(() => navigate("/login")); // 🔁 Redirect to login if unauthorized
  }, [navigate]);

  // ================================================
  // 🔐 Failsafe — logout if session marker is gone
  // ================================================
  useEffect(() => {
    if (!sessionStorage.getItem("loggedIn")) {
      fetch(`${BACKEND_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      }).finally(() => navigate("/login")); // Redirect after logout
    }
  }, [navigate]);

  // 🕗 Show loading state while fetching
  if (!user) return <p>Loading...</p>;

  // ////////////////////////////////////////////
  // =================== JSX ====================
  // ////////////////////////////////////////////
  return (
    <div className="profileContainer">
      <section className="profileHeader">
        <img
          className="profileHeader__img"
          src={
            user.avatar
              ? `${BACKEND_URL}${user.avatar}`
              : `${BACKEND_URL}/imgs/account-default-w.png`
          }
          alt="Profile"
        />

        <div className="profileHeader__info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        <button
          className="profileHeader__logoutBtn"
          onClick={async () => {
            await fetch(`${BACKEND_URL}/api/logout`, {
              method: "POST",
              credentials: "include",
            });
            sessionStorage.removeItem("loggedIn");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </section>

      <section className="profileDetails">
        <h3>Profile Details</h3>
        <p>
          First Name: <span>{user.firstName}</span>
        </p>
        <p>
          Last Name: <span>{user.lastName}</span>
        </p>
      </section>

      <button className="editProfileBtn" onClick={() => navigate("/edit")}>
        Edit Profile
      </button>
    </div>
  );
}

export default Profile;
