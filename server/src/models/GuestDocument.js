import mongoose from "mongoose";

const guestDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "cnic_front",
      "cnic_back",
      "utility_bill",
      "salary_slip",
      "bank_statement",
      "other",
    ],
    required: true,
  },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  orderId: { type: String, required: true }, // Associate with temporary order
  sessionId: { type: String }, // Optional session ID for tracking
  status: {
    type: String,
    enum: ["pending", "processed", "deleted"],
    default: "pending",
  },
  uploadedAt: { type: Date, default: Date.now },
  // Documents will expire after 30 days
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

// Index for automatic cleanup
guestDocumentSchema.index({ expiresAt: 1 });

export const GuestDocument = mongoose.model("GuestDocument", guestDocumentSchema);