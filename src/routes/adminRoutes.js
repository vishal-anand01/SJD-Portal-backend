import express from "express";
import { getDashboardStats, manageUsers, manageDepartments } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, requireRole("admin", "superadmin"), getDashboardStats);
router.get("/users", protect, requireRole("admin", "superadmin"), manageUsers);
router.get("/departments", protect, requireRole("admin", "superadmin"), manageDepartments);

export default router;
