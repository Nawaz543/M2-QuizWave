
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/VerifyOTP.css";

const VerifyOTP = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");


  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


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
    // CHECK OTP
    // ========================================

    if (!otp.trim()) {

      setError("Please enter the OTP");

      return;

    }


    if (!/^\d{6}$/.test(otp)) {

      setError("OTP must be 6 digits");

      return;

    }


    try {

      setLoading(true);


      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "OTP verification failed"
        );

        return;

      }


      // ========================================
      // OTP VERIFIED
      // ========================================

      setMessage(
        "OTP verified successfully"
      );


      // ========================================
      // GO TO RESET PASSWORD
      // ========================================

      setTimeout(() => {

        navigate("/reset-password", {
          state: {
            email,
            resetToken: data.resetToken,
          },
        });

      }, 500);


    } catch (error) {

      console.error(
        "Verify OTP error:",
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

    <div className="verify-otp-page">

      <div className="verify-otp-card">

        <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />


        <h1>
          Verify OTP
        </h1>


        <p className="verify-otp-subtitle">

          Enter the 6-digit OTP sent to your email

        </p>


        <p className="verify-otp-email">

          {email}

        </p>


        <form
          onSubmit={handleVerifyOTP}
        >

          <div className="input-group">

            <label>
              OTP
            </label>


            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "")
                )
              }
              autoComplete="one-time-code"
            />

          </div>


          {error && (

            <div className="verify-otp-error">

              {error}

            </div>

          )}


          {message && (

            <div className="verify-otp-success">

              {message}

            </div>

          )}


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Verifying..."
              : "Verify OTP"}

          </button>

        </form>


        <button
          type="button"
          className="back-to-forgot-btn"
          onClick={() =>
            navigate("/forgot-password")
          }
        >
          ← Change Email
        </button>

      </div>

    </div>

  );

};

export default VerifyOTP;

