const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ========================================
// PROTECT ROUTE
// ========================================

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    // User doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // User disabled
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // Attach user to request
    req.user = user;

    // Update last seen
    user.lastSeen = new Date();
    user.isOnline = true;

    await user.save();

    next();

  } catch (error) {

    // JWT expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
      });
    }

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};


// ========================================
// ADMIN ONLY
// ========================================

const adminOnly = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};


module.exports = {
  protect,
  adminOnly,
};