// backend/src/controllers/adminController.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import logger from "../utils/logger.js";

/**
 * 🟩 Get Admin Dashboard Stats
 * Accessible to: Admin & SuperAdmin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalComplaints = await Complaint.countDocuments();
  const totalDepartments = await Department.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
  const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });

  const stats = {
    totalUsers,
    totalComplaints,
    totalDepartments,
    pendingComplaints,
    resolvedComplaints,
  };

  logger.info(`📊 Admin dashboard stats fetched by ${req.user.email}`);
  sendSuccess(res, { stats });
});

/**
 * 🟦 Manage Users
 * Accessible to: Admin & SuperAdmin
 */
export const manageUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  sendSuccess(res, { users });
});

/**
 * 🟪 Manage Departments
 * Accessible to: Admin & SuperAdmin
 */
export const manageDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  sendSuccess(res, { departments });
});

/**
 * 🟥 Delete User (optional)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, "User not found", 404);

  await user.deleteOne();
  logger.warn(`❌ User ${user.email} deleted by ${req.user.email}`);
  sendSuccess(res, { message: "User deleted successfully" });
});

/**
 * 🟨 Get Single User by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return sendError(res, "User not found", 404);

  sendSuccess(res, { user });
});
