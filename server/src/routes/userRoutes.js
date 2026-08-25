const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// GET ALL USERS
// ========================================

router.get(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        users,
      });

    } catch (error) {

      console.error("Get users error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch users",
      });
    }
  }
);


// ========================================
// ADD NEW USER
// ========================================

router.post(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const { email, password } = req.body;


      // Check input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }


      const normalizedEmail = email
        .toLowerCase()
        .trim();


      // Check existing user
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });


      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }


      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );


      // Create user
      const user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        isActive: true,
        isOnline: false,
      });


      return res.status(201).json({
        success: true,
        message: "User created successfully",

        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isOnline: user.isOnline,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      });

    } catch (error) {

      console.error("Create user error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create user",
      });
    }
  }
);


// ========================================
// DISABLE USER
// ========================================

router.patch(
  "/:id/disable",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const user = await User.findById(
        req.params.id
      );


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      // Don't allow admin to disable itself
      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Admin cannot disable itself",
        });
      }


      user.isActive = false;
      user.isOnline = false;

      await user.save();


      return res.status(200).json({
        success: true,
        message: "User disabled successfully",
      });

    } catch (error) {

      console.error("Disable user error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to disable user",
      });
    }
  }
);


// ========================================
// ENABLE USER
// ========================================

router.patch(
  "/:id/enable",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const user = await User.findById(
        req.params.id
      );


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      user.isActive = true;

      await user.save();


      return res.status(200).json({
        success: true,
        message: "User enabled successfully",
      });

    } catch (error) {

      console.error("Enable user error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to enable user",
      });
    }
  }
);


// ========================================
// CHANGE USER PASSWORD
// ========================================

router.patch(
  "/:id/password",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const { password } = req.body;


      if (!password) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }


      const user = await User.findById(
        req.params.id
      );


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      // Hash new password
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );


      user.password = hashedPassword;

      await user.save();


      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });

    } catch (error) {

      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to change password",
      });
    }
  }
);


// ========================================
// DELETE USER
// ========================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {

      const user = await User.findById(
        req.params.id
      );


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      // Don't allow admin to delete itself
      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Admin cannot delete itself",
        });
      }


      await User.findByIdAndDelete(
        req.params.id
      );


      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });

    } catch (error) {

      console.error("Delete user error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete user",
      });
    }
  }
);


module.exports = router;