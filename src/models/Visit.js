// backend/src/models/Visit.js
import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    officer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    district: { type: String, required: true },
    block: { type: String, required: true },
    village: { type: String, required: true },
    date: { type: Date, required: true },
    purpose: { type: String, required: true },
    remarks: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Assigned",
    },
    reportFile: { type: String }, // file uploaded by officer after visit (optional)
  },
  { timestamps: true }
);

export default mongoose.models.Visit || mongoose.model("Visit", visitSchema);
