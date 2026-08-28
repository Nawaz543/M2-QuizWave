const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update login information
    user.lastLogin = new Date();
    user.lastSeen = new Date();
    user.isOnline = true;

    await user.save();

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});


// ========================================
// LOGOUT
// ========================================

router.post("/logout", protect, async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});



// ========================================
// FORGOT PASSWORD - SEND OTP
// ========================================

router.post("/forgot-password", async (req, res) => {

  try {

    const { email } = req.body;


    // ========================================
    // VALIDATE EMAIL
    // ========================================

    if (!email || !email.trim()) {

      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
      email: normalizedEmail,
    });


    /*
      Security:
      Account exist karta hai ya nahi,
      dono cases mein same response denge.
    */

    if (!user) {

      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });

    }


    // ========================================
    // GENERATE 6 DIGIT OTP
    // ========================================

    const otp =
      crypto.randomInt(100000, 1000000).toString();


    // ========================================
    // HASH OTP
    // ========================================

    const hashedOtp =
      crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");


    // ========================================
    // OTP EXPIRES AFTER 10 MINUTES
    // ========================================

    user.resetOtpHash = hashedOtp;

    user.resetOtpExpires =
      Date.now() + 10 * 60 * 1000;


    // Reset attempts

    user.resetOtpAttempts = 0;

    // OTP verification status

    user.resetOtpVerified = false;


    await user.save();


    // ========================================
    // TEMPORARY TESTING
    // ========================================

    /*
      Abhi email service connect nahi ki hai.

      Testing ke liye OTP server console
      mein show kar rahe hain.
    */

     await sendEmail(
  normalizedEmail,
  "QuizWave – Password Reset OTP",
  `Hello,

We received a request to reset the password for your QuizWave account.

Your Password Reset OTP is:

🔐 ${otp}

This OTP is valid for 10 minutes and can be used only once.

If you did not request a password reset, please ignore this email. Your account password will remain unchanged.

For security reasons, please do not share this OTP with anyone.

Regards,
Mission 2 Team
QuizWave`
);

   

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({

      success: true,

      message:
        "If an account exists with this email, an OTP has been sent.",

    });


  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Something went wrong. Please try again.",

    });

  }

});



// ========================================
// VERIFY OTP
// ========================================

router.post("/verify-otp", async (req, res) => {

  try {

    const { email, otp } = req.body;


    // ========================================
    // VALIDATE INPUT
    // ========================================

    if (!email || !otp) {

      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });

    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    }


    // ========================================
    // CHECK OTP FORMAT
    // ========================================

    if (!/^\d{6}$/.test(otp)) {

      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });

    }


    // ========================================
    // CHECK OTP EXISTS
    // ========================================

    if (!user.resetOtpHash) {

      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });

    }


    // ========================================
    // CHECK OTP EXPIRY
    // ========================================

    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires.getTime() < Date.now()
    ) {

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });

    }


    // ========================================
    // CHECK MAX ATTEMPTS
    // ========================================

    if (user.resetOtpAttempts >= 5) {

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });

    }


    // ========================================
    // HASH RECEIVED OTP
    // ========================================

    const hashedOtp =
      crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");


    // ========================================
    // COMPARE OTP
    // ========================================

    if (hashedOtp !== user.resetOtpHash) {

      user.resetOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });

    }


 // ========================================
// OTP VERIFIED
// ========================================

user.resetOtpVerified = true;

// OTP ko dobara use hone se rokna
user.resetOtpHash = null;
user.resetOtpExpires = null;
user.resetOtpAttempts = 0;


// ========================================
// GENERATE RESET SESSION TOKEN
// ========================================

const resetSessionToken =
  crypto.randomBytes(32).toString("hex");


// ========================================
// HASH RESET SESSION TOKEN
// ========================================

const hashedResetSessionToken =
  crypto
    .createHash("sha256")
    .update(resetSessionToken)
    .digest("hex");


// ========================================
// RESET SESSION TOKEN EXPIRES
// 10 MINUTES
// ========================================

user.resetSessionTokenHash =
  hashedResetSessionToken;

user.resetSessionTokenExpires =
  Date.now() + 10 * 60 * 1000;


await user.save();


    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({

  success: true,

  message:
    "OTP verified successfully",

  resetToken: resetSessionToken,

});

  } catch (error) {

    console.error(
      "Verify OTP error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Something went wrong. Please try again.",

    });

  }

});




// ========================================
// RESET PASSWORD
// ========================================

router.post("/reset-password", async (req, res) => {

  try {

    const {
      email,
      resetToken,
      password,
      confirmPassword,
    } = req.body;


    // ========================================
    // VALIDATE INPUT
    // ========================================

    if (!email || !resetToken || !password || !confirmPassword) {

      console.log(email, resetToken, password, confirmPassword);

      return res.status(400).json({
        success: false,
        message:
          "Invalid password reset request. Please verify OTP again.",
      });

    }


    const normalizedEmail =
      email.trim().toLowerCase();

      const hashedResetToken =
  crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


    // ========================================
    // CHECK PASSWORD MATCH
    // ========================================

    if (password !== confirmPassword) {

      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });

    }


    // ========================================
    // CHECK PASSWORD LENGTH
    // ========================================

    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });

    }


    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
  email: normalizedEmail,

  resetSessionTokenHash:
    hashedResetToken,

  resetSessionTokenExpires: {
    $gt: Date.now(),
  },
});


    if (!user) {

      return res.status(400).json({
        success: false,
        message:
          "Unable to reset password",
      });

    }


   


    // ========================================
    // HASH NEW PASSWORD
    // ========================================

    const hashedPassword =
      await bcrypt.hash(password, 10);


    // ========================================
    // UPDATE PASSWORD
    // ========================================

    user.password = hashedPassword;

    // ========================================
// CLEAR RESET SESSION
// ========================================

user.resetSessionTokenHash = null;

user.resetSessionTokenExpires = null;


    // ========================================
    // CLEAR OTP DATA
    // ========================================

    user.resetOtpHash = null;

    user.resetOtpExpires = null;

    user.resetOtpAttempts = 0;

    user.resetOtpVerified = false;


    // ========================================
    // CLEAR OLD RESET TOKEN
    // ========================================

    user.resetPasswordToken = null;

    user.resetPasswordExpires = null;


    await user.save();


    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({

      success: true,

      message:
        "Password reset successful. You can now login with your new password.",

    });


  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Something went wrong. Please try again.",

    });

  }

});


module.exports = router;