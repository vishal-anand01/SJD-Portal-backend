import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { uploadOfficerPhoto } from "../middleware/uploadMiddleware.js";
import path from "path";

// =============================
// 1️⃣ Get Assigned Complaints
// =============================
export const getAssignedComplaints = asyncHandler(async (req, res) => {
  const departmentId = req.user._id;

  const complaints = await Complaint.find({
    forwardedToDepartment: departmentId,
  })
    .populate("citizen", "firstName lastName email phone")
    .populate("filedBy", "firstName lastName email phone role")

    // ⭐ FIX 1: populate last forwardedBy
    .populate("forwards.forwardedBy", "firstName lastName email phone role")

    // ⭐ FIX 2: populate forward TO user (officer / dept / dm)
    .populate("forwards.to", "firstName lastName departmentName role email")

    .sort({ createdAt: -1 });

  res.json({ complaints });
});

// =============================
// 2️⃣ Update Complaint Status
// =============================
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint)
    return res.status(404).json({ message: "Complaint not found" });

  // file upload
  const attachment = req.file ? req.file.filename : null;

  // Add update record
  const updateEntry = {
    status: req.body.status,
    remarks: req.body.remarks,
    updatedBy: req.user._id,
    attachment,
    updateType: "Department",
    date: new Date(),
  };

  complaint.departmentUpdates.push(updateEntry);
  complaint.status = req.body.status;

  await complaint.save();

  res.json({ message: "Complaint updated successfully" });
});

// =============================
// 3️⃣ Forward Complaint
// =============================
export const forwardComplaint = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;
  const { forwardTo, remarks } = req.body;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint)
    return res.status(404).json({ message: "Complaint not found" });

  const attachment = req.file ? req.file.filename : null;

  // forwardTo format: "officer:userId" / "department:deptId" / "dm:dmId"
  const [type, id] = forwardTo.split(":");

  if (type === "officer") {
    complaint.forwardedToOfficer = id;
  }
  if (type === "department") {
    complaint.forwardedToDepartment = id;
  }
  if (type === "dm") {
    complaint.forwardedToDM = id;
  }

  complaint.status = "Forwarded";

  complaint.forwards.push({
    type,
    to: id,
    remarks,
    attachment,
    forwardedBy: req.user._id,
    date: new Date(),
  });

  await complaint.save();

  res.json({ message: "Complaint forwarded successfully" });
});

// =============================
// 4️⃣ Department Dashboard Stats
// =============================
export const getDepartmentDashboardStats = asyncHandler(async (req, res) => {
  const dept = req.user._id;

  const all = await Complaint.countDocuments({ forwardedToDepartment: dept });
  const pending = await Complaint.countDocuments({
    forwardedToDepartment: dept,
    status: "Pending",
  });
  const progress = await Complaint.countDocuments({
    forwardedToDepartment: dept,
    status: "In Progress",
  });
  const resolved = await Complaint.countDocuments({
    forwardedToDepartment: dept,
    status: "Resolved",
  });
  const rejected = await Complaint.countDocuments({
    forwardedToDepartment: dept,
    status: "Rejected",
  });

  res.json({
    total: all,
    pending,
    inProgress: progress,
    resolved,
    rejected,
  });
});

// =============================
// 5️⃣ Reports
// =============================
export const getDepartmentReports = asyncHandler(async (req, res) => {
  const dept = req.user._id;

  const { fromDate, toDate, status } = req.query;

  let query = { forwardedToDepartment: dept };

  if (status) query.status = status;
  if (fromDate && toDate) {
    query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }

  const complaints = await Complaint.find(query).sort({ createdAt: -1 });

  res.json({ complaints });
});

// =============================
// 6️⃣ Get Department Profile
// =============================
export const getDepartmentProfile = asyncHandler(async (req, res) => {
  const department = await User.findById(req.user._id).select("-password");

  if (!department) {
    return res.status(404).json({ message: "Department not found" });
  }

  res.json({ department });
});

// =============================
// 7️⃣ Update Department Profile
// =============================
// =============================
// 7️⃣ Update Department Profile (FINAL WORKING)
// =============================
// =============================
// 7️⃣ Update Department Profile (FINAL WORKING VERSION)
// =============================

export const updateDepartmentProfile = asyncHandler(async (req, res) => {
  const departmentId = req.user._id;
  const updates = req.body;
  const file = req.file || null;

  try {
    const department = await User.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // ⭐ Allowed fields
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "gender",
      "dob",
      "address",
      "city",
      "district",
      "state",
      "country",
      "pincode",
      "designation",
      "departmentName",
    ];

    let emailChanged = false;

    allowedFields.forEach((key) => {
      if (updates[key] !== undefined) {
        if (key === "email" && updates[key] !== department.email) {
          emailChanged = true;
        }
        department[key] = updates[key];
      }
    });

    // ⭐ PHOTO / PDF upload
    if (file) {
      // delete old file
      if (department.photo) {
        const oldPath = path.join("uploads", department.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      department.photo = file.filename; // save new
      console.log("📸 Department uploaded:", file.filename);
    }

    department.updatedBy = departmentId;
    department.updatedAt = new Date();

    await department.save();

    const updatedDept = await User.findById(departmentId).select(
      "-password -__v"
    );

    res.status(200).json({
      success: true,
      message: emailChanged
        ? "📧 Email updated successfully. Please login again."
        : file
        ? "🖼️ Profile photo updated successfully."
        : "✅ Profile updated successfully.",
      emailChanged,
      department: updatedDept,
    });
  } catch (error) {
    console.error("❌ Department profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update department profile",
      error: error.message,
    });
  }
});
