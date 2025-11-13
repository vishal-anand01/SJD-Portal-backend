// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";

/**
 * ✅ Protect Middleware
 * - Token read from Cookies OR Authorization Header
 * - Verifies token
 * - Attaches user object to req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;

    // ✅ Update last active timestamp (non-blocking)
    user.lastActiveAt = new Date();
    user.save().catch(() => {});

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }
});

/**
 * ✅ Role Authorization Middleware
 * - Allows only specified roles to access route
 * Example: authorizeRoles("dm", "admin")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("User authentication required");
    }

    if (!req.user.role) {
      res.status(403);
      throw new Error("User role missing — Access denied");
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied for role: ${req.user.role}`);
    }

    next();
  };
};
