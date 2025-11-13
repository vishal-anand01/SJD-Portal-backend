import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { uploadDMPhoto } from "../middleware/uploadMiddleware.js";

import {
  getDashboardStats,
  assignOfficer,
  listAssignments,
  updateAssignmentStatus,
  listOfficers,
  getDMProfile,
  updateDMProfile,
  listAllComplaints,
} from "../controllers/dmController.js";

const router = express.Router();

// ✅ Only DM, Admin, or SuperAdmin can access these routes
router.use(protect);
router.use(requireRole("dm", "admin", "superadmin"));

// 🧑‍💼 Profile
router.get("/profile", getDMProfile);
router.put("/profile", uploadDMPhoto, updateDMProfile);

// 📊 Dashboard & Assignments
router.get("/dashboard-stats", getDashboardStats);
router.post("/assign", assignOfficer);
router.get("/assignments", listAssignments);
router.put("/assignments/:id/status", updateAssignmentStatus);

// 👥 Officers & Complaints
router.get("/officers", listOfficers);
router.get("/complaints", listAllComplaints);

export default router;
