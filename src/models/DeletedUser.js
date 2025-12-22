// backend/src/models/DeletedUser.js
import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema(
  {
    originalUserId: mongoose.Schema.Types.ObjectId,
    role: String,
    email: String,
    uniqueId: String,

    fullData: Object,        // 🔥 complete snapshot
    relatedData: Object,     // complaints, logs etc.

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reason: String,
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("DeletedUser", deletedUserSchema);
