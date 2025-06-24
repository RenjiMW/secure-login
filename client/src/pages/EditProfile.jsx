import { useEffect, useReducer, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../components/Modal";
import ModalDelete from "../components/ModalDelete";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function sanitizeInput(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const initialState = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  avatar: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "setUser":
      return {
        username: action.payload.username,
        email: action.payload.email,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        avatar: action.payload.avatar || null,
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

//
//////////////////////////////////////////
/// ======= EDIT PROFILE VIEW ======= ////
//
function EditProfile() {
  const [{ username, email, firstName, lastName, avatar }, dispatch] =
    useReducer(reducer, initialState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [delConfirmation, setDelConfirmation] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  console.log(
    "//////////////////////// EditProfile Mounted ////////////////////////"
  );
  //////////////////////////////////////////
  /////// ======= RESET FORM ======= //////
  console.log(username, email, firstName, lastName, avatar);

  const resetForm = useCallback(
    (retry = false) => {
      console.log("location change");

      setIsLoading(true);
      dispatch({ type: "setUser", payload: initialState });

      // "http://localhost:3001/api/user"
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
            console.log("Retrying user fetch in 500ms...");
            setTimeout(() => resetForm(true), 500); // 🕓 retry
          } else {
            navigate("/login"); // ❌ fail if retry also failed
          }
        });
    },
    [navigate]
  );
  //////////////////////////////////////////
  /////// ======= DATA FETCH ======= //////
  useEffect(() => {
    console.log("FETCHING USER DATA in EditProfile");
    const timeout = setTimeout(resetForm, 300); // 100ms opóźnienia
    return () => clearTimeout(timeout);
  }, [location.key, resetForm]); // reaguj na pathname zamiast key

  //
  //////////////////////////////////////////
  /////// ======= FORM SUBMIT ======= //////
  //
  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION
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

    // SANITYZACJA
    const cleanUsername = sanitizeInput(username);
    const cleanEmail = sanitizeInput(email);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);

    // SEND DATA
    const formData = new FormData();
    formData.append("username", cleanUsername);
    formData.append("email", cleanEmail);
    formData.append("firstName", cleanFirstName);
    formData.append("lastName", cleanLastName);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      // "http://localhost:3001/api/update-profile"
      const res = await fetch(`${BACKEND_URL}/api/update-profile`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        navigate("/profile");
      } else {
        const text = await res.text();
        console.error("Upload error:", text);
        setError("Upload error: " + text);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    }

    // if (res.ok) {
    //   const data = await res.json(); // <- tu niepotrzebne, bo nie używasz
    //   navigate("/profile");
    // } else {
    //   const text = await res.text(); // zamiast .json()
    //   console.error("Upload error:", text);
    // }
  };

  //
  //////////////////////////////////////////
  ////// ===== DELETE AVATAR ===== /////
  //

  const confirmDeleteAvatar = function () {
    setDelConfirmation(true);
  };

  // -----------delete---------------------------
  const handleDeleteAvatar = async () => {
    // "http://localhost:3001/api/delete-avatar"
    try {
      const res = await fetch(`${BACKEND_URL}/api/delete-avatar`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        resetForm(); // 🔁 ponownie pobierz dane użytkownika
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete avatar");
      }
    } catch (err) {
      setError("Unexpected error while deleting avatar");
      console.error(err);
    }
  };

  //
  //////////////////////////////////////////
  ////// ===== HANDLE CANCEL BTN ===== /////
  //
  const handleCancel = () => {
    navigate("/profile");
  };

  const closeModal = () => {
    setError("");
  };

  //
  //////////////////////////////////////////
  ////// ===== RETURN CONTENT ===== /////
  //
  if (isLoading) {
    return <p className="editProfile">Loading...</p>;
  }

  return (
    <div className="editProfile">
      {/* <img
        className="editProfile__img"
        src={
          avatar instanceof File
            ? URL.createObjectURL(avatar)
            : avatar
            ? `http://localhost:3001${avatar}`
            : "/imgs/account-default-w.png"
        }
        alt="Avatar image"
      /> */}

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
                    : `${BACKEND_URL}/uploads/account-default-w.png`
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
