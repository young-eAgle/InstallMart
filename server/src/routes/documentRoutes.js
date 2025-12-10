import { Router } from "express";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  getAllUserDocuments,
  updateDocumentStatus,
} from "../controllers/documentController.js";
import {
  uploadGuestDocument,
  getGuestDocuments,
  deleteGuestDocument,
  getGuestDocumentFile
} from "../controllers/guestDocumentController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

// User routes (authenticated)
router.post("/upload", protect, upload.single("document"), uploadDocument);
router.get("/my-documents", protect, getMyDocuments);
router.delete("/:documentId", protect, deleteDocument);

// Guest routes (no authentication required)
router.post("/guest-upload", upload.single("document"), uploadGuestDocument);
router.get("/guest/:orderId", getGuestDocuments);
router.delete("/guest/:documentId", deleteGuestDocument);
router.get("/guest/file/:documentId", getGuestDocumentFile);

// Admin routes
router.get("/all", protect, requireAdmin, getAllUserDocuments);
router.put(
  "/:userId/:documentId/status",
  protect,
  requireAdmin,
  updateDocumentStatus,
);

export default router;