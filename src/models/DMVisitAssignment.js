import mongoose from "mongoose";

const dmVisitAssignmentSchema = new mongoose.Schema(
  {
    dm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    district: String,
    block: String,
    village: String,
    visitDate: Date,
    remarks: String,
    status: {
      type: String,
      enum: ["Assigned", "Pending", "Completed", "Cancelled"],
      default: "Assigned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DMVisitAssignment", dmVisitAssignmentSchema);
