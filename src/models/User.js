import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    designation: {
      type: String,
      default: "",
    },
    departmentName: {
      type: String,
      default: "",
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    dob: { type: Date },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pincode: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    role: {
      type: String,
      enum: ["public", "officer", "department", "dm", "admin", "superadmin"],
      default: "public",
    },
    isVerified: { type: Boolean, default: false },

    // 🖼️ Profile photo or PDF file
    photo: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

// 🔐 Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password helper
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
