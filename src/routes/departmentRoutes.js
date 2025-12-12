import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

import {
  uploadComplaintAttachment,
  uploadOfficerPhoto,
} from "../middleware/uploadMiddleware.js";

import {
  getAssignedComplaints,
  updateComplaintStatus,
  forwardComplaint,
  getDepartmentDashboardStats,
  getDepartmentReports,
  getDepartmentProfile,
  updateDepartmentProfile,
} from "../controllers/departmentController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 All Department routes require authentication                            */
/* -------------------------------------------------------------------------- */
router.use(protect);

/* -------------------------------------------------------------------------- */
/* 📋 1. Assigned Complaints (Department Inbox)                               */
/* -------------------------------------------------------------------------- */
router.get(
  "/assigned",
  authorizeRoles("department", "admin", "superadmin"),
  getAssignedComplaints
);

/* -------------------------------------------------------------------------- */
/* ✏️ 2. Update Complaint Status (remarks + attachment)                       */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:id",
  authorizeRoles("department", "admin", "superadmin"),
  uploadComplaintAttachment, // field name: attachment
  updateComplaintStatus
);

/* -------------------------------------------------------------------------- */
/* 🔁 3. Forward Complaint (Officer / DM / Another Dept)                      */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:id/forward",
  authorizeRoles("department", "admin", "superadmin"),
  uploadComplaintAttachment, // field name: attachment
  forwardComplaint
);

/* -------------------------------------------------------------------------- */
/* 📊 4. Dashboard Stats (Summary for Department)                             */
/* -------------------------------------------------------------------------- */
router.get(
  "/dashboard/stats",
  authorizeRoles("department", "admin", "superadmin"),
  getDepartmentDashboardStats
);

/* -------------------------------------------------------------------------- */
/* 🧾 5. Reports (Filters: date/status/category)                              */
/* -------------------------------------------------------------------------- */
router.get(
  "/reports",
  authorizeRoles("department", "admin", "superadmin"),
  getDepartmentReports
);

/* -------------------------------------------------------------------------- */
/* 👤 6. Department Profile (GET + UPDATE)                                    */
/* -------------------------------------------------------------------------- */
router.get(
  "/profile",
  authorizeRoles("department", "admin", "superadmin"),
  getDepartmentProfile
);

router.put(
  "/profile",
  authorizeRoles("department", "admin", "superadmin"),
  uploadOfficerPhoto,      // ⭐ CORRECT for photo/pdf
  updateDepartmentProfile  // ⭐ Controller
);

/* -------------------------------------------------------------------------- */
/* 🎯 EXPORT ROUTER                                                          */
/* -------------------------------------------------------------------------- */
export default router;
