import express from "express";
import {
  createComplaint,
  getComplaints,
  trackComplaint,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 🟢 Public Route — Track complaint by Tracking ID
router.get("/track/:trackingId", trackComplaint);

// 🧩 Protected Routes
router.use(protect);
router.post("/", upload.single("attachments"), createComplaint);
router.get("/", getComplaints);

export default router;
