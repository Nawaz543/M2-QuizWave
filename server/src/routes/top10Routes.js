// saving top 10 students form window 5 ranking tab to db 
const express = require("express");
const router = express.Router();

const Top10Ranking = require("../models/Top10Ranking");
const CorrectResponse = require("../models/CorrectResponse");


// ========================================
// SAVE TOP 10 + CLEAR CORRECT RESPONSES
// ========================================

router.post("/save-and-clear", async (req, res) => {

  try {

    const {
      quizSessionId,
      videoTitle,
      top10
    } = req.body;


    // ========================================
    // VALIDATION
    // ========================================

    if (!quizSessionId) {
      return res.status(400).json({
        success: false,
        message: "Quiz Session ID is required"
      });
    }


    if (!videoTitle) {
      return res.status(400).json({
        success: false,
        message: "Video title is required"
      });
    }


    if (!Array.isArray(top10)) {
      return res.status(400).json({
        success: false,
        message: "Top 10 data must be an array"
      });
    }


    // ========================================
    // SAVE TOP 10
    // ========================================

    const savedTop10 = await Top10Ranking.create({

      quizSessionId,

      videoTitle,

      top10

    });


    console.log(
      "Top 10 ranking saved:",
      savedTop10._id
    );


    // ========================================
    // CLEAR CORRECT RESPONSES
    // ONLY CURRENT SESSION
    // ========================================

    const deleteResult =
      await CorrectResponse.deleteMany({
        quizSessionId
      });


    console.log(
      "Correct responses deleted:",
      deleteResult.deletedCount
    );


    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({

      success: true,

      message:
        "Top 10 saved and correct responses cleared successfully",

      savedRankingId:
        savedTop10._id,

      deletedCorrectResponses:
        deleteResult.deletedCount

    });


  } catch (error) {

    console.error(
      "Save Top 10 / Clear CorrectResponse Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to save Top 10 or clear correct responses"

    });

  }

});


module.exports = router;