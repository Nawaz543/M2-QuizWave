const mongoose = require("mongoose");

const quizSessionSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
    },

    pollTime: {
      type: Number,
      default: null,
    },

    optionType: {
      type: String,
      default: null,
    },

    forAllQuestions: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    videoTitle: {
  type: String,
  default: null
},

totalQuestions: {
  type: Number,
  default: 0
},

totalResponses: {
  type: Number,
  default: 0
},

totalCorrect: {
  type: Number,
  default: 0
},

totalIncorrect: {
  type: Number,
  default: 0
},

overallAccuracy: {
  type: Number,
  default: 0
},

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "QuizSession",
  quizSessionSchema
);