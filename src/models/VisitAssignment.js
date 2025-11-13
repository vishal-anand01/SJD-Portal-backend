    import mongoose from "mongoose";

const visitAssignmentSchema = new mongoose.Schema(
  {
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // DM / Admin who assigned
    },
    visitDate: {
      type: Date,
      required: true,
    },
    location: {
      district: { type: String, required: true },
      gramPanchayat: { type: String },
      village: { type: String },
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Assigned", "Visited", "Pending", "Completed"],
      default: "Assigned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("VisitAssignment", visitAssignmentSchema);
