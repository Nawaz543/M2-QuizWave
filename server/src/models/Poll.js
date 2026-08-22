const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    quizSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizSession",
      required: true,
    },

    pollId: {
      type: String,
      required: true,
      unique: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    questionNumber: {
      type: Number,
      required: true,
    },

    pollTime: {
      type: Number,
      required: true,
    },

    optionType: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    correctAnswer: {
      type: String,
      default: null,
    },

    totalResponses: {
      type: Number,
      default: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
    },

    incorrectCount: {
      type: Number,
      default: 0,
    },

    firstCorrectParticipant: {
      userId: {
        type: String,
        default: null,
      },

      username: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Poll", pollSchema);