// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, unique: true, required: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // ❌ unique हटाया
    },

    password: { type: String, required: true, select: false },

    designation: String,
    departmentName: String,
    phone: String,
    dob: Date,
    address: String,
    city: String,
    district: String,
    state: String,
    country: String,
    pincode: String,

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

    photo: String,
    isVerified: { type: Boolean, default: false },

    // 🔥 DELETE SYSTEM
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// password hash
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
