import { BrowserRouter, Routes, Route } from "react-router-dom";

import YouTubeSetup from "./pages/YouTubeSetup";
import Window2 from "./pages/Window2";
import Window3 from "./pages/Window3";
import Window4 from "./pages/Window4";
import Window5 from "./pages/Window5";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ========================================
            PUBLIC ROUTE
        ======================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

       <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>


        {/* ========================================
            PROTECTED ROUTES
        ======================================== */}

        {/* Window 1 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <YouTubeSetup />
            </ProtectedRoute>
          }
        />


        {/* Window 2 */}
        <Route
          path="/poll"
          element={
            <ProtectedRoute>
              <Window2 />
            </ProtectedRoute>
          }
        />


        {/* Window 3 */}
        <Route
          path="/poll-engine"
          element={
            <ProtectedRoute>
              <Window3 />
            </ProtectedRoute>
          }
        />


        {/* Window 4 */}
        <Route
          path="/window4"
          element={
            <ProtectedRoute>
              <Window4 />
            </ProtectedRoute>
          }
        />


        {/* Window 5 */}
        <Route
          path="/window5"
          element={
            <ProtectedRoute>
              <Window5 />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;