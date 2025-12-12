import asyncHandler from "../middleware/asyncHandler.js";
import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import User from "../models/User.js";

/* -------------------------------------------------------------------------- */
/* 🟩 PUBLIC COMPLAINT SUBMISSION                                            */
/* -------------------------------------------------------------------------- */
export const addPublicComplaint = asyncHandler(async (req, res) => {
  const {
    citizenName,
    citizenMobile,
    citizenDob,
    title,
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

  if (!citizenName || !citizenMobile || !title || !description || !district) {
    return sendError(res, "All required fields are mandatory", 400);
  }

  const file = req.file ? req.file.filename : null;

  const officer = await User.findOne({
    role: "officer",
    district,
  }).select("_id");

  const complaintData = {
    citizenName,
    citizenMobile,
    citizenDob,
    title,
    description,
    location: location || "",
    village: village || "",
    block: block || "",
    tehsil: tehsil || "",
    district: district || "",
    state: state || "",
    pincode: pincode || "",
    landmark: landmark || "",
    attachments: file ? [file] : [],
    sourceType: "Public",
    status: "Pending",
  };

  // ⭐ FIX: PUBLIC LOGIN SHOULD ALWAYS STORE CITIZEN ID
  if (req.user && req.user._id) {
    complaintData.citizen = req.user._id;
    complaintData.sourceType = "Public"; // keep
  } else {
    complaintData.citizen = null;
  }

  if (officer) {
    complaintData.assignedTo = officer._id;
  }

  const complaint = await Complaint.create(complaintData);

  sendSuccess(res, { message: "Complaint submitted successfully", complaint });
});

/* -------------------------------------------------------------------------- */
/* 🟨 GET COMPLAINTS BY CITIZEN MOBILE (For Public Users)                     */
/* -------------------------------------------------------------------------- */
export const getPublicComplaints = asyncHandler(async (req, res) => {
  let { mobile } = req.params;

  mobile = (mobile || "").trim(); // ✅ yahan clean
  if (!mobile) return sendError(res, "Mobile number is required", 400);

  const complaints = await Complaint.find({
    citizenMobile: mobile,
  }).sort({ createdAt: -1 });

  sendSuccess(res, { complaints });
});

/* -------------------------------------------------------------------------- */
/* 🟦 TRACK COMPLAINT BY TRACKING ID                                         */
/* -------------------------------------------------------------------------- */
export const trackComplaint = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;

  const complaint = await Complaint.findOne({ trackingId })
    .populate("filedBy", "firstName lastName email role")
    .populate("managedBy", "firstName lastName email role")
    .populate("officerUpdates.updatedBy", "firstName lastName email role");

  if (!complaint) return sendError(res, "Complaint not found", 404);

  sendSuccess(res, { complaint });
});

/* -------------------------------------------------------------------------- */
/* 🟨 NOTICES / FEEDBACK / HEALTH                                            */
/* -------------------------------------------------------------------------- */
export const getNotices = asyncHandler(async (_, res) => {
  const notices = await Notification.find({ type: "public" })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title message createdAt");
  sendSuccess(res, { notices });
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return sendError(res, "All fields required", 400);
  sendSuccess(res, { message: "Thank you for your feedback!" });
});

export const publicHealth = asyncHandler(async (_, res) => {
  sendSuccess(res, {
    message: "SJD-Portal Public API Active",
    timestamp: new Date().toISOString(),
  });
});
