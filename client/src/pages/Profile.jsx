import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching user data on /profile mount");

    fetch("http://localhost:3001/api/user", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => navigate("/login"));
  }, [navigate]); // odpala się tylko raz przy wejściu na widok

  useEffect(() => {
    if (!sessionStorage.getItem("loggedIn")) {
      fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
      }).finally(() => navigate("/login"));
    }
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profileContainer">
      <section className="profileHeader">
        <img
          className="profileHeader__img"
          src={
            user.avatar
              ? `http://localhost:3001${user.avatar}`
              : "/imgs/account-default-w.png"
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
            await fetch("http://localhost:3001/api/logout", {
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
