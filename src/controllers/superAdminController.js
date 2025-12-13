// backend/src/controllers/superAdminController.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

// ⭐ SAME LOGIC IMPORTED FROM authController (copy here)
async function generateUniqueIdForDM() {
  const currentYear = new Date().getFullYear();

  // Find last DM with pattern: SJD/2025/xxxx
  const lastDM = await User.findOne({
    uniqueId: new RegExp(`SJD/${currentYear}/`),
  }).sort({ createdAt: -1 });

  let lastNumber = 0;

  if (lastDM && lastDM.uniqueId) {
    const parts = lastDM.uniqueId.split("/");
    // SJD / 2025 / 0045 → parts[2] = 0045
    lastNumber = parseInt(parts[2]);
  }

  const newNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `SJD/${currentYear}/${newNumber}`;
}

/* -------------------------------------------------------------------------- */
/* 📊 SYSTEM STATS                                                            */
/* -------------------------------------------------------------------------- */
export const getSystemStats = asyncHandler(async (req, res) => {
  const data = {
    totalUsers: await User.countDocuments(),
    totalDMs: await User.countDocuments({ role: "dm" }),
    totalOfficers: await User.countDocuments({ role: "officer" }),
    totalDepartments: await User.countDocuments({ role: "department" }),
    totalPublic: await User.countDocuments({ role: "public" }),
    totalComplaints: await Complaint.countDocuments(),
  };

  res.json({ success: true, data });
});

/* -------------------------------------------------------------------------- */
/* 🟦 DM MANAGEMENT                                                            */
/* -------------------------------------------------------------------------- */
export const listDMs = asyncHandler(async (_, res) => {
  const dms = await User.find({ role: "dm" }).select("-password");
  res.json({ success: true, dms });
});

export const addDM = asyncHandler(async (req, res) => {
  // ⭐ Generate SJD/Year/000X
  const uniqueId = await generateUniqueIdForDM();

  const data = {
    ...req.body,
    role: "dm",
    uniqueId, // ⭐ AUTO ID HERE
  };

  if (req.file) {
    data.photo = req.file.filename;
  }

  const dm = await User.create(data);

  res.status(201).json({ success: true, dm });
});

export const updateDM = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (req.file) {
    updates.photo = req.file.filename; // ⬅️ SAVE NEW PHOTO
  }

  const dm = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });

  res.json({ success: true, dm });
});

export const deleteDM = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "DM deleted" });
});

export const changeDMRole = asyncHandler(async (req, res) => {
  const dm = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );
  res.json({ success: true, role: dm.role });
});

export const getDMById = asyncHandler(async (req, res) => {
  const dm = await User.findById(req.params.id);

  if (!dm) {
    return res.status(404).json({ message: "DM not found" });
  }

  res.json({ dm });
});




/* -------------------------------------------------------------------------- */
/* 🟩 OFFICER MANAGEMENT                                                       */
/* -------------------------------------------------------------------------- */
export const listOfficersSA = asyncHandler(async (_, res) => {
  const officers = await User.find({ role: "officer" }).select("-password");
  res.json({ success: true, officers });
});

export const addOfficer = asyncHandler(async (req, res) => {
  const officer = await User.create({ ...req.body, role: "officer" });
  res.status(201).json({ success: true, officer });
});

export const updateOfficerSA = asyncHandler(async (req, res) => {
  const officer = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, officer });
});

export const deleteOfficerSA = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Officer deleted" });
});

export const changeOfficerRole = asyncHandler(async (req, res) => {
  const officer = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );
  res.json({ success: true, role: officer.role });
});

/* -------------------------------------------------------------------------- */
/* 🟧 DEPARTMENT MANAGEMENT                                                    */
/* -------------------------------------------------------------------------- */
export const listDepartmentsSA = asyncHandler(async (_, res) => {
  const departmentUsers = await User.find({ role: "department" }).select(
    "-password"
  );
  res.json({ success: true, departmentUsers });
});

export const addDepartmentUser = asyncHandler(async (req, res) => {
  const depUser = await User.create({ ...req.body, role: "department" });
  res.status(201).json({ success: true, depUser });
});

export const updateDepartmentUser = asyncHandler(async (req, res) => {
  const depUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, depUser });
});

export const deleteDepartmentUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Department user deleted" });
});

/* -------------------------------------------------------------------------- */
/* 🟨 PUBLIC MANAGEMENT                                                        */
/* -------------------------------------------------------------------------- */
export const listPublicUsers = asyncHandler(async (_, res) => {
  const users = await User.find({ role: "public" }).select("-password");
  res.json({ success: true, users });
});

export const addPublicUser = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, role: "public" });
  res.status(201).json({ success: true, user });
});

export const updatePublicUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, user });
});

export const deletePublicUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Public user deleted" });
});

/* -------------------------------------------------------------------------- */
/* 🔴 COMPLAINT MANAGEMENT                                                     */
/* -------------------------------------------------------------------------- */
export const getAllComplaintsSA = asyncHandler(async (_, res) => {
  const complaints = await Complaint.find()
    .populate("citizen", "firstName lastName email")
    .populate("filedBy", "firstName lastName role");

  res.json({ success: true, complaints });
});

export const getComplaintDetailsSA = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(
    "citizen filedBy managedBy"
  );

  res.json({ success: true, complaint });
});

export const updateComplaintStatusSA = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json({ success: true, complaint });
});

export const deleteComplaintSA = asyncHandler(async (req, res) => {
  await Complaint.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Complaint deleted" });
});
