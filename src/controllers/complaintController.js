import Complaint from "../models/Complaint.js";
import logger from "../utils/logger.js";
import asyncHandler from "express-async-handler";

/* -------------------------------------------------------------------------- */
/* 🟩 Create New Complaint (Public)                                           */
/* -------------------------------------------------------------------------- */
// POST /api/complaints
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, location } = req.body;
  const attachments = req.file ? req.file.filename : null;

  const complaint = await Complaint.create({
    citizen: req.user._id,
    title,
    description,
    category,
    location,
    attachments,
    status: "Pending",
  });

  logger.info("📩 Complaint created", { trackingId: complaint.trackingId });

  res.status(201).json({
    success: true,
    message: "Complaint submitted successfully",
    complaint,
  });
});

/* -------------------------------------------------------------------------- */
/* 🟦 Get Complaints of Logged-in Public User                                 */
/* -------------------------------------------------------------------------- */
// GET /api/complaints
export const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ citizen: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "citizen",
      model: "User",
      select:
        "firstName lastName email phone dob gender address city state country pincode role",
    });

  res.status(200).json({
    success: true,
    complaints,
  });
});

/* -------------------------------------------------------------------------- */
/* 🟨 Track Complaint by Tracking ID                                          */
/* -------------------------------------------------------------------------- */
// GET /api/complaints/track/:trackingId
export const trackComplaint = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;

  const complaint = await Complaint.findOne({ trackingId })
    .populate({
      path: "citizen",
      model: "User",
      select:
        "firstName lastName email phone dob gender address city state country pincode role",
    })
    .populate("managedBy", "firstName lastName email role")
    .populate("filedBy", "firstName lastName email role")
    .populate("officerUpdates.updatedBy", "firstName lastName role email");

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  res.status(200).json({
    success: true,
    complaint,
  });
});

/* -------------------------------------------------------------------------- */
/* 🧾 Get Recent Complaints (For DM Dashboard - Read Only)                    */
/* -------------------------------------------------------------------------- */
// GET /api/dm/complaints
export const getRecentComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({})
    .populate("citizen filedBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    complaints,
  });
});
