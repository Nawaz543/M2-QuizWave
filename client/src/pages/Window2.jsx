import { useEffect, useState } from "react";
import "./styles/Window2.css";
import { useNavigate, useLocation } from "react-router-dom";


const predefinedTimes = [10, 15, 20, 30, 60];

function Window2() {
  const [pollTime, setPollTime] = useState(30);
  const [timeType, setTimeType] = useState("predefined");


  const [customTime, setCustomTime] = useState("");

  const [optionType, setOptionType] = useState("Any");

  const [forAllQuestions, setForAllQuestions] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  if (!location.state?.connected) {
    navigate("/", { replace: true });
  }
}, [location.state, navigate]);

  const handleTimeSelect = (time) => {
    setPollTime(time);
    setTimeType("predefined");
    setCustomTime("");
    setError("");
  };

  const handleCustomSelect = () => {
    setTimeType("custom");
    setPollTime("");
    setError("");
  };

  const handleCustomTime = (e) => {
    const value = e.target.value;

    // Sirf positive integer
    if (/^\d*$/.test(value)) {
      setCustomTime(value);
      setError("");
    }
  };

 const handleStartPoll = async () => {
  setError("");

  let finalTime;

  // ================================
  // Validate Time
  // ================================

  if (timeType === "custom") {
    if (!customTime) {
      setError("Please enter a custom time.");
      return;
    }

    if (Number(customTime) <= 0) {
      setError("Poll time must be greater than 0.");
      return;
    }

    finalTime = Number(customTime);
  } else {
    finalTime = Number(pollTime);
  }

  if (!finalTime || finalTime <= 0) {
    setError("Please select a valid poll time.");
    return;
  }


  // ================================
  // Validate Option Type
  // ================================

  if (!optionType) {
    setError("Please select an option type.");
    return;
  }


  // ================================
  // Get Video ID
  // ================================

  const videoId = location.state?.videoId;

  if (!videoId) {
    setError("YouTube video information is missing.");
    return;
  }


  // ================================
  // Poll Configuration
  // ================================

  const pollConfig = {
    pollTime: finalTime,
    timeType,
    optionType,
    forAllQuestions,
    questionNumber: location.state?.questionNumber || 1,
  };


  console.log("Starting Poll:", {
    videoId,
    pollConfig,
  });


  setLoading(true);


  try {

    // ================================
    // Start Backend Chat Collection
    // ================================

    const response = await fetch(
     "http://localhost:5000/api/youtube/poll/start",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          videoId,
          pollConfig,
        }),
      }
    );


    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "Failed to start poll."
      );
    }


    // ================================
    // Backend Successfully Started
    // ================================

    console.log("Poll Started:", data);


    // ================================
    // Go To Window 3
    // ================================

    navigate("/poll-engine", {
      state: {
        videoId,
        pollConfig,
        pollId: data.pollId,
      },
    });

  } catch (error) {

    console.error("Start Poll Error:", error);

    setError(
      error.message || "Unable to start poll."
    );

  } finally {

    setLoading(false);

  }
};

return (
  <div className="poll-page">

    <div className="poll-card">

      {/* Header */}
      <div className="poll-header">

        <img
          src="/logo.jpg"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />

        <div className="poll-header-content">

          <h1>Mission 2 QuizWave</h1>

          <p>
            Configure your poll
          </p>

        </div>

      </div>


      {/* Poll Time */}
      <div className="config-section">

        <div className="section-title">
          Poll Time
        </div>

        <div className="time-row">

          {predefinedTimes.map((time) => (
            <button
              key={time}
              className={`time-circle ${
                timeType === "predefined" &&
                pollTime === time
                  ? "active"
                  : ""
              }`}
              onClick={() => handleTimeSelect(time)}
            >
              {time}
            </button>
          ))}


          {/* Custom */}
          <button
            className={`time-circle custom-circle ${
              timeType === "custom" ? "active" : ""
            }`}
            onClick={handleCustomSelect}
          >
            +
          </button>

        </div>


        {/* Custom Time Input */}
        {timeType === "custom" && (
          <div className="custom-time-wrapper">

            <span className="time-icon">
              ⏱
            </span>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Seconds"
              value={customTime}
              onChange={handleCustomTime}
            />

            <span className="seconds-text">
              sec
            </span>

          </div>
        )}

      </div>


      {/* Option Type */}
      <div className="config-section">

        <div className="section-title">
          Option Type
        </div>

        <select
          className="option-select"
          value={optionType}
          onChange={(e) => setOptionType(e.target.value)}
        >

          <option value="ANY">
            Any
          </option>

          <option value="ABCD">
            A / B / C / D
          </option>

          <option value="abcd">
            a / b / c / d
          </option>

          <option value="ROMAN">
            I / II / III / IV
          </option>

          <option value="NUMBER">
            1 / 2 / 3 / 4
          </option>

        </select>

      </div>


      {/* For All Questions */}
      <div className="all-question-box">

        <div>

          <strong>
            For All Questions
          </strong>

          <p>
            Same settings for every question
          </p>

        </div>


        <button
          type="button"
          className={`toggle-btn ${
            forAllQuestions ? "on" : ""
          }`}
          onClick={() =>
            setForAllQuestions(!forAllQuestions)
          }
        >

          <span className="toggle-circle"></span>

        </button>

      </div>


      {/* Error */}
      {error && (
        <div className="status-box error-box">

          <span className="status-icon">
            ✕
          </span>

          <p>
            {error}
          </p>

        </div>
      )}


      {/* Start Poll */}
      <button
        className="start-poll-btn"
        onClick={handleStartPoll}
        disabled={loading}
      >

        {loading ? (
          <>
            <span className="spinner"></span>
            Starting...
          </>
        ) : (
          "Start Poll →"
        )}

      </button>

    </div>

  </div>
);
}

export default Window2;