const mongoose = require("mongoose");

const correctResponseSchema = new mongoose.Schema(
  {
    quizSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizSession",
      required: true,
    },

    pollId: {
      type: String,
      required: true,
    },

    questionNumber: {
      type: Number,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    answeredAt: {
      type: Date,
      required: true,
    },

    responseTime: {
      type: Number,
      required: true,
    },

    rank: {
      type: Number,
      default: -1,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CorrectResponse",
  correctResponseSchema
);
