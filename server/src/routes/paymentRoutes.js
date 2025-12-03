import { Router } from "express";
import {
  initializePayment,
  jazzCashCallback,
  easyPaisaCallback,
  getPaymentStatus,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Initialize payment (requires auth)
router.post("/initialize", protect, initializePayment);

// Get payment status (requires auth)
router.get("/status/:orderId/:installmentId?", protect, getPaymentStatus);

// Payment gateway callbacks (public endpoints)
router.post("/jazzcash/callback", jazzCashCallback);
router.get("/jazzcash/callback", jazzCashCallback);
router.post("/easypaisa/callback", easyPaisaCallback);

export default router;
