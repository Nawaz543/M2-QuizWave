import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Window4.css";

function Window4() {
  // Temporary data
  // Backend connect hone ke baad ye dynamic hoga
    const location = useLocation();
    const result = location.state?.result;

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

const handleEndPoll = () => {
  console.log("================================");
  console.log("END POLL");
  console.log("Poll ID:", location.state?.pollId);
  console.log("Question:", result?.questionNumber);
  console.log("Poll ended successfully");
  console.log("================================");
};


// ========================================
// Next Question
// ========================================

const handleNextQuestion = () => {
  console.log("================================");
  console.log("NEXT QUESTION");
  console.log("Current Question:", result?.questionNumber);
  console.log(
    "Next Question:",
    (result?.questionNumber || 0) + 1
  );
  console.log("================================");
};

  return (
    <div className="window4">

      {/* Header */}
      <div className="result-header">
        <span>RESULT</span>
        <span>Q.{result.questionNumber}</span>
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

                <div className="option-label">
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

        <button className="end-btn" onClick={handleEndPoll}>
          End Poll
        </button>

        <button className="next-que" onClick={handleNextQuestion}>
          Next Question →
        </button>

      </div>

    </div>
  );
}

export default Window4;