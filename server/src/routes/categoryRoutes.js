import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  removeSubcategory,
} from "../controllers/categoryController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import multer from "multer";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategory);

// Admin routes
router.post("/", protect, requireAdmin, upload.single("icon"), createCategory);
router.put("/:id", protect, requireAdmin, upload.single("icon"), updateCategory);
router.delete("/:id", protect, requireAdmin, deleteCategory);
router.post("/:id/subcategories", protect, requireAdmin, addSubcategory);
router.put("/:id/subcategories/:subcategoryId", protect, requireAdmin, updateSubcategory);
router.delete(
  "/:id/subcategories/:subcategoryId",
  protect,
  requireAdmin,
  removeSubcategory,
);

export default router;




// import { Router } from "express";
// import {
//   getCategories,
//   getCategory,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   addSubcategory,
//   removeSubcategory,
// } from "../controllers/categoryController.js";
// import { protect, requireAdmin } from "../middleware/auth.js";

// const router = Router();

// // Public routes
// router.get("/", getCategories);
// router.get("/:slug", getCategory);

// // Admin routes
// router.post("/", protect, requireAdmin, createCategory);
// router.put("/:id", protect, requireAdmin, updateCategory);
// router.delete("/:id", protect, requireAdmin, deleteCategory);
// router.post("/:id/subcategories", protect, requireAdmin, addSubcategory);
// router.delete(
//   "/:id/subcategories/:subcategoryId",
//   protect,
//   requireAdmin,
//   removeSubcategory,
// );

// export default router;
