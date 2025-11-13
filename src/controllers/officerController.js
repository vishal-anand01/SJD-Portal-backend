// backend/src/controllers/officerController.js

import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import auditService from "../services/auditService.js";
import logger from "../utils/logger.js";
import Assignment from "../models/Assignment.js"; // ✅ missing import added
import fs from "fs";
import path from "path";

/* -------------------------------------------------------------------------- */
/* 🟢 GET ALL COMPLAINTS (Officer Dashboard)                                   */
/* -------------------------------------------------------------------------- */
/**
 * Route: GET /api/officer/complaints
 * Access: Private (Officer)
 */
export const getOfficerComplaints = asyncHandler(async (req, res) => {
  try {
    // 🧠 Fetch all complaints (Public + Officer)
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "citizen",
        model: "User",
        select:
          "firstName lastName email phone dob gender address city state country pincode role",
      })
      .populate("filedBy", "firstName lastName email role") // ✅ Added (important)
      .populate("managedBy", "firstName lastName email role")
      .populate("officerUpdates.updatedBy", "firstName lastName role email");

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("❌ Error fetching officer complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🟠 UPDATE COMPLAINT STATUS (Append Attachments, Keep Timeline)             */
/* -------------------------------------------------------------------------- */
/**
 * Route: PUT /api/officer/complaints/:complaintId
 * Access: Private (Officer)
 */
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const { complaintId } = req.params;
  const officer = req.user;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // 🧩 Handle optional new attachment (for this update only)
  let newAttachment = req.file ? req.file.filename : null;

  // 📝 Update complaint core fields
  if (status) complaint.status = status;
  if (remarks) complaint.remarks = remarks;
  complaint.managedBy = officer._id;

  // 🕒 Maintain officer timeline (each update stored separately)
  if (!Array.isArray(complaint.officerUpdates)) complaint.officerUpdates = [];

  complaint.officerUpdates.push({
    updatedBy: officer._id,
    role: officer.role,
    status: complaint.status,
    remarks: remarks || "",
    attachment: newAttachment,
    date: new Date(),
  });

  await complaint.save({ validateBeforeSave: false });

  // 🧾 Audit Log
  if (auditService?.log) {
    await auditService.log({
      actor: { id: officer._id, email: officer.email, role: officer.role },
      action: "COMPLAINT_STATUS_UPDATED",
      resourceType: "Complaint",
      resourceId: complaint._id.toString(),
      details: { status, remarks, attachment: newAttachment },
      req,
    });
  }

  // 🔔 Emit real-time update
  const io = req.app.get("io");
  io?.emit("complaint:refresh", {
    id: complaint._id,
    status: complaint.status,
  });

  logger.info(
    `✅ Complaint ${complaint.trackingId} updated by ${officer.email} (${officer.role})`
  );

  res.status(200).json({
    success: true,
    message: newAttachment
      ? "Complaint updated with attachment (saved to timeline)."
      : "Complaint status updated successfully.",
    complaint,
  });
});

/* -------------------------------------------------------------------------- */
/* 🟣 FORWARD COMPLAINT                                                       */
/* -------------------------------------------------------------------------- */
/**
 * Route: PUT /api/officer/complaints/:complaintId/forward
 * Access: Private (Officer)
 */
export const forwardComplaint = asyncHandler(async (req, res) => {
  const { forwardTo, remarks } = req.body;
  const { complaintId } = req.params;
  const officer = req.user;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // 📎 Handle attachment
  if (req.file) complaint.attachments = req.file.filename;

  complaint.status = "Forwarded";
  complaint.assignedTo = forwardTo || null;
  complaint.remarks = remarks || "";
  complaint.managedBy = officer._id;

  // ⏳ Update timeline
  complaint.officerUpdates.push({
    updatedBy: officer._id,
    role: officer.role,
    status: "Forwarded",
    remarks: remarks || "",
    attachment: req.file ? req.file.filename : "",
    date: new Date(),
  });

  await complaint.save();

  // 🧾 Log forwarding
  await auditService.log({
    actor: { id: officer._id, email: officer.email, role: officer.role },
    action: "COMPLAINT_FORWARDED",
    resourceType: "Complaint",
    resourceId: complaint._id.toString(),
    details: { forwardTo, remarks },
    req,
  });

  // 🔔 Socket event
  const io = req.app.get("io");
  io?.emit("complaint:refresh", {
    id: complaint._id,
    status: "Forwarded",
  });

  logger.info(
    `Complaint ${complaint.trackingId} forwarded by ${officer.email} to ${forwardTo}`
  );

  res.status(200).json({
    success: true,
    message: "Complaint forwarded successfully",
    complaint,
  });
});

/* -------------------------------------------------------------------------- */
/* 🟡 GET OFFICER VISITS (Assigned by DM)                                     */
/* -------------------------------------------------------------------------- */
/**
 * Route: GET /api/officer/visits
 * Access: Private (Officer)
 */
export const getOfficerVisits = asyncHandler(async (req, res) => {
  // Placeholder — integrate with DM visit assignment system
  res.status(200).json({
    success: true,
    message: "Officer visits fetched successfully",
    visits: [],
  });
});

/* -------------------------------------------------------------------------- */
/* 🟩 ADD VISIT COMPLAINT                                                     */
/* -------------------------------------------------------------------------- */
/**
 * Route: POST /api/officer/visit-complaints
 * Access: Private (Officer)
 */
