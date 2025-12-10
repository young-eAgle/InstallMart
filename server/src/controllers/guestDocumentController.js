import { GuestDocument } from "../models/GuestDocument.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const unlinkAsync = promisify(fs.unlink);

// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads/guest-documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Upload guest document
export const uploadGuestDocument = asyncHandler(async (req, res) => {
  const { type, orderId, sessionId } = req.body;

  console.log("📄 Uploading document for guest order:", orderId);
  console.log("📝 Document type:", type);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Move file to guest documents directory
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const newFilePath = path.join(uploadDir, fileName);
    
    // Move file from temp location to permanent location
    fs.renameSync(req.file.path, newFilePath);

    // Create document record
    const document = new GuestDocument({
      type,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: newFilePath,
      orderId,
      sessionId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await document.save();

    console.log("✅ Guest document uploaded successfully");

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
        status: document.status
      }
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

// Get guest documents by order ID
export const getGuestDocuments = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const documents = await GuestDocument.find({ orderId })
    .select('id type fileName fileSize uploadedAt status')
    .sort({ uploadedAt: -1 });

  res.json({
    documents
  });
});

// Delete guest document
export const deleteGuestDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  
  const document = await GuestDocument.findById(documentId);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document not found"
    });
  }
  
  // Delete file from filesystem
  if (fs.existsSync(document.filePath)) {
    try {
      await unlinkAsync(document.filePath);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }
  
  // Delete document record
  await GuestDocument.findByIdAndDelete(documentId);
  
  res.json({
    success: true,
    message: "Document deleted successfully"
  });
});

// Get guest document file
export const getGuestDocumentFile = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  
  const document = await GuestDocument.findById(documentId);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document not found"
    });
  }
  
  // Check if file exists
  if (!fs.existsSync(document.filePath)) {
    return res.status(404).json({
      success: false,
      message: "Document file not found"
    });
  }
  
  // Set appropriate content type based on file extension
  const ext = path.extname(document.fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  };
  
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(document.filePath);
  fileStream.pipe(res);
  
  fileStream.on('error', (error) => {
    console.error("Error streaming file:", error);
    res.status(500).json({
      success: false,
      message: "Error serving document"
    });
  });
});