const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC USER INFORMATION
    // ========================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    // ========================================
    // OTP PASSWORD RESET
    // ========================================

    resetOtpHash: {
      type: String,
      default: null,
    },

    resetOtpExpires: {
      type: Date,
      default: null,
    },

    resetOtpAttempts: {
      type: Number,
      default: 0,
    },

    // ========================================
    // TEMPORARY PASSWORD RESET AUTHORIZATION
    // ========================================

   resetSessionTokenHash: {
  type: String,
  default: null,
},

resetSessionTokenExpires: {
  type: Date,
  default: null,
},
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);