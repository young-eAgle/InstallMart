import { Router } from "express";
import {
  getActiveBanners,
  getAllBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

// Public routes
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", protect, requireAdmin, getAllBanners);
router.get("/:id", protect, requireAdmin, getBanner);
router.post("/", protect, requireAdmin, upload.single("image"), createBanner);
router.put("/:id", protect, requireAdmin, upload.single("image"), updateBanner);
router.delete("/:id", protect, requireAdmin, deleteBanner);

export default router;
