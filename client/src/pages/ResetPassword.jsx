
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/ResetPassword.css";

const ResetPassword = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // Verify OTP page se email receive hoga
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";


  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleResetPassword = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !resetToken) {
  setError(
    "Invalid password reset session. Please verify OTP again."
  );
  return;
}


    // ========================================
    // CHECK EMAIL
    // ========================================

    if (!email) {

      setError(
        "Email information is missing. Please start again."
      );

      return;

    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    if (!password || !confirmPassword) {

      setError(
        "Password and confirm password are required."
      );

      return;

    }


    // ========================================
    // CHECK PASSWORD MATCH
    // ========================================

    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    // ========================================
    // PASSWORD LENGTH
    // ========================================

    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      return;

    }


    try {

      setLoading(true);


      // ========================================
      // RESET PASSWORD API
      // ========================================

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            resetToken,
            password,
            confirmPassword,
          }),
        }
      );


      const data = await response.json();


      // ========================================
      // ERROR
      // ========================================

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to reset password."
        );

        return;

      }


      // ========================================
      // SUCCESS
      // ========================================

      setSuccess(
        "Password reset successful!"
      );


      // ========================================
      // GO TO LOGIN
      // ========================================

      setTimeout(() => {

        navigate("/login");

      }, 2000);


    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="reset-password-page">

      <div className="reset-password-card">


        <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />


        <h1>
          Reset Password
        </h1>


        <p className="reset-password-subtitle">
          Create a new password for your account
        </p>


        <p className="reset-password-email">
          {email}
        </p>


        <form
          onSubmit={handleResetPassword}
        >


          {/* NEW PASSWORD */}

          <div className="input-group">

            <label>
              New Password
            </label>


            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="input-group">

            <label>
              Confirm Password
            </label>


            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="reset-error">
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="reset-success">
              {success}
            </div>

          )}


          {/* RESET BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Resetting..."
              : "Reset Password"}

          </button>


          {/* BACK */}

          <button
            type="button"
            className="back-login-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            ← Back to Login
          </button>


        </form>

      </div>

    </div>

  );

};

export default ResetPassword;

