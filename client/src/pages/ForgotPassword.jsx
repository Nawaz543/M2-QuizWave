import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/ForgotPassword.css";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleForgotPassword = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {

      setError("Please enter your email");

      return;

    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to process request"
        );

        return;

      }


      navigate("/verify-otp", {
  state: {
    email: email.trim().toLowerCase(),
  },
});

    } catch (error) {

      console.error(
        "Forgot password error:",
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

    <div className="forgot-password-page">

      <div className="forgot-password-card">

        <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />


        <h1>
          Forgot Password
        </h1>


        <p className="forgot-password-subtitle">
          Enter your registered email to reset your password
        </p>


        <form
          onSubmit={handleForgotPassword}
        >

          <div className="input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
            />

          </div>


          {error && (

            <div className="forgot-password-error">
              {error}
            </div>

          )}


          {message && (

            <div className="forgot-password-success">
              {message}
            </div>

          )}


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Sending..."
              : "Send OTP"}

          </button>

        </form>


        <button
          type="button"
          className="back-to-login-btn"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>

      </div>

    </div>

  );

};

export default ForgotPassword;