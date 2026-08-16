// ========================================
// Poll Result Routes
// ========================================

// correct answer receive hoga
// pollSessions se responses milenge
// correct/incorrect calculate honge
// first correct participant milega
// option statistics banegi
// result return hoga


const express = require("express");

const router = express.Router();

const pollSessions =
  require("../store/pollSessions");



// ========================================
// Normalize Answer
// ========================================

const normalizeAnswer = (answer, optionType) => {

  if (!answer) {
    return null;
  }


  const value =
    answer.toString().trim();


  // ========================================
  // ANY Mode
  // ========================================

  if (optionType === "Any") {

    const answerMap = {

      A: "A",
      a: "A",
      1: "A",
      I: "A",

      B: "B",
      b: "B",
      2: "B",
      II: "B",

      C: "C",
      c: "C",
      3: "C",
      III: "C",

      D: "D",
      d: "D",
      4: "D",
      IV: "D"

    };


    return answerMap[value] || null;
  }


  // ========================================
  // Other Modes
  // ========================================

  return value;

};



// ========================================
// Calculate Poll Result
// ========================================

router.post(
  "/:pollId/result",
  (req, res) => {

    try {

      const { pollId } =
        req.params;

      const { correctAnswer } =
        req.body;



      // ========================================
      // Find Poll Session
      // ========================================

      const session =
        pollSessions.get(pollId);


      if (!session) {

        return res.status(404).json({

          success: false,

          message:
            "Poll session not found"

        });

      }



      // ========================================
      // Validate Correct Answer
      // ========================================

      if (!correctAnswer) {

        return res.status(400).json({

          success: false,

          message:
            "Correct answer is required"

        });

      }



      // ========================================
      // Collected Responses
      // ========================================

      const responses =
        session.responses || [];



      // ========================================
      // Normalize Teacher Answer
      // ========================================

      const normalizedCorrectAnswer =
        normalizeAnswer(
          correctAnswer,
          session.optionType
        );



      // ========================================
      // Correct / Incorrect
      // ========================================

      let correctCount = 0;

      let incorrectCount = 0;


      const participants =
        responses.map((response) => {


          // Normalize student answer
          const normalizedAnswer =
            normalizeAnswer(
              response.answer,
              session.optionType
            );


          // Compare normalized answers
          const isCorrect =
            normalizedAnswer ===
            normalizedCorrectAnswer;


          if (isCorrect) {

            correctCount++;

          } else {

            incorrectCount++;

          }


          return {

            userId:
              response.userId,

            username:
              response.username,

            answer:
              response.answer,

            normalizedAnswer,

            timestamp:
              response.timestamp,

            correct:
              isCorrect

          };

        });



      // ========================================
      // Total Responses
      // ========================================

      const totalResponses =
        responses.length;



      // ========================================
      // Percentages
      // ========================================

      const correctPercentage =
        totalResponses > 0

          ? Number(
              (
                (correctCount /
                  totalResponses) *
                100
              ).toFixed(2)
            )

          : 0;


      const incorrectPercentage =
        totalResponses > 0

          ? Number(
              (
                (incorrectCount /
                  totalResponses) *
                100
              ).toFixed(2)
            )

          : 0;



      // ========================================
      // Option Statistics
      // ========================================

      const optionStats = {

        A: 0,

        B: 0,

        C: 0,

        D: 0

      };


      participants.forEach(
        (participant) => {

          const option =
            participant.normalizedAnswer;


          if (optionStats[option] !== undefined) {

            optionStats[option]++;

          }

        }
      );



      // ========================================
      // First Correct Participant
      // ========================================

      const correctResponses =
        participants.filter(
          (participant) =>
            participant.correct
        );


      let firstCorrectParticipant =
        null;


      if (
        correctResponses.length > 0
      ) {

        firstCorrectParticipant =
          correctResponses.reduce(
            (first, current) => {

              return new Date(
                current.timestamp
              ) < new Date(
                first.timestamp
              )

                ? current

                : first;

            }
          );

      }



      // ========================================
      // Result Data
      // ========================================

      const result = {

        pollId,

        questionNumber:
          session.questionNumber,

        optionType:
          session.optionType,

        correctAnswer,

        normalizedCorrectAnswer,

        totalResponses,

        correctCount,

        incorrectCount,

        correctPercentage,

        incorrectPercentage,

        firstCorrectParticipant,

        optionStats,

        participants

      };



      // ========================================
      // Send Result
      // ========================================

      res.json({

        success: true,

        message:
          "Poll result calculated",

        result

      });

    }


    catch (error) {

      console.error(
        "Poll Result Error:",
        error.message
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to calculate poll result"

      });

    }

  }
);



module.exports = router;