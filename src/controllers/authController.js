// backend/src/controllers/authController.js

import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import auditService from "../services/auditService.js";
import { sendEmail } from "../services/emailService.js";
import { generateWelcomeEmail } from "../emailTemplates/welcomeEmail.js";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    dob,
    address,
    city,
    state,
    country,
    pincode,
    gender,
  } = req.body;

  // ✅ Validate inputs
  if (!email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error("All required fields must be filled.");
  }

  // ✅ Check existing user
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("User already registered with this email.");
  }

  // ✅ Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    password,
    phone,
    dob,
    address,
    city,
    state,
    country,
    pincode,
    gender,
    role: "public",
  });

  // ✅ Log activity
  await auditService.log({
    actor: {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    action: "USER_REGISTERED",
    resourceType: "User",
    resourceId: newUser._id.toString(),
    details: {
      name: newUser.name,
      email: newUser.email,
    },
    req,
  });

  // ✅ Generate JWT token
  const token = generateToken(newUser);

  // ✅ Set session cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // ✅ Send Welcome Email (non-blocking)
  try {
    const { subject, html, text } = generateWelcomeEmail(newUser);
    await sendEmail({
      to: newUser.email,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.warn("⚠️ Welcome email failed:", err.message);
  }

  // ✅ Final response
  res.status(201).json({
    message: "Registration successful",
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validate inputs
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  // ✅ Find user
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  // ✅ Generate token
  const token = generateToken(user);

  // ✅ Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // ✅ Log activity
  await auditService.log({
    actor: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    action: "USER_LOGGED_IN",
    resourceType: "User",
    resourceId: user._id.toString(),
    req,
  });

  // ✅ Response
  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  await auditService.log({
    actor: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
    },
    action: "USER_LOGGED_OUT",
    resourceType: "User",
    resourceId: req.user?._id?.toString(),
    req,
  });

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});