export const addVisitComplaint = asyncHandler(async (req, res) => {
  try {
    const {
      citizenName,
      citizenMobile,
      citizenDob,
      title,
      category,
      description,
      location,
      village,
      block,
      tehsil,
      district,
      state,
      pincode,
      landmark,
    } = req.body;

    const officer = req.user;

    // 🧩 Validate required fields
    if (!title || !category || !description || !location) {
      res.status(400);
      throw new Error(
        "All mandatory fields are required: title, category, description, location"
      );
    }

    // 📎 Handle file upload
    const attachment = req.file ? req.file.filename : null;

    // 🧾 Create new complaint (Officer on behalf of citizen)
    const newComplaint = await Complaint.create({
      sourceType: "Officer", // ✅ complaint origin
      filedBy: officer._id, // ✅ who filed it (officer)
      citizenName: citizenName?.trim() || "Unknown Citizen",
      citizenMobile: citizenMobile?.trim() || "",
      citizenDob: citizenDob || null,

      title: title?.trim(),
      category: category?.trim(),
      description: description?.trim(),
      location: location?.trim(),

      village: village?.trim() || "",
      block: block?.trim() || "",
      tehsil: tehsil?.trim() || "",
      district: district?.trim() || "",
      state: state?.trim() || "",
      pincode: pincode?.trim() || "",
      landmark: landmark?.trim() || "",

      attachments: attachment,
      status: "Pending",
      managedBy: officer._id,
      remarks: "",
    });

    // 🧾 Audit Log (Action Tracking)
    if (auditService?.log) {
      await auditService.log({
        actor: { id: officer._id, email: officer.email, role: officer.role },
        action: "OFFICER_VISIT_COMPLAINT_ADDED",
        resourceType: "Complaint",
        resourceId: newComplaint._id.toString(),
        details: {
          title,
          category,
          citizenName,
          citizenMobile,
          location,
          district,
          state,
        },
        req,
      });
    }

    // 🔔 Real-time socket event (Live Dashboard Update)
    const io = req.app.get("io");
    io?.emit("complaint:new", {
      id: newComplaint._id,
      trackingId: newComplaint.trackingId,
      title: newComplaint.title,
      filedBy: officer.email,
      sourceType: "Officer",
    });

    // 🧠 Logging in backend console
    logger.info(
      `🟢 Officer ${officer.email} filed complaint on behalf of ${
        citizenName || "Unknown"
      } (${newComplaint.trackingId})`
    );

    // ✅ Send Response
    res.status(201).json({
      success: true,
      message: "Citizen complaint filed successfully by officer",
      complaint: newComplaint,
    });
  } catch (error) {
    logger.error("❌ Error creating field complaint:", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Failed to file citizen complaint",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧾 GET OFFICER PROFILE                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Route: GET /api/officer/profile
 * Access: Private (Officer)
 */
export const getOfficerProfile = asyncHandler(async (req, res) => {
  const officer = await User.findById(req.user._id).select("-password");
  if (!officer) {
    return res
      .status(404)
      .json({ success: false, message: "Officer not found" });
  }

  res.status(200).json({ success: true, officer });
});

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE OFFICER PROFILE                                                 */
/* -------------------------------------------------------------------------- */
/**
 * Route: PUT /api/officer/profile
 * Access: Private (Officer)
 */
/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE OFFICER PROFILE (with image/pdf upload)                         */
/* -------------------------------------------------------------------------- */
// ------------------ UPDATE Officer Profile (with photo/pdf) ------------------
export const updateOfficerProfile = asyncHandler(async (req, res) => {
  const officerId = req.user._id;
  const updates = req.body;
  const file = req.file || null;

  const officer = await User.findById(officerId);
  if (!officer) {
    return res
      .status(404)
      .json({ success: false, message: "Officer not found" });
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "gender",
    "dob",
    "address",
    "city",
    "state",
    "country",
    "pincode",
  ];

  let emailChanged = false;

  allowedFields.forEach((key) => {
    if (updates[key] !== undefined && updates[key] !== officer[key]) {
      if (key === "email" && updates[key] !== officer.email)
        emailChanged = true;
      officer[key] = updates[key];
    }
  });

  // 🖼️ New file (image/pdf)
  if (file) {
    if (officer.photo) {
      const oldPath = path.join("uploads", officer.photo);
      if (fs.existsSync(oldPath)) {
        fs.unlink(
          oldPath,
          (err) =>
            err &&
            console.warn("⚠️ Failed deleting old officer photo:", err.message)
        );
      }
    }
    officer.photo = file.filename;
    console.log(`📸 Officer new profile file: ${file.filename}`);
  }

  officer.updatedBy = officerId;
  officer.updatedAt = new Date();
  await officer.save();

  const updated = await User.findById(officerId).select("-password -__v");

  res.status(200).json({
    success: true,
    message: emailChanged
      ? "📧 Email updated successfully. Please login again."
      : file
      ? "🖼️ Profile photo updated successfully."
      : "✅ Profile updated successfully.",
    emailChanged,
    officer: updated,
  });
});
/* -------------------------------------------------------------------------- */
/* 📋 GET /api/officer/assignments – Officer's Assigned Visits               */
/* -------------------------------------------------------------------------- */
export const getMyAssignments = asyncHandler(async (req, res) => {
  try {
    const officerId = req.user._id;

    const assignments = await Assignment.find({ officer: officerId })
      .sort({ createdAt: -1 })
      .populate("dm", "firstName lastName email role")
      .populate("officer", "-password")
      .populate("complaints", "title status location");

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    logger.error("❌ Error fetching officer assignments:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch officer assignments",
      error: error.message,
    });
  }
});
