// backend/src/middleware/roleMiddleware.js
import { sendError } from "../utils/responseHelper.js";

/**
 * 🧠 Middleware to restrict routes based on user roles
 * Usage:
 *   router.get("/admin", protect, requireRole("admin", "superadmin"), handler);
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, "Unauthorized: User not logged in", 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        return sendError(res, "Access denied: Insufficient permissions", 403);
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      sendError(res, "Access validation failed", 500);
    }
  };
};
