import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../utils/auth";
import "./styles/AdminDashboard.css";


const AdminDashboard = () => {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [addingUser, setAddingUser] = useState(false);


  // ========================================
  // GET USERS
  // ========================================

  const fetchUsers = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        if (response.status === 401 ||
            response.status === 403) {

          localStorage.removeItem("quizwaveToken");
          localStorage.removeItem("quizwaveUser");

          navigate("/login");

          return;
        }

        throw new Error(
          data.message || "Failed to load users"
        );
      }

      setUsers(data.users || []);

    } catch (error) {

      console.error("Fetch users error:", error);

      setError(error.message);

    } finally {

      setLoading(false);

    }
  };


  // ========================================
  // LOAD USERS
  // ========================================

  useEffect(() => {

    fetchUsers();

  }, []);


  // ========================================
  // ADD USER
  // ========================================

  const handleAddUser = async (e) => {

    e.preventDefault();

    if (!newEmail || !newPassword) {
      return;
    }

    try {

      setAddingUser(true);
      setError("");

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            email: newEmail,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create user"
        );
      }


      // Clear form
      setNewEmail("");
      setNewPassword("");

      setShowAddUser(false);

      // Refresh list
      fetchUsers();

    } catch (error) {

      console.error("Add user error:", error);

      setError(error.message);

    } finally {

      setAddingUser(false);

    }
  };


  // ========================================
  // DISABLE USER
  // ========================================

  const handleDisable = async (userId) => {

    if (!window.confirm(
      "Are you sure you want to disable this user?"
    )) {
      return;
    }

    try {

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/disable`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to disable user"
        );
      }

      fetchUsers();

    } catch (error) {

      setError(error.message);

    }
  };


  // ========================================
  // ENABLE USER
  // ========================================

  const handleEnable = async (userId) => {

    try {

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/enable`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to enable user"
        );
      }

      fetchUsers();

    } catch (error) {

      setError(error.message);

    }
  };


  // ========================================
  // DELETE USER
  // ========================================

  const handleDelete = async (userId) => {

    if (!window.confirm(
      "Are you sure you want to permanently delete this user?"
    )) {
      return;
    }

    try {

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete user"
        );
      }

      fetchUsers();

    } catch (error) {

      setError(error.message);

    }
  };


  // ========================================
  // PASSWORD CHANGE
  // ========================================

  const handlePasswordChange = async (userId) => {

    const newPassword = window.prompt(
      "Enter new password:"
    );

    if (!newPassword) {
      return;
    }

    try {

      const token =
        localStorage.getItem("quizwaveToken");

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/password`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to change password"
        );
      }

      window.alert(
        "Password changed successfully"
      );

    } catch (error) {

      setError(error.message);

    }
  };

  const goToHome = () => {
  navigate("/");
};


  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">

        <div>
          <h2>QuizWave Admin</h2>

          <p>
            User Management
          </p>
        </div>
    

<div className="admin-header-actions">

  <button
    className="admin-home-btn"
    onClick={goToHome}
    title="Home"
  >
    ⌂
    <span>Home</span>
  </button>

  <button
    className="admin-logout-btn"
    onClick={logoutUser}
    title="Logout"
  >
    ⏻
    <span>Logout</span>
  </button>

</div>
      </div> 

      


      {/* ERROR */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* ACTION BAR */}

      <div className="admin-actions">

        <div>
          <strong>
            Users
          </strong>

          <span>
            {users.length}
          </span>
        </div>


        <button
          className="add-user-btn"
          onClick={() =>
            setShowAddUser(true)
          }
        >
          + Add User
        </button>

      </div>


      {/* USER LIST */}

      <div className="users-container">

        {loading ? (

          <div className="admin-loading">
            Loading users...
          </div>

        ) : users.length === 0 ? (

          <div className="admin-empty">
            No users found.
          </div>

        ) : (

          users.map((user) => (

            <div
              className="user-card"
              key={user._id}
            >

              <div className="user-info">

                <div className="user-avatar">
                  {user.email
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <strong>
                    {user.email}
                  </strong>

                  <small>
                    Last login:{" "}
                    {user.lastLogin
                      ? new Date(
                          user.lastLogin
                        ).toLocaleString()
                      : "Never"}
                  </small>

                </div>

              </div>


              <div className="user-status">

                <span
                  className={
                    user.isOnline
                      ? "status online"
                      : "status offline"
                  }
                >
                  ●{" "}
                  {user.isOnline
                    ? "Online"
                    : "Offline"}
                </span>

              </div>


              <div className="user-actions">

                <button
                  onClick={() =>
                    handlePasswordChange(
                      user._id
                    )
                  }
                  title="Change Password"
                >
                  🔑
                </button>


                {user.isActive ? (

                  <button
                    onClick={() =>
                      handleDisable(
                        user._id
                      )
                    }
                    title="Disable User"
                  >
                    🚫
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      handleEnable(
                        user._id
                      )
                    }
                    title="Enable User"
                  >
                    ✓
                  </button>

                )}


                <button
                  onClick={() =>
                    handleDelete(
                      user._id
                    )
                  }
                  title="Delete User"
                >
                  🗑
                </button>

              </div>

            </div>

          ))

        )}

      </div>


      {/* ADD USER MODAL */}

      {showAddUser && (

        <div className="modal-overlay">

          <div className="add-user-modal">

            <div className="modal-header">

              <h3>
                Add New User
              </h3>

              <button
                onClick={() =>
                  setShowAddUser(false)
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleAddUser}
            >

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) =>
                  setNewEmail(
                    e.target.value
                  )
                }
              />


              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
              />


              <button
                type="submit"
                disabled={addingUser}
              >
                {addingUser
                  ? "Creating..."
                  : "Create User"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminDashboard;