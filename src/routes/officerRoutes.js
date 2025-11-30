import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  uploadOfficerPhoto,
  uploadComplaintAttachment,
  uploadAssignmentProof, // ⭐ NEW (Visit Report Proof)
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
  updateAssignmentVisit, // ⭐ NEW Visit Report Controller
  getVisitComplaintsByDate,
} from "../controllers/officerController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 All officer routes require authentication                               */
/* -------------------------------------------------------------------------- */
router.use(protect);

/* -------------------------------------------------------------------------- */
/* 📋 1. Officer Complaints (Dashboard)                                       */
/* -------------------------------------------------------------------------- */
router.get(
  "/complaints",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerComplaints
);

/* -------------------------------------------------------------------------- */
/* 🔄 2. Update Complaint Status                                              */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:complaintId",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment, // field = attachment
  updateComplaintStatus
);

/* -------------------------------------------------------------------------- */
/* 🔁 3. Forward Complaint                                                    */
/* -------------------------------------------------------------------------- */
router.put(
  "/complaints/:complaintId/forward",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment, // field = attachment
  forwardComplaint
);

/* -------------------------------------------------------------------------- */
/* 🧾 4. Officer Visits Assigned by DM                                       */
/* -------------------------------------------------------------------------- */
router.get(
  "/visits",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerVisits
);

/* -------------------------------------------------------------------------- */
/* 🆕 5. File On-Spot Visit Complaint (Officer → Citizen)                     */
/* -------------------------------------------------------------------------- */
router.post(
  "/visit-complaints",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadComplaintAttachment, // field = attachment
  addVisitComplaint
);

/* -------------------------------------------------------------------------- */
/* 👤 6. Officer Profile (Get + Update)                                       */
/* -------------------------------------------------------------------------- */
// 👉 Get profile
router.get(
  "/profile",
  authorizeRoles("officer", "admin", "superadmin"),
  getOfficerProfile
);

// 👉 Update profile + photo/pdf
router.put(
  "/profile",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadOfficerPhoto, // field = photo
  updateOfficerProfile
);

/* -------------------------------------------------------------------------- */
/* 📋 7. Officer's Assigned Visits (DM Assigned)                              */
/* -------------------------------------------------------------------------- */
router.get(
  "/assignments",
  authorizeRoles("officer", "admin", "superadmin"),
  getMyAssignments
);

/* -------------------------------------------------------------------------- */
/* ✏️ 8. UPDATE VISIT REPORT (Main Update by Officer)                         */
/* -------------------------------------------------------------------------- */
// field = proofFile (PDF/Images allowed)
router.put(
  "/assignments/:id/update",
  authorizeRoles("officer", "admin", "superadmin"),
  uploadAssignmentProof, // ⭐ NEW upload for visit proof
  updateAssignmentVisit
);

router.get(
  "/visit-complaints/by-date",
  authorizeRoles("officer", "admin", "superadmin", "dm"),
  getVisitComplaintsByDate
);

/* -------------------------------------------------------------------------- */
/* 🎯 EXPORT ROUTER                                                          */
/* -------------------------------------------------------------------------- */
export default router;
