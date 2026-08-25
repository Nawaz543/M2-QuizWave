import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("quizwaveToken");

      if (!token) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("ADMIN CHECK:", data);

        if (!response.ok || !data.success) {
          localStorage.removeItem("quizwaveToken");
          localStorage.removeItem("quizwaveUser");

          setIsAdmin(false);
          return;
        }

        // Backend se verified role
        if (data.user.role === "admin") {
          localStorage.setItem(
            "quizwaveUser",
            JSON.stringify(data.user)
          );

          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

      } catch (error) {
        console.error("Admin verification error:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  // Verification chal raha hai
  if (checkingAdmin) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  // Login nahi hai
  if (!localStorage.getItem("quizwaveToken")) {
    return <Navigate to="/login" replace />;
  }

  // Logged-in hai but admin nahi
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin verified
  return children;
};

export default AdminRoute;