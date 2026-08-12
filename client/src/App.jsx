import { BrowserRouter, Routes, Route } from "react-router-dom";

import YouTubeSetup from "./pages/YouTubeSetup";
import Window2 from "./pages/Window2";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Window 1 */}
        <Route
          path="/"
          element={<YouTubeSetup />}
        />

        {/* Window 2 */}
        <Route
          path="/poll"
          element={<Window2 />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;