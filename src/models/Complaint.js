import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* 🧩 Officer / Department Update Schema (Timeline)                           */
/* -------------------------------------------------------------------------- */
const updateSchema = new mongoose.Schema(
  {
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["officer", "department", "admin", "superadmin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Forwarded", "Rejected"],
      default: "Pending",
    },
    remarks: { type: String },
    attachment: { type: String }, // ✅ only one per update
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* 🧾 Main Complaint Schema                                                   */
/* -------------------------------------------------------------------------- */
const complaintSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sourceType: { type: String, enum: ["Public", "Officer"], default: "Public" },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    citizenName: { type: String, trim: true },
    citizenMobile: { type: String, trim: true },
    citizenDob: { type: Date },
    village: { type: String, default: "" },
    block: { type: String, default: "" },
    tehsil: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    landmark: { type: String, default: "" },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    location: { type: String, trim: true },

    // ✅ initial attachments (complaint filing time)
    attachments: { type: [String], default: [] },

    remarks: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Forwarded", "Rejected"],
      default: "Pending",
    },

    trackingId: { type: String, unique: true },
    serialNumber: { type: Number, unique: true },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ timeline updates (officer actions)
    officerUpdates: [updateSchema],

    // ✅ citizen feedback (separate)
    citizenRemarks: [
      {
        remark: { type: String },
        attachment: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/* ⚙️ Auto-generate Tracking ID & Serial Number                              */
/* -------------------------------------------------------------------------- */
complaintSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const year = new Date().getFullYear();
      const lastComplaint = await mongoose
        .model("Complaint")
        .findOne({}, { serialNumber: 1 })
        .sort({ serialNumber: -1 });
      const lastSerial = lastComplaint ? lastComplaint.serialNumber || 0 : 0;
      this.serialNumber = lastSerial + 1;
      const serialStr = this.serialNumber.toString().padStart(6, "0");
      this.trackingId = `SJD/${year}/CMP${serialStr}`;
    } catch (err) {
      console.error("❌ Error generating tracking ID:", err);
    }
  }
  next();
});

const Complaint =
  mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
export default Complaint;
