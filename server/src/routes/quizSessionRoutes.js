const express = require("express");
const router = express.Router();

const QuizSession = require("../models/QuizSession");

// ========================================
// COMPLETE QUIZ SESSION
// ========================================

router.post("/:quizSessionId/complete", async (req, res) => {

  try {

    const { quizSessionId } = req.params;

    if (!quizSessionId) {
      return res.status(400).json({
        success: false,
        message: "Quiz Session ID is required"
      });
    }

    const quizSession =
      await QuizSession.findById(quizSessionId);

    if (!quizSession) {
      return res.status(404).json({
        success: false,
        message: "Quiz Session not found"
      });
    }

    // Already completed
    if (quizSession.status === "completed") {
      return res.json({
        success: true,
        message: "Quiz Session already completed",
        quizSession
      });
    }

    // ========================================
    // Update Status
    // ========================================

    quizSession.status = "completed";
    quizSession.completedAt = new Date();

    await quizSession.save();

    console.log(
      `Quiz Session completed: ${quizSessionId}`
    );

    return res.json({
      success: true,
      message: "Quiz Session completed successfully",
      quizSessionId,
      status: quizSession.status,
      completedAt: quizSession.completedAt
    });

  } catch (error) {

    console.error(
      "Complete Quiz Session Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to complete quiz session"
    });

  }

});

module.exports = router;