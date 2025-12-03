import { Router } from "express";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  getAllUserDocuments,
  updateDocumentStatus,
} from "../controllers/documentController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

// User routes
router.post("/upload", protect, upload.single("document"), uploadDocument);
router.get("/my-documents", protect, getMyDocuments);
router.delete("/:documentId", protect, deleteDocument);

// Admin routes
router.get("/all", protect, requireAdmin, getAllUserDocuments);
router.put(
  "/:userId/:documentId/status",
  protect,
  requireAdmin,
  updateDocumentStatus,
);

export default router;
