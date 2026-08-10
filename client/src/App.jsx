import { useEffect, useState } from "react";
import YouTubeSetup from "./pages/YouTubeSetup";

function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Backend connection failed");
      });
  }, []);

  return (
    <>
    <YouTubeSetup />
    </>
  );
}

export default App;