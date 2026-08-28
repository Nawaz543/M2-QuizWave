import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./styles/Window5.css";

function Window5() {

   const navigate = useNavigate();
  const location = useLocation();

  const quizSessionId =
    location.state?.quizSessionId;

  const [analysis, setAnalysis] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [toppers, setToppers] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");


  // ========================================
  // FETCH FINAL ANALYSIS
  // ========================================

  useEffect(() => {

    const fetchAnalysis = async () => {

      if (!quizSessionId) {

        setError(
          "Quiz Session ID not found"
        );

        setLoading(false);

        return;
      }


      try {

        console.log(
          "Fetching analysis for:",
          quizSessionId
        );


        const response =
          await fetch(
            `http://localhost:5000/api/quiz-session/${quizSessionId}/analysis`
          );


        const data =
          await response.json();


        if (!response.ok || !data.success) {

          throw new Error(
            data.message ||
            "Failed to fetch analysis"
          );

        }


        console.log(
          "Final Analysis:",
          data
        );


        setAnalysis(data);
        setQuestionStats(data.polls);

      } catch (error) {

        console.error(
          "Window 5 Analysis Error:",
          error
        );

        setError(
          error.message ||
          "Failed to load analysis"
        );

      } finally {

        setLoading(false);

      }

    };


    fetchAnalysis();

  }, [quizSessionId]);

  // toppers
  useEffect(() => {

  const fetchToppers = async () => {

    if (!quizSessionId) return;

    try {

      const response = await fetch(
        `http://localhost:5000/api/quiz-session/${quizSessionId}/toppers`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch toppers"
        );
      }

      console.log("Toppers:", data.toppers);

      setToppers(data.toppers);

    } catch (error) {

      console.error(
        "Toppers Fetch Error:",
        error
      );

    }

  };

  fetchToppers();

}, [quizSessionId]);


useEffect(() => {

  const fetchRanking = async () => {

    if (!quizSessionId) return;

    try {

      const response =
        await fetch(
          `http://localhost:5000/api/quiz-session/${quizSessionId}/ranking`
        );


      const data =
        await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Failed to fetch ranking"
        );

      }


      console.log(
        "Ranking:",
        data.ranking
      );


      setRanking(
        data.ranking
      );


    } catch (error) {

      console.error(
        "Ranking Fetch Error:",
        error
      );

    }

  };


  fetchRanking();

}, [quizSessionId]);


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <div className="window5">

        <div className="loading-screen">
          Loading...
        </div>

      </div>
    );

  }


  // ========================================
  // ERROR
  // ========================================

  if (error) {

    return (
      <div className="window5">

        <div className="error-screen">
          {error}
        </div>

      </div>
    );

  }


  // ========================================
  // NO DATA
  // ========================================

  if (!analysis) {

    return (
      <div className="window5">

        <div className="error-screen">
          No analysis data found
        </div>

      </div>
    );

  }


  const quiz =
    analysis.quizSession;


  // ========================================
  // DATE & TIME
  // ========================================

  const startDate =
    quiz.startedAt
      ? new Date(quiz.startedAt)
      : null;


  const date =
    startDate
      ? startDate.toLocaleDateString()
      : "-";


  const time =
    startDate
      ? startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "-";
