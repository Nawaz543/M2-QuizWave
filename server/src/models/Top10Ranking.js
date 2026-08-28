const mongoose = require("mongoose");

const top10RankingSchema = new mongoose.Schema(
  {
    quizSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizSession",
      required: true,
    },

    videoTitle: {
      type: String,
      required: true,
    },

    top10: [
      {
        rank: {
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

        totalCorrect: {
          type: Number,
          required: true,
        },

        performanceScore: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Top10Ranking",
  top10RankingSchema
);