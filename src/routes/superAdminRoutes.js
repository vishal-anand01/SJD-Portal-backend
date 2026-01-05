// backend/src/routes/superAdminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { uploadDMPhoto } from "../middleware/uploadMiddleware.js";
import { uploadDepartmentPhoto } from "../middleware/uploadMiddleware.js";

import {
  softDeleteUserWithBackup,
  getSystemStats,

  // DM
  listDMs,
  addDM,
  updateDM,
  changeDMRole,
  getDMById,

  // Officers
  listOfficersSA,
  addOfficer,
  updateOfficerSA,
  changeOfficerRole,

  // Departments
  listDepartmentsSA,
  addDepartmentUser,
  updateDepartmentUser,
  getDepartmentByIdSA,

  // Public
  listPublicUsers,
  addPublicUser,
  updatePublicUser,
  deletePublicUser,

  // Complaints
  getAllComplaintsSA,
  getComplaintDetailsSA,
  updateComplaintStatusSA,
  deleteComplaintSA,
} from "../controllers/superAdminController.js";

const router = express.Router();

// 🔐 Secure All Routes
router.use(protect);
router.use(requireRole("superadmin"));

/* -------------------------------------------------------------------------- */
/* 📊 User Delete Route                                                 */
/* -------------------------------------------------------------------------- */

router.delete("/users/:id/soft-delete", softDeleteUserWithBackup);

/* -------------------------------------------------------------------------- */
/* 📊 SYSTEM DASHBOARD STATS                                                  */
/* -------------------------------------------------------------------------- */
router.get("/stats", getSystemStats);

/* -------------------------------------------------------------------------- */
/* 🟦 DM MANAGEMENT                                                            */
/* -------------------------------------------------------------------------- */
router.get("/dm", listDMs);
router.post("/dm", uploadDMPhoto, addDM);
router.put("/dm/:id", uploadDMPhoto, updateDM);
router.put("/dm/:id/role", changeDMRole);
router.get("/dm/:id", getDMById);

/* -------------------------------------------------------------------------- */
/* 🟩 OFFICER MANAGEMENT                                                       */
/* -------------------------------------------------------------------------- */
router.get("/officers", listOfficersSA);
router.post("/officers", addOfficer);
router.put("/officers/:id", updateOfficerSA);
router.put("/officers/:id/role", changeOfficerRole);

/* -------------------------------------------------------------------------- */
/* 🟧 DEPARTMENT MANAGEMENT                                                    */
/* -------------------------------------------------------------------------- */
router.get("/departments/users", listDepartmentsSA);
router.post("/departments/users", uploadDepartmentPhoto, addDepartmentUser);
router.get("/departments/users/:id", getDepartmentByIdSA);
router.put(
  "/departments/users/:id",
  uploadDepartmentPhoto,
  updateDepartmentUser
);

/* -------------------------------------------------------------------------- */
/* 🟨 PUBLIC USER MANAGEMENT                                                   */
/* -------------------------------------------------------------------------- */
router.get("/public", listPublicUsers);
router.post("/public", addPublicUser);
router.put("/public/:id", updatePublicUser);
router.delete("/public/:id", deletePublicUser);

/* -------------------------------------------------------------------------- */
/* 🔴 COMPLAINT MANAGEMENT                                                     */
/* -------------------------------------------------------------------------- */
router.get("/complaints", getAllComplaintsSA);
router.get("/complaints/:id", getComplaintDetailsSA);
router.put("/complaints/:id", updateComplaintStatusSA);
router.delete("/complaints/:id", deleteComplaintSA);

/* -------------------------------------------------------------------------- */
export default router;