// handle new session
    const handleNewSession = async () => {
  try {
    setLoading(true);
    if (!quizSessionId) {
      alert("Quiz Session ID not found");
      return;
    }

    // Current ranking se Top 10
    const top10 = ranking.slice(0, 10).map((student) => ({
      rank: student.rank,
      userId: student.userId,
      username: student.username,
      totalCorrect: student.totalCorrect,
      performanceScore: student.performanceScore,
    }));

    console.log("Saving Top 10:", top10);

    // Backend ko Top 10 save + CorrectResponse clear karne bolo
    const response = await fetch(
      `http://localhost:5000/api/top10/save-and-clear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizSessionId,
          videoTitle: quiz.videoTitle || "Untitled Live",
          top10,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to start new session"
      );
    }

    console.log(
      "Top 10 saved and correct responses cleared:",
      data
    );

    // Local storage clear
    localStorage.removeItem("quizSession");
    localStorage.removeItem("pollData");
    localStorage.removeItem("quizData");
    localStorage.removeItem("currentPoll");
    localStorage.removeItem("quizResults");

    // New session
    navigate("/");

  } catch (error) {
    console.error("New Session Error:", error);

    alert(
      error.message ||
      "Failed to start new session"
    );
  }finally {

  setLoading(false);

}
};


const trimTitle = (title, wordLimit ) => {
  const words = title.trim().split(/\s+/);

  if (words.length <= wordLimit) {
    return title;
  }

  return words.slice(0, wordLimit).join(" ") + ".....";
};

  // ========================================
  // UI
  // ========================================

  return (

    <div className="window5">

     {/* HEADER */}

<div className="window5-header">
   <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />

  <div>
    <h1>
      Final Analysis
    </h1>

    <p>
      Quiz Summary
    </p>
  </div>

  <button
    className="new-session-btn"
    onClick={handleNewSession}
  >
    {loading
              ? "Wait a min..."
              : "New Session →"}
  </button>

</div>

    <div className="analysis-tabs">

  <button
    className={`tab-button ${
      activeTab === "summary" ? "active" : ""
    }`}
    onClick={() => setActiveTab("summary")}
  >
    Summary
  </button>


  <button
    className={`tab-button ${
      activeTab === "toppers" ? "active" : ""
    }`}
    onClick={() => setActiveTab("toppers")}
  >
    Toppers
  </button>


  <button
    className={`tab-button ${
      activeTab === "ranking" ? "active" : ""
    }`}
    onClick={() => setActiveTab("ranking")}
  >
    Ranking
  </button>


  <button
    className={`tab-button ${
      activeTab === "questionStats" ? "active" : ""
    }`}
    onClick={() =>
      setActiveTab("questionStats")
    }
  >
    Question Stats
  </button>

</div>


      {/* SUMMARY */}
      {activeTab === "summary" && (

      <div className="summary-card">

        <div className="title-section">

          <span className="label">
            LIVE TITLE
          </span>

          <h2>
  {trimTitle(quiz.videoTitle || "Untitled Live", 6)}
</h2>

        </div>


        <div className="stats-grid">


          <div className="stat-box">

            <span>
              Questions
            </span>

            <strong>
              {quiz.totalQuestions}
            </strong>

          </div>


          <div className="stat-box">

            <span>
              Responses
            </span>

            <strong>
              {quiz.totalResponses}
            </strong>

          </div>


          <div className="stat-box correct">

            <span>
              Correct
            </span>

            <strong>
              {quiz.totalCorrect}
            </strong>

          </div>


          <div className="stat-box incorrect">

            <span>
              Incorrect
            </span>

            <strong>
              {quiz.totalIncorrect}
            </strong>

          </div>


        </div>


        <div className="accuracy-box">

          <span>
            Overall Accuracy
          </span>

          <strong>
            {quiz.overallAccuracy}%
          </strong>

        </div>


        <div className="date-time">

          <div>

            <span>
              DATE
            </span>

            <strong>
              {date}
            </strong>

          </div>


          <div>

            <span>
              TIME
            </span>

            <strong>
              {time}
            </strong>

          </div>

        </div>

      </div>
      )}

       {/* TOPPERs */}
      {activeTab === "toppers" && (

  <div className="tab-content slide-in">

    <div className="toppers-section">

      <div className="section-title">

        <h2>
          🏆 Toppers
        </h2>

        <span>
          First correct
        </span>

      </div>


      <div className="toppers-list">

        {toppers
          .filter(
            (student) =>
              student.rank === 1
          )
          .sort(
            (a, b) =>
              a.questionNumber -
              b.questionNumber
          )
          .map((student, index) => (

            <div
              className="topper-item"
              key={`${student.questionNumber}-${student.userId}`}
            >

              <div className="topper-rank">
                #{student.questionNumber}
              </div>


              <div className="topper-info">

                <strong>
                  {student.username}
                </strong>

                <span>
                  Question {student.questionNumber}
                </span>

              </div>


              <div className="response-time">

                {student.responseTime}s

              </div>

            </div>

          ))}

      </div>

    </div>

  </div>

)}

      {/* RANKING */}
     {activeTab === "ranking" && (

  <div className="tab-content slide-in">

    <div className="ranking-section">

      <div className="section-title">

        <h2>
          📊 Ranking
        </h2>

        <span>
          Performance
        </span>

      </div>


      <div className="ranking-list">

        {ranking.length === 0 ? (

          <div className="empty-state">
            No ranking data available
          </div>

        ) : (

          ranking.slice(0, 10).map((student) => (

            <div
              className="ranking-item"
              key={student.userId}
            >

              <div className="ranking-position">

                #{student.rank}

              </div>


              <div className="ranking-info">

                <strong>
                  {student.username}
                </strong>

                <span>
                  {student.totalCorrect} correct
                  {" • "}
                  {student.totalTime.toFixed(1)}s
                </span>

              </div>


              <div className="performance-score">

                {student.performanceScore}

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  </div>

)}

      {/* QUESTION STATS */}
   {activeTab === "questionStats" && (

  <div className="tab-content slide-in">

    <div className="question-stats-section">

      <div className="section-title">
        <h2>📋 Question Stats</h2>
      </div>

      <div className="question-stats-list">

        {questionStats.length === 0 ? (

          <div className="empty-state">
            No question data available
          </div>

        ) : (

          questionStats.map((question) => (

            <div
              className="question-stat-card"
              key={question.pollId}
            >

              <div className="question-stat-header">

                <strong>
                  Q{question.questionNumber}
                </strong>

                <span>
                  {question.status}
                </span>

              </div>


              <div className="correct-answer">

                <span>Correct Answer</span>

                <strong>
                  {question.correctAnswer}
                </strong>

              </div>


              <div className="question-stat-grid">

                <div>
                  <span>Total</span>
                  <strong>
                    {question.totalResponses}
                  </strong>
                </div>


                <div>
                  <span>Correct</span>
                  <strong>
                    {question.correctCount}
                  </strong>
                </div>


                <div>
                  <span>Incorrect</span>
                  <strong>
                    {question.incorrectCount}
                  </strong>
                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  </div>

)}

    </div>

  );

}

export default Window5;