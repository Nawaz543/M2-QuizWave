import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Window5.css";

function Window5() {
  const location = useLocation();

  const pollId = location.state?.pollId;
  const pollConfig = location.state?.pollConfig;
  const videoId = location.state?.videoId;
  const lastResult = location.state?.lastResult;

  console.log("================================");
  console.log("FINAL ANALYSIS");
  console.log("Poll ID:", pollId);
  console.log("Video ID:", videoId);
  console.log("Poll Config:", pollConfig);
  console.log("Last Result:", lastResult);
  console.log("================================");

  return (
    <div className="window5">
      <h1>Poll Summary</h1>

      <p>Final Analysis</p>
    </div>
  );
}

export default Window5;