
//  Window 1// 


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Window1.css";
import { logoutUser } from "../utils/auth";

function YouTubeSetup() {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [liveChatId, setLiveChatId] = useState("");
  const [quizSessionId, setQuizSessionId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      if (
        hostname === "www.youtube.com" ||
        hostname === "youtube.com"
      ) {
        if (parsedUrl.pathname === "/watch") {
          return parsedUrl.searchParams.get("v");
        }

        if (parsedUrl.pathname.startsWith("/live/")) {
          return parsedUrl.pathname.split("/")[2];
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          return parsedUrl.pathname.split("/")[2];
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return parsedUrl.pathname.split("/")[2];
        }
      }

      if (hostname === "youtu.be") {
        return parsedUrl.pathname.substring(1);
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleConnect = async () => {
    setError("");
    setSuccess("");
    setVideoId("");
    setVideoTitle("");
    setLiveChatId("");
    setQuizSessionId("");

    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube Live URL");
      return;
    }

    const id = extractVideoId(youtubeUrl);

    if (!id) {
      setError("Invalid YouTube URL");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/youtube/video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to connect to YouTube Live");
        return;
      }

      setVideoId(data.videoId);
      setVideoTitle(data.title);
      setLiveChatId(data.activeLiveChatId);
      setQuizSessionId(data.quizSessionId);

      setSuccess("YouTube Live connected");
    } catch (error) {
      console.error("Connection Error:", error);
      setError("Unable to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    console.log("Going to Window 2");
 // Connection successful nahi hai
  if (!videoTitle) {
    return;
  }

  navigate("/poll", {
  state: {
    connected: true,
    videoId,
    liveChatId,
    videoTitle,
    quizSessionId
  }
});
  };

  const trimTitle = (title, wordLimit ) => {
  const words = title.trim().split(/\s+/);

  if (words.length <= wordLimit) {
    return title;
  }

  return words.slice(0, wordLimit).join(" ") + ".....";
};

 return (
  <div className="youtube-page">

    <div className="youtube-card">

      {/* Header */}
      <div className="youtube-header">

        <img
          src="/logo.png"
          alt="QuizWave Logo"
          className="quizwave-logo"
        />

        <div className="youtube-header-content">
          <h1>Mission 2 QuizWave</h1>
          <p>
            Connect your YouTube live class to QuizWave
          </p>
        </div>

       <button
  className="logout-btn"
  onClick={logoutUser}
  title="Logout"
  aria-label="Logout"
>
  <span className="power-icon">⏻</span>
  <span className="logout-text">Logout</span>
</button>

      </div>


      {/* URL Section */}
      <div className="input-section">

        <div className="input-wrapper">

          <span className="input-icon">🔗</span>

          <input
            type="text"
            placeholder="Paste → https://youtube.com/live/..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConnect();
              }
            }}
          />

        </div>


        {/* Buttons */}
        <div className="button-row">

          {/* Connect Button */}
          <button
            className="connect-btn"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              "Connect Live"
            )}
          </button>


          {/* Continue Button */}
          {videoTitle && (
            <button
              className="next-btn"
              onClick={handleNext}
            >
              Continue →
            </button>
          )}

        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="status-box error-box">

          <span className="status-icon">✕</span>

          <div>
            <strong>Connection Failed</strong>
            <p>{error}</p>
          </div>

        </div>
      )}


      {/* Success */}
      {success && (
        <div className="status-box success-box">

          <span className="status-icon">✓</span>

          <div>
            <strong>{success}</strong>

            <p>
              🔴 {trimTitle(videoTitle, 6)}
            </p>
          </div>

        </div>
      )}


      {/* Footer */}
  
<div className="youtube-footer">
  <div className="footer-main">
    <span>QuizWave</span>
    <span>•</span>
    <span>Live Quiz System</span>
  </div>

  <div className="footer-developer">
    Developed by <strong>MD SHAHNAWAZ PERVEZ</strong>
  </div>
</div>


    </div>

  </div>
);
}

export default YouTubeSetup;