import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./styles/Window3.css";

function Window3() {
  const location = useLocation();

  const pollConfig = location.state?.pollConfig;

  const [timeLeft, setTimeLeft] = useState(
    pollConfig?.pollTime || 15
  );

  const [isRunning, setIsRunning] = useState(true);

  // ================================ 
  // Option Type
  // ================================

  const optionSets = {
    "ABCD": ["A", "B", "C", "D"],
    "abcd": ["a", "b", "c", "d"],
    "ROMAN": ["I", "II", "III", "IV"],
    "NUMBER": ["1", "2", "3", "4"],
  };

  const options =
    optionSets[pollConfig?.optionType] || ["A", "B", "C", "D"];


  // ================================
  // Stop Time
  // ================================

  const handleStopTime = () => {
    setIsRunning(false);
  };


  // ================================
  // Countdown Timer
  // ================================

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);


  // ================================
  // UI
  // ================================

  return (
    <div className="poll-page">

      <div className="poll-card">

        {/* Header */}
        <div className="poll-header">

          <div>
            <p className="poll-label">LIVE POLL</p>
            <h1>Question #{pollConfig?.questionNumber || "1"}</h1>
          </div>

          <div className="status">

            <span
              className={`status-dot ${
                isRunning ? "active" : "stopped"
              }`}
            ></span>

            {isRunning ? "LIVE" : "STOPPED"}

          </div>

        </div>


        {/* Timer */}
        <div className="timer-section">

          <p className="timer-label">
            TIME REMAINING
          </p>

          <div className="timer">

            {timeLeft}

            <span>sec</span>

          </div>

          <div className="timer-line">

            <div
              className="timer-progress"
              style={{
                width: `${
                  pollConfig?.pollTime
                    ? (timeLeft / pollConfig.pollTime) * 100
                    : 0
                }%`,
              }}
            ></div>

          </div>

        </div>


        {/* Options */}
        <div className="options-section">

          <p className="option-label">
            {isRunning
              ? "ACCEPTING RESPONSES"
              : "TIME ENDED"}
          </p>


          <div className="options">

            {options.map((option) => (

              <div
                className="option"
                key={option}
              >
                <span>{option}</span>
              </div>

            ))}

          </div>

        </div>


        {/* Stop Button */}
        <button
          className="stop-button"
          onClick={handleStopTime}
          disabled={!isRunning}
        >

          {isRunning
            ? "⏹ Stop Time"
            : "✓ Time Stopped"}

        </button>

      </div>

    </div>
  );
}

export default Window3;