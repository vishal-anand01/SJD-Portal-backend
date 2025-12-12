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
    attachment: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* 🧾 Forwarding Schema                                                      */
/* -------------------------------------------------------------------------- */
const forwardSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["officer", "department", "dm"], required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    remarks: String,
    attachment: String,
    forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

/* -------------------------------------------------------------------------- */
/* 🧾 Main Complaint Schema                                                   */
/* -------------------------------------------------------------------------- */
const complaintSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    sourceType: {
      type: String,
      enum: ["Public", "Officer"],
      default: "Public",
    },

    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    citizenName: String,
    citizenMobile: String,
    citizenDob: Date,

    village: String,
    block: String,
    tehsil: String,
    district: String,
    state: String,
    pincode: String,
    landmark: String,

    title: { type: String, required: true },
    description: String,
    location: String,

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

    /* ---------------------------------------------------------------------- */
    /* 🔥 MISSING — Add these fields so forwarding works                      */
    /* ---------------------------------------------------------------------- */
    forwardedToOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    forwardedToDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    forwardedToDM: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    /* Full forwarding history */
    forwards: [forwardSchema],

    /* Department Update Timeline */
    departmentUpdates: [updateSchema],

    /* Officer Update Timeline */
    officerUpdates: [updateSchema],

    /* Citizen feedback */
    citizenRemarks: [
      {
        remark: String,
        attachment: String,
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

export default mongoose.models.Complaint ||
  mongoose.model("Complaint", complaintSchema);
