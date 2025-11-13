import mongoose from "mongoose";

const VisitComplaintSchema = new mongoose.Schema(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    officerName: { type: String, required: true }, // Full officer name
    district: { type: String, required: true },
    village: { type: String, required: true },
    area: { type: String, default: "" },
    landmark: { type: String, default: "" },

    complainantName: { type: String, required: true },
    complainantPhone: { type: String, required: true },

    title: { type: String, required: true },
    category: { type: String, default: "Other" },
    description: { type: String },
    additionalNotes: { type: String },

    location: { type: String }, // Optional: for GPS coordinates or textual location
    attachment: { type: String, default: "" },

    recordedAt: { type: Date, default: Date.now }, // when officer recorded this
    status: {
      type: String,
      enum: ["Pending", "Resolved", "In Progress", "Forwarded"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("VisitComplaint", VisitComplaintSchema);
