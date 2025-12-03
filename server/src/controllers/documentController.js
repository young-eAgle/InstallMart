import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

// Upload user document
export const uploadDocument = asyncHandler(async (req, res) => {
  const { type } = req.body;

  console.log("📄 Uploading document for user:", req.user.id);
  console.log("📝 Document type:", type);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, {
      folder: `user-documents/${req.user.id}`,
    });

    // Delete local file
    await unlinkAsync(req.file.path);

    // Find user and add document
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add document to user
    user.documents.push({
      type,
      url: result.url,
      cloudinaryPublicId: result.publicId,
      status: "pending",
    });

    // Update verification status if all required docs are uploaded
    const hasAllRequiredDocs = ["cnic_front", "cnic_back"].every((docType) =>
      user.documents.some((doc) => doc.type === docType),
    );

    if (hasAllRequiredDocs && user.verificationStatus === "unverified") {
      user.verificationStatus = "pending";
    }

    await user.save();

    console.log("✅ Document uploaded successfully");

    res.json({
      message: "Document uploaded successfully",
      document: user.documents[user.documents.length - 1],
    });
  } catch (error) {
    // Clean up file if upload fails
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to delete local file:", unlinkError);
      }
    }
    throw error;
  }
});

// Get user documents
export const getMyDocuments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "documents verificationStatus documentsVerified",
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    documents: user.documents,
    verificationStatus: user.verificationStatus,
    documentsVerified: user.documentsVerified,
  });
});

// Delete document
export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const document = user.documents.id(documentId);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Delete from Cloudinary
  if (document.cloudinaryPublicId) {
    try {
      await deleteFromCloudinary(document.cloudinaryPublicId);
    } catch (error) {
      console.error("Failed to delete from Cloudinary:", error);
    }
  }

  // Remove from user documents
  user.documents.pull(documentId);
  await user.save();

  res.json({ message: "Document deleted successfully" });
});

// Admin: Get all users with documents
export const getAllUserDocuments = asyncHandler(async (req, res) => {
  const users = await User.find({
    documents: { $exists: true, $ne: [] },
  }).select(
    "fullName email documents verificationStatus documentsVerified createdAt",
  );

  res.json({ users });
});

// Admin: Update document verification status
export const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { userId, documentId } = req.params;
  const { status, rejectionReason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const document = user.documents.id(documentId);
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  document.status = status;
  if (rejectionReason) {
    document.rejectionReason = rejectionReason;
  }

  // Update user verification status
  const allApproved = user.documents.every((doc) => doc.status === "approved");
  const anyRejected = user.documents.some((doc) => doc.status === "rejected");

  if (allApproved) {
    user.verificationStatus = "verified";
    user.documentsVerified = true;
  } else if (anyRejected) {
    user.verificationStatus = "rejected";
  }

  await user.save();

  console.log(`✅ Document ${status} for user ${user.fullName}`);

  res.json({
    message: "Document status updated",
    user: {
      id: user.id,
      verificationStatus: user.verificationStatus,
      documentsVerified: user.documentsVerified,
    },
  });
});
