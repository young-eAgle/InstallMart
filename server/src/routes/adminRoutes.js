import { Router } from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import { getUsers, getAdminStats } from "../controllers/adminController.js";
import {
  getAllOrders,
  updateInstallmentStatus,
  updatePaymentStatus,
} from "../controllers/orderController.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { uploadSingle } from "../middleware/upload.js";

const router = Router();

router.use(protect, requireAdmin);

router.get("/users", getUsers);
router.get("/stats", getAdminStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/installments/:installmentId", updateInstallmentStatus);
router.patch("/orders/:orderId/payment", updatePaymentStatus);

// Product routes with image upload
router.post("/products", uploadSingle('image'), createProduct);
router.put("/products/:id", uploadSingle('image'), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;






// import { Router } from "express";
// import { protect, requireAdmin } from "../middleware/auth.js";
// import { getUsers, getAdminStats } from "../controllers/adminController.js";
// import {
//   getAllOrders,
//   updateInstallmentStatus,
//   updatePaymentStatus,
// } from "../controllers/orderController.js";
// import {
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "../controllers/productController.js";

// const router = Router();

// router.use(protect, requireAdmin);

// router.get("/users", getUsers);
// router.get("/stats", getAdminStats);
// router.get("/orders", getAllOrders);
// router.patch("/orders/:orderId/installments/:installmentId", updateInstallmentStatus);
// router.patch("/orders/:orderId/payment", updatePaymentStatus);
// router.post("/products", createProduct);
// router.put("/products/:id", updateProduct);
// router.delete("/products/:id", deleteProduct);

// export default router;
