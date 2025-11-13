import express from "express";
import {
  getNotices,
  trackComplaint,
  submitFeedback,
  publicHealth,
  addPublicComplaint,
  getPublicComplaints,
} from "../controllers/publicController.js";
import { uploadComplaintAttachment } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 🌍 Public API Routes
router.get("/notices", getNotices);
router.get("/track/:trackingId", trackComplaint);
router.get("/complaints/:mobile", getPublicComplaints); // 🔹 new route
router.post("/feedback", submitFeedback);
router.get("/health", publicHealth);
router.post("/complaints", uploadComplaintAttachment, addPublicComplaint);

export default router;
