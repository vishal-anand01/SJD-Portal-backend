import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
      role: { type: String },
    },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditSchema);
