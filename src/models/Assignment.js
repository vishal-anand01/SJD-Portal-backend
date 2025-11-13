import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* 🧾 History Schema - tracks all actions performed on assignment             */
/* -------------------------------------------------------------------------- */
const HistorySchema = new mongoose.Schema(
  {
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String },
    timestamp: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* 📋 Assignment Schema                                                       */
/* -------------------------------------------------------------------------- */
const AssignmentSchema = new mongoose.Schema(
  {
    // 🧑‍⚖️ Assigned by DM
    dm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👮 Officer assigned for visit
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧾 Linked complaints (if any)
    complaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],

    // 📍 Location details
    location: {
      district: { type: String, required: true },
      gramPanchayat: { type: String },
      block: { type: String },
      tahsil: { type: String },
      village: { type: String },
    },

    // 📅 Visit date (when officer should go)
    visitDate: { type: Date, required: true },

    // ⚡ Priority level
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // 📝 Additional notes or DM instructions
    notes: { type: String },

    // 🚦 Current status
    status: {
      type: String,
      enum: ["Assigned", "Accepted", "Visited", "Completed", "Cancelled"],
      default: "Assigned",
    },

    // 🕓 When the DM made the assignment
    assignedAt: {
      type: Date,
      default: Date.now, // ✅ exact timestamp when assigned
    },

    // 🕓 History of actions
    history: [HistorySchema],
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Assignment", AssignmentSchema);
