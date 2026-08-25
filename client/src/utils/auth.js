export const logoutUser = async () => {

  const token = localStorage.getItem("quizwaveToken");

  try {

    if (token) {

      await fetch(
        "http://localhost:5000/api/auth/logout",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    }

  } catch (error) {

    console.error("Logout request failed:", error);

  } finally {

    // Always clear local authentication
    localStorage.removeItem("quizwaveToken");
    localStorage.removeItem("quizwaveUser");

    // Go to login
    window.location.href = "/login";
  }
};