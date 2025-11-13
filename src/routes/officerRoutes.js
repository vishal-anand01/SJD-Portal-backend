import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  uploadOfficerPhoto,
  uploadComplaintAttachment,
} from "../middleware/uploadMiddleware.js";

import {
  getOfficerComplaints,
  updateComplaintStatus,
  forwardComplaint,
  getOfficerProfile,
  updateOfficerProfile,
  getOfficerVisits,
  addVisitComplaint,
  getMyAssignments,
} from "../controllers/officerController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 All routes below require authentication                                 */
/* -------------------------------------------------------------------------- */
router.use(protect);

/* -------------------------------------------------------------------------- */
/* 📋 Officer Complaints (Dashboard List)                                     */
/* -------------------------------------------------------------------------- */
router.get(
  "/complaints",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerComplaints
);

/* -------------------------------------------------------------------------- */
/* 🔄 Update Complaint Status (with optional attachment)                      */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:complaintId",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment, // field name = "attachment"
  updateComplaintStatus
);

/* -------------------------------------------------------------------------- */
/* 🔁 Forward Complaint (optional attachment)                                 */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:complaintId/forward",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment,
  forwardComplaint
);

/* -------------------------------------------------------------------------- */
/* 🧾 Officer Visits (Fetch Assigned Visits)                                  */
/* -------------------------------------------------------------------------- */
router.get(
  "/visits",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerVisits
);

/* -------------------------------------------------------------------------- */
/* 🆕 Add Field Visit Complaint (Officer Filing for Citizen)                  */
/* -------------------------------------------------------------------------- */
// 📎 Expect file field name: "attachment" (single file upload)
router.post(
  "/visit-complaints",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment,
  addVisitComplaint
);

/* -------------------------------------------------------------------------- */
/* 👤 Officer Profile (Get + Update + Photo Upload)                           */
/* -------------------------------------------------------------------------- */
router.get(
  "/profile",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerProfile
);

router.put(
  "/profile",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadOfficerPhoto, // field name = "photo"
  updateOfficerProfile
);

/* -------------------------------------------------------------------------- */
/* 📋 My Assignments (Assigned by DM)                                         */
/* -------------------------------------------------------------------------- */
router.get(
  "/assignments",
  authorizeRoles("officer", "admin", "superadmin"),
  getMyAssignments
);

/* -------------------------------------------------------------------------- */
/* ✅ Export Router                                                          */
/* -------------------------------------------------------------------------- */
export default router;
