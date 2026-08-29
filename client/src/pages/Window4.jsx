import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/Window4.css";

function Window4() {
  const location = useLocation();
  const navigate = useNavigate();
 const [loading, setLoading] = useState(false);
  


  const result = location.state?.result;
  const pollId = location.state?.pollId;
  const pollConfig = location.state?.pollConfig;
    const videoId = location.state?.videoId;
    const quizSessionId = location.state?.quizSessionId;
   

  if (!result) {
    return (
      <div className="window4">
        <p>Poll result not found.</p>
      </div>
    );
  }

  const total = result.totalResponses;

  // ========================================
  // End Poll
  // ========================================

 const handleEndPoll = async () => {

  try {

    console.log("================================");
    console.log("END QUIZ");
    console.log("Quiz Session ID:", quizSessionId);
    console.log("================================");

    if (!quizSessionId) {
      alert("Quiz Session ID is missing.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/quiz-session/${quizSessionId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to complete quiz."
      );
    }

    console.log(
      "Quiz completed successfully:",
      data
    );

   navigate("/window5", {
  state: {
    quizSessionId
  }
});

  } catch (error) {

    console.error(
      "End Quiz Error:",
      error
    );

    alert(
      error.message ||
      "Unable to end quiz."
    );

  }

};

  // ========================================
  // Next Question
  // ========================================

const handleNextQuestion = async () => {
  const currentQuestion = result?.questionNumber || 1;
  const nextQuestion = currentQuestion + 1;

  console.log("================================");
  console.log("NEXT QUESTION");
  console.log("Current Question:", currentQuestion);
  console.log("Next Question:", nextQuestion);
  console.log(
    "For All Questions:",
    pollConfig?.forAllQuestions
  );
  console.log("================================");

  // ========================================
  // FOR ALL QUESTIONS = ON
  // ========================================

  if (pollConfig?.forAllQuestions === true) {
    console.log("Starting new poll with same configuration...");

    const newPollConfig = {
      ...pollConfig,
      questionNumber: nextQuestion,
    };

    try {
       setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/youtube/poll/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            videoId,
            pollConfig: newPollConfig,
            quizSessionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to start next poll."
        );
      }

      console.log("New Poll Started:", data);

      // ========================================
      // Go directly to Window 3
      // ========================================

      navigate("/poll-engine", {
        state: {
          videoId,
          pollConfig: newPollConfig,
          pollId: data.pollId,
          quizSessionId,
        },
      });

    } catch (error) {
      console.error(
        "Next Poll Start Error:",
        error
      );

      alert(
        error.message ||
        "Unable to start next poll."
      );
    }finally {

  setLoading(false);

}

    return;
  }

  // ========================================
  // FOR ALL QUESTIONS = OFF
  // ========================================

  console.log(
    "Going to Window 2 for new configuration..."
  );

  navigate("/poll", {
    state: {
      connected: true,
      videoId,
      questionNumber: nextQuestion,
      previousResult: result,
    },
  });
};

  return (
    <div className="window4">

      {/* Header */}
      <div className="result-header">
         <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />
        <span>RESULT</span>
        <span>Q. #</span>
      </div>

      <div className="result-stats">

        {/* Summary */}
        <div className="result-summary">

          <div>
            <span>Total</span>
            <strong>{result.totalResponses}</strong>
          </div>

          <div className="correct">
            <span>Correct</span>
            <strong>{result.correctCount}</strong>
          </div>

          <div className="incorrect">
            <span>Wrong</span>
            <strong>{result.incorrectCount}</strong>
          </div>

        </div>

        {/* Options */}
        <div className="options">

          {Object.entries(result.optionStats).map(
            ([option, count]) => {

              const percentage =
                total > 0
                  ? Math.round((count / total) * 100)
                  : 0;

              const isCorrect =
                option === result.normalizedCorrectAnswer;

              return (
                <div className="option-row" key={option}>

                  <div className=" option-label-win4">
                    {option}
                  </div>

                  <div className="bar-container">

                    <div
                      className="bar"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <div className="option-value">
                    {count} ({percentage}%)
                  </div>

                  {isCorrect && (
                    <span className="correct-mark">
                      ✓
                    </span>
                  )}

                </div>
              );
            }
          )}

        </div>
      </div>

      {/* First Correct */}
      <div className="first-correct">

        <span className="trophy">
          🥇
        </span>

        <div>
          <small>First Correct</small>

          <strong>
            {result.firstCorrectParticipant?.username ||
              "No correct answer"}
          </strong>
        </div>

      </div>

      {/* Buttons */}
      <div className="result-actions">

        <button
          className="end-btn"
          onClick={handleEndPoll}
        >
          End Poll
        </button>

        <button
          className="next-que"
          onClick={handleNextQuestion }
           disabled={ loading}
        >

           {loading
              ? "Loading..."
              : "Next Question →"}
          
        </button>

      </div>

    </div>
  );
}

export default Window4;