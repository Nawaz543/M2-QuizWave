const express = require("express");
const router = express.Router();

const QuizSession = require("../models/QuizSession");
const Poll = require("../models/Poll");
const CorrectResponse = require("../models/CorrectResponse");

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


// ========================================
// GET FINAL QUIZ ANALYSIS
// ========================================

router.get("/:quizSessionId/analysis", async (req, res) => {

  try {

    const { quizSessionId } = req.params;

    if (!quizSessionId) {
      return res.status(400).json({
        success: false,
        message: "Quiz Session ID is required"
      });
    }


    // ========================================
    // Get Quiz Session
    // ========================================

    const quizSession =
      await QuizSession.findById(quizSessionId).lean();

    if (!quizSession) {
      return res.status(404).json({
        success: false,
        message: "Quiz Session not found"
      });
    }


    // ========================================
    // Get All Polls
    // ========================================

    const polls =
      await Poll.find({
        quizSessionId
      })
      .sort({
        questionNumber: 1
      })
      .lean();


    // ========================================
    // Get Correct Responses
    // ========================================

    const correctResponses =
      await CorrectResponse.find({
        quizSessionId
      })
      .sort({
        questionNumber: 1,
        rank: 1
      })
      .lean();


    // ========================================
    // Send Analysis
    // ========================================

    const totalQuestions = polls.length;

return res.json({

  success: true,

  quizSession: {

    id: quizSession._id,

    videoId:
      quizSession.videoId,

    videoTitle:
      quizSession.videoTitle,

    totalQuestions,

    totalResponses:
      quizSession.totalResponses,

    totalCorrect:
      quizSession.totalCorrect,

    totalIncorrect:
      quizSession.totalIncorrect,

    overallAccuracy:
      quizSession.overallAccuracy,

    startedAt:
      quizSession.startedAt,

    completedAt:
      quizSession.completedAt

  },

  polls,

  correctResponses

});


  } catch (error) {

    console.error(
      "Final Analysis Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch final analysis"

    });

  }

});

// ========================================
// GET QUIZ SESSION SUMMARY
// ========================================

router.get("/:quizSessionId", async (req, res) => {

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

    res.json({
      success: true,
      quizSession
    });

  } catch (error) {

    console.error(
      "Get Quiz Session Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz session"
    });

  }

});

// ========================================
// GET QUIZ TOPPERS
// ========================================

router.get("/:quizSessionId/toppers", async (req, res) => {

  try {

    const { quizSessionId } = req.params;

    const toppers = await CorrectResponse.find({
      quizSessionId
    })
      .sort({
        questionNumber: 1,
        rank: 1
      })
      .lean();

    res.json({
      success: true,
      toppers
    });

  } catch (error) {

    console.error(
      "Get Toppers Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch toppers"
    });

  }

});

// ========================================
// GET QUIZ RANKING
// ========================================

router.get("/:quizSessionId/ranking", async (req, res) => {

  try {

    const { quizSessionId } = req.params;


    // ========================================
    // GET QUIZ SESSION
    // ========================================

    const quizSession =
      await QuizSession.findById(
        quizSessionId
      ).lean();


    if (!quizSession) {

      return res.status(404).json({

        success: false,

        message:
          "Quiz Session not found"

      });

    }


    // ========================================
    // GET CORRECT RESPONSES
    // ========================================

    const responses =
      await CorrectResponse.find({
        quizSessionId
      }).lean();


    // ========================================
    // GROUP STUDENTS
    // ========================================

    const students = {};


    responses.forEach((response) => {

      const userId =
        response.userId;


      if (!students[userId]) {

        students[userId] = {

          userId,

          username:
            response.username,

          totalCorrect: 0,

          totalTime: 0

        };

      }


      students[userId].totalCorrect++;


      students[userId].totalTime +=
        Number(
          response.responseTime || 0
        );

    });


    // ========================================
    // CONVERT TO ARRAY
    // ========================================

    const ranking =
      Object.values(students);


    // ========================================
    // TOTAL QUESTIONS
    // ========================================

    const totalQuestions = await Poll.countDocuments({
  quizSessionId
});


    // ========================================
    // FASTEST TOTAL TIME
    // ========================================

    const fastestTime =
      ranking.length > 0
        ? Math.min(
            ...ranking.map(
              (student) =>
                student.totalTime
            )
          )
        : 0;


    // ========================================
    // CALCULATE SCORE
    // ========================================

    ranking.forEach((student) => {


      // ------------------------------------
      // Correct Score = 70%
      // ------------------------------------

      const correctScore =
        totalQuestions > 0

          ? (
              (
                student.totalCorrect /
                totalQuestions
              ) * 70
            )

          : 0;


      // ------------------------------------
      // Time Score = 30%
      // ------------------------------------

      const timeScore =
        student.totalTime > 0 &&
        fastestTime > 0

          ? (
              (
                fastestTime /
                student.totalTime
              ) * 30
            )

          : 0;


      // ------------------------------------
      // Performance Score
      // ------------------------------------

      student.correctScore =
        Number(
          correctScore.toFixed(2)
        );


      student.timeScore =
        Number(
          timeScore.toFixed(2)
        );


      student.performanceScore =
        Number(
          (
            correctScore +
            timeScore
          ).toFixed(2)
        );

    });


    // ========================================
    // SORT BY PERFORMANCE
    // ========================================

    ranking.sort((a, b) => {

      // First priority:
      // Performance Score

      if (
        b.performanceScore !==
        a.performanceScore
      ) {

        return (
          b.performanceScore -
          a.performanceScore
        );

      }


      // Second priority:
      // Total Correct

      if (
        b.totalCorrect !==
        a.totalCorrect
      ) {

        return (
          b.totalCorrect -
          a.totalCorrect
        );

      }


      // Third priority:
      // Faster time

      return (
        a.totalTime -
        b.totalTime
      );

    });


    // ========================================
    // ASSIGN RANK
    // ========================================

    ranking.forEach(
      (student, index) => {

        student.rank =
          index + 1;

      }
    );


    // ========================================
    // RESPONSE
    // ========================================

    return res.json({

      success: true,

      totalQuestions,

      ranking

    });


  } catch (error) {

    console.error(
      "Get Ranking Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch ranking"

    });

  }

});

module.exports = router;