import asyncHandler from "../middleware/asyncHandler.js";
import Assignment from "../models/Assignment.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { sendAssignmentEmail } from "../services/emailService.js";
import pushService from "../services/pushNotificationService.js";
import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";

/* -------------------------------------------------------------------------- */
/* ⚙️ SOCKET HELPER (Optional Safe Load)                                      */
/* -------------------------------------------------------------------------- */
let socketEmitter = null;
try {
  socketEmitter = require("../socketServer");
} catch {
  logger.warn("⚠️ Socket server not loaded in DM Controller context");
}

const emitToUser = async (userId, event, payload) => {
  try {
    socketEmitter?.emit?.(event, { userId, payload });
  } catch (e) {
    logger.error("Socket emit error:", e.message);
  }
};

export const getDMProfile = asyncHandler(async (req, res) => {
  const dm = await User.findById(req.user._id).select("-password");
  if (!dm) {
    return res
      .status(404)
      .json({ success: false, message: "DM profile not found" });
  }

  res.status(200).json({
    success: true,
    dm,
  });
});

/* -------------------------------------------------------------------------- */
/* 🏠 GET /api/dm/dashboard-stats                                             */
/* -------------------------------------------------------------------------- */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [complaints, assignments] = await Promise.all([
      Complaint.countDocuments(),
      Assignment.countDocuments(),
    ]);

    const resolved = await Complaint.countDocuments({ status: "Resolved" });
    const pending = await Complaint.countDocuments({ status: "Pending" });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: complaints,
        totalAssignments: assignments,
        resolved,
        pending,
      },
    });
  } catch (err) {
    logger.error("❌ DM dashboard stats error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard stats" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧑‍✈️ POST /api/dm/assign                                                  */
/* -------------------------------------------------------------------------- */
export const assignOfficer = asyncHandler(async (req, res) => {
  try {
    const {
      officerId,
      visitDate,
      location,
      priority,
      notes,
      complaints = [],
    } = req.body;
    const dm = req.user;

    const officer = await User.findById(officerId);
    if (!officer)
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });

    const assignment = await Assignment.create({
      dm: dm._id,
      officer: officer._id,
      location,
      visitDate,
      priority,
      notes,
      complaints,
      status: "Assigned",
      history: [
        {
          actionBy: dm._id,
          action: "Assigned",
          meta: { officer: officer._id },
        },
      ],
    });

    // 📨 Email Notification
    try {
      await sendAssignmentEmail({
        to: officer.email,
        subject: "📅 New Field Visit Assigned",
        template: "assignment",
        context: {
          officerName: officer.firstName,
          dmName: dm.firstName,
          visitDate,
          location,
          priority,
          notes,
        },
      });
      logger.info(`📧 Assignment email sent to ${officer.email}`);
    } catch (err) {
      logger.warn(`⚠️ Email failed for ${officer.email}: ${err.message}`);
    }

    // 🔔 Push Notification
    try {
      await pushService.sendToUser(officerId, "📋 New Visit Assigned", {
        visitDate,
        priority,
        location,
      });
      logger.info(`📲 Push sent to officer ${officer.email}`);
    } catch (err) {
      logger.warn(`⚠️ Push failed: ${err.message}`);
    }

    // 🧩 Socket Event
    emitToUser(officerId, "new_assignment", assignment);

    res.status(201).json({
      success: true,
      message: "Officer assigned successfully",
      assignment,
    });
  } catch (err) {
    logger.error("❌ DM assignment error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign officer" });
  }
});

/* -------------------------------------------------------------------------- */
/* 📋 GET /api/dm/assignments                                                 */
/* -------------------------------------------------------------------------- */
export const listAssignments = asyncHandler(async (req, res) => {
  try {
    // ✅ Only DM’s own assignments (if DM logged in)
    const filter = req.user.role === "dm" ? { dm: req.user._id } : {};

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .populate("officer", "-password") // ✅ Full officer data (without password)
      .populate("dm", "firstName lastName email role")
      .populate("complaints", "title status");

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (err) {
    logger.error("❌ Error fetching assignments:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ PUT /api/dm/assignments/:id/status                                      */
/* -------------------------------------------------------------------------- */
export const updateAssignmentStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    assignment.status = status;
    assignment.updatedAt = new Date();
    assignment.history.push({
      actionBy: req.user._id,
      action: `Status changed to ${status}`,
    });

    await assignment.save();

    emitToUser(assignment.officer, "assignment_updated", {
      id: assignment._id,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Assignment status updated successfully",
      assignment,
    });
  } catch (err) {
    logger.error("❌ DM status update error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment status",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 👥 GET /api/dm/officers                                                    */
/* -------------------------------------------------------------------------- */
export const listOfficers = asyncHandler(async (req, res) => {
  try {
    const dmDistrict = req.user.district;
    const officers = await User.find({ role: "officer", district: dmDistrict })
      .select(
        "firstName lastName email phone role createdAt gender dob address city district state country pincode isVerified lastActiveAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: officers.length,
      officers,
    });
  } catch (err) {
    logger.error("❌ Error fetching officers:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch officers list",
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 📋 GET /api/dm/complaints – All Complaints (for DM View)                   */
/* -------------------------------------------------------------------------- */
export const listAllComplaints = asyncHandler(async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate("citizen", "-password")
      .populate("filedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    logger.error("❌ Error fetching DM complaints:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch complaints" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE DM PROFILE (with image/pdf upload)                               */
/* -------------------------------------------------------------------------- */
/**
 * Route: PUT /api/dm/profile
 * Access: Private (DM/Admin/SuperAdmin)
 */
export const updateDMProfile = asyncHandler(async (req, res) => {
  const dmId = req.user._id;
  const updates = req.body;
  const file = req.file || null;

  try {
    const dm = await User.findById(dmId);
    if (!dm) {
      return res
        .status(404)
        .json({ success: false, message: "DM profile not found" });
    }

    // ✅ Allowed editable fields
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

    // 🧠 Apply updates safely
    allowedFields.forEach((key) => {
      if (updates[key] !== undefined && updates[key] !== dm[key]) {
        if (key === "email" && updates[key] !== dm.email) {
          emailChanged = true;
        }
        dm[key] = updates[key];
      }
    });

    // 🖼️ Handle new image/pdf upload
    if (file) {
      // delete old photo if exists
      if (dm.photo) {
        const oldPath = path.join("uploads", dm.photo);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err)
              console.warn("⚠️ Failed to delete old DM photo:", err.message);
          });
        }
      }

      dm.photo = file.filename; // ✅ save new image/pdf filename
      console.log(`📸 DM uploaded new file: ${file.filename}`);
    }

    dm.updatedBy = dmId;
    dm.updatedAt = new Date();

    await dm.save();

    // ✅ Fetch fresh updated DM profile
    const updatedDM = await User.findById(dmId).select("-password -__v");

    return res.status(200).json({
      success: true,
      message: emailChanged
        ? "📧 Email updated successfully. Please login again."
        : file
        ? "🖼️ Profile file uploaded successfully."
        : "✅ Profile updated successfully.",
      emailChanged,
      dm: updatedDM,
    });
  } catch (err) {
    console.error("❌ DM profile update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update DM profile",
      error: err.message,
    });
  }
});
