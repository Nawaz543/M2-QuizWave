import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/Window3.css";
// import { Linkedin } from "lucide-react";

function Window3() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const pollConfig = location.state?.pollConfig;
  const pollId = location.state?.pollId;
  const videoId = location.state?.videoId;
  const quizSessionId = location.state?.quizSessionId;
  const pollStartTime = location.state?.pollStartTime;
  

  const [timeLeft, setTimeLeft] = useState(
    pollConfig?.pollTime || 15
  );

  const [isRunning, setIsRunning] = useState(true);

  // =================================
  // Phase 5
  // Teacher Selected Correct Answer
  // =================================

  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [answerConfirmed, setAnswerConfirmed] = useState(false);


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

  // const handleStopTime = () => {
  //   setIsRunning(false);
  // };

const handleStopTime = async () => {

  if (!pollId) {

    alert("Poll ID not found.");

    return;
  }

  try {

    const response = await fetch(
      `http://localhost:5000/api/youtube/poll/${pollId}/stop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();


    if (!response.ok || !data.success) {

      alert(
        data.message || "Failed to stop poll"
      );

      return;
    }


    // Backend successfully stopped
    setIsRunning(false);


    console.log(
      `Poll ${pollId} stopped successfully`
    );

  } catch (error) {

    console.error(
      "Stop Poll Error:",
      error
    );

    alert(
      "Unable to connect to server."
    );

  }

};


  // ================================
  // Teacher Select Correct Answer
  // ================================

  const handleSelectAnswer = (option) => {

    // Timer chal raha hai
    if (isRunning) return;

    // Answer already confirmed
    if (answerConfirmed) return;

    setCorrectAnswer(option);

    console.log("Teacher selected correct answer:", option);
  };


  // ================================
  // Confirm Correct Answer
  // ================================

 const handleConfirmAnswer = async () => {

  if (!correctAnswer) {
    alert("Please select the correct answer first.");
    return;
  }

  if (!pollId) {
    alert("Poll ID not found.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `http://localhost:5000/api/poll-result/${pollId}/result`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          correctAnswer
        })
      }
    );


    const data = await response.json();


    if (!response.ok || !data.success) {

      alert(
        data.message || "Failed to calculate poll result"
      );

      return;
    }


    console.log(
      "Poll Result:",
      data.result
    );


    // Answer lock
    setAnswerConfirmed(true);


    // Result available
    console.log(
      "Total Responses:",
      data.result.totalResponses
    );

    console.log(
      "Correct:",
      data.result.correctCount
    );

    console.log(
      "Incorrect:",
      data.result.incorrectCount
    );

    console.log(
      "First Correct:",
      data.result.firstCorrectParticipant
    );

    console.log(
      "Option Stats:",
      data.result.optionStats
    );


// =================================
// Open Window 4
// =================================

navigate("/window4", {
  state: {
    videoId,
    pollId,
    result: data.result,
    pollConfig,
    quizSessionId,
  },
});

  } catch (error) {

    console.error(
      "Result API Error:",
      error
    );

    alert(
      "Unable to connect to server."
    );

  } finally {

  setLoading(false);

}

};


  // ================================
  // Countdown Timer
  // ================================

  // useEffect(() => {
  //   if (!isRunning || timeLeft <= 0) return;

  //   const timer = setInterval(() => {

  //     setTimeLeft((prev) => {

  //       if (prev <= 1) {

  //         clearInterval(timer);

  //         setIsRunning(false);

  //         return 0;
  //       }

  //       return prev - 1;
  //     });

  //   }, 1000);

  //   return () => clearInterval(timer);

  // }, [isRunning, timeLeft]);

useEffect(() => {

  if (
    !pollStartTime ||
    !pollConfig?.pollTime ||
    !isRunning
  ) {
    return;
  }

  const totalTime =
    Number(pollConfig.pollTime) * 1000;

  const updateTimer = () => {

    const elapsed =
      Date.now() - Number(pollStartTime);

    const remaining =
      Math.max(0, totalTime - elapsed);

    const remainingSeconds =
      Math.ceil(remaining / 1000);

    setTimeLeft(remainingSeconds);

    if (remaining <= 0) {

      setTimeLeft(0);

      setIsRunning(false);
    }
  };

  // Immediately calculate
  updateTimer();

  const timer = setInterval(
    updateTimer,
    250
  );

  return () => {
    clearInterval(timer);
  };

}, [
  pollStartTime,
  pollConfig?.pollTime,
  isRunning
]);


  // ================================
  // UI
  // ================================

  return (
    <div className="poll-page">

      <div className="poll-card">

        {/* Header */}
        <div className="poll-header2">
          <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />

          <div>
            <p className="poll-label">LIVE POLL</p>

            <h1>
              Question #
            </h1>
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

          <div className={`timer ${!isRunning ? "timer-stopped" : ""}`}>
  {timeLeft}
  <span>sec</span>
</div>

          <div className="timer-line">

            <div
  className={`timer-progress ${!isRunning ? "progress-stopped" : ""}`}
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
              : answerConfirmed
              ? "CORRECT ANSWER CONFIRMED"
              : "SELECT CORRECT ANSWER"}

          </p>


          <div className="select-options">

            {options.map((option) => (

              <div
                className={`option
                  ${isRunning ? "disabled" : ""}
                  ${correctAnswer === option ? "selected" : ""}
                  ${answerConfirmed ? "confirmed" : ""}
                `}
                key={option}
                onClick={() => handleSelectAnswer(option)}
              >

                <span>{option}</span>

              </div>

            ))}

          </div>


          {/* Confirm Button */}

          {!isRunning && !answerConfirmed && (

            <button
              className="confirm-answer-button"
              onClick={handleConfirmAnswer}
              disabled={!correctAnswer || loading}
            >

               {loading
              ? "Loading..."
              : "✓ Confirm Correct Answers"}
              
            </button>

          )}

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
<div className="developer-credit">
  <span className="linkedin-badge">in</span>
  <span>Developed by MD SHAHNAWAZ PERVEZ</span>
</div>

    </div>
  );
}

export default Window3;