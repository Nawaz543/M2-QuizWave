const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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

module.exports = router;