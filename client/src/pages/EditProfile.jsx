// 📦 React & Router imports
import { useEffect, useReducer, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 🧱 UI Components for modals
import Modal from "../components/Modal";
import ModalDelete from "../components/ModalDelete";

// 🌐 Backend API base URL (from .env)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 🧼 Helper function to sanitize input against HTML injection
function sanitizeInput(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 🧾 Initial state for the user profile form
const initialState = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  avatar: "",
};

// 🔁 Reducer function for managing form state
function reducer(state, action) {
  switch (action.type) {
    case "setUser":
      return {
        username: action.payload.username,
        email: action.payload.email,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        avatar: action.payload.avatar,
      };
    case "userNameChange":
      return { ...state, username: action.payload };
    case "emailChange":
      return { ...state, email: action.payload };
    case "firstNameChange":
      return { ...state, firstName: action.payload };
    case "lastNameChange":
      return { ...state, lastName: action.payload };
    case "avatarChange":
      return { ...state, avatar: action.payload };
    default:
      return state;
  }
}

// =======================================
// 📄 EditProfile Component
// =======================================
function EditProfile() {
  // 🎮 useReducer to manage form state
  const [{ username, email, firstName, lastName, avatar }, dispatch] =
    useReducer(reducer, initialState);
  // ⚠️ Error and loading state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // 🗑️ Avatar delete confirmation modal visibility
  const [delConfirmation, setDelConfirmation] = useState(false);

  // 🧭 Navigation and route location
  const navigate = useNavigate();
  const location = useLocation();

  // =======================================
  // 🔄 Fetch user data & reset form
  // =======================================
  const resetForm = useCallback(
    (retry = false) => {
      setIsLoading(true);
      dispatch({ type: "setUser", payload: initialState });

      fetch(`${BACKEND_URL}/api/user`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          dispatch({ type: "setUser", payload: data });
          setIsLoading(false);
        })
        .catch(() => {
          if (!retry) {
            setTimeout(() => resetForm(true), 500);
          } else {
            navigate("/login");
          }
        });
    },
    [navigate]
  );

  // ⏱️ Run resetForm on mount or route change
  useEffect(() => {
    const timeout = setTimeout(resetForm, 300);
    return () => clearTimeout(timeout);
  }, [location.key, resetForm]);

  // =======================================
  // 📤 Submit form data
  // =======================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Client-side validation
    if (!username || !email || !firstName || !lastName) {
      setError("All fields are required!");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError("Username must be between 3 and 20 characters.");
      return;
    }

    if (firstName.length < 3 || firstName.length > 30) {
      setError("Firstname must be between 3 and 30 characters.");
      return;
    }

    if (lastName.length < 3 || lastName.length > 30) {
      setError("Lastname must be between 3 and 30 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 📦 Prepare form data for sending (including optional avatar)
    const cleanUsername = sanitizeInput(username);
    const cleanEmail = sanitizeInput(email);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);

    // 📬 Send data to the backend
    const formData = new FormData();
    formData.append("username", cleanUsername);
    formData.append("email", cleanEmail);
    formData.append("firstName", cleanFirstName);
    formData.append("lastName", cleanLastName);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/update-profile`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        navigate("/profile");
      } else {
        const text = await res.text();
        setError("Upload error: " + text);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    }
  };

  // =======================================
  // 🗑️ Delete avatar logic
  // =======================================
  const confirmDeleteAvatar = function () {
    setDelConfirmation(true);
  };

  const handleDeleteAvatar = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/delete-avatar`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        resetForm();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete avatar");
      }
    } catch (err) {
      setError("Unexpected error while deleting avatar");
      console.error(err);
    }
  };

  // =======================================
  // 🛑 Cancel edit & clear modal
  // =======================================
  const handleCancel = () => {
    navigate("/profile");
  };

  const closeModal = () => {
    setError("");
  };

  // =======================================
  // ⌛ Loading message
  // =======================================
  if (isLoading) {
    return <p className="editProfile">Loading...</p>;
  }

  // ////////////////////////////////////////////
  // =================== JSX ====================
  // ////////////////////////////////////////////
  return (
    <div className="editProfile">
      {error && <Modal closeModal={closeModal}>{error}</Modal>}
      {delConfirmation && (
        <ModalDelete
          deleteAvatar={handleDeleteAvatar}
          setDelConfirmation={setDelConfirmation}
        >
          Are you sure you want to remove the avatar image?
        </ModalDelete>
      )}
      <form className="editProfile__form" onSubmit={handleSubmit}>
        <div className="editProfile__rowsLayout editProfile__avatarLayout">
          <div className="editProfile__avatarLabelContiner">
            <label htmlFor="avatar" className="editProfile__avatarLabel">
              <img
                className="editProfile__img"
                src={
                  avatar instanceof File
                    ? URL.createObjectURL(avatar)
                    : avatar
                    ? `${BACKEND_URL}${avatar}`
                    : `${BACKEND_URL}/imgs/account-default-w.png`
                }
                alt="Avatar image"
              />
            </label>
          </div>

          <div className="avatarContainer">
            <label
              className="editProfile__btn editProfile__upload"
              htmlFor="avatar"
            >
              Upload image
            </label>
          </div>
          <input
            className="fileUpload__inputHidden"
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={(e) => {
              setError("");
              dispatch({ type: "avatarChange", payload: e.target.files[0] });
            }}
          />

          {avatar && typeof avatar === "string" && (
            <button
              type="button"
              className="editProfile__btn editProfile__deleteAvatar"
              onClick={confirmDeleteAvatar}
            >
              Delete image
            </button>
          )}
        </div>

        <div className="editProfile__rowsLayout">
          <label htmlFor="username">Username (nick):</label>
          <input
            className="editProfile__input"
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => {
              setError("");
              dispatch({ type: "userNameChange", payload: e.target.value });
            }}
          />
        </div>

        <div className="editProfile__rowsLayout">
          <label htmlFor="email">Email Address:</label>
          <input
            className="editProfile__input"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setError("");
              dispatch({ type: "emailChange", payload: e.target.value });
            }}
          />
        </div>

        <div className="editProfile__rowsLayout">
          <label htmlFor="firstName">First Name:</label>
          <input
            className="editProfile__input"
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => {
              setError("");
              dispatch({ type: "firstNameChange", payload: e.target.value });
            }}
          />
        </div>

        <div className="editProfile__rowsLayout">
          <label htmlFor="lastName">Last Name:</label>
          <input
            className="editProfile__input"
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => {
              setError("");
              dispatch({ type: "lastNameChange", payload: e.target.value });
            }}
          />
        </div>

        <button type="submit" className="editProfile__btn">
          Save
        </button>
        <button
          type="button"
          className="editProfile__btn cancelEdit"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
