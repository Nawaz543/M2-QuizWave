const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

const youtubeRoutes = require("./routes/youtubeRoutes");
const pollResultRoutes = require("./routes/pollResultRoutes");
const quizSessionRoutes = require("./routes/quizSessionRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const top10Routes = require("./routes/top10Routes");

app.use(cors());
app.use(express.json());
app.use("/api/youtube", youtubeRoutes);
app.use("/api/poll-result", pollResultRoutes);
app.use( "/api/quiz-session", quizSessionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/top10", top10Routes);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});