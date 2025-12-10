import { Router } from "express";
import {
  initializePayment,
  jazzCashCallback,
  easyPaisaCallback,
  mockPaymentCallback,
  getPaymentStatus,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";
import { paymentSecurity, validatePaymentCallback } from "../middleware/paymentSecurity.js";

const router = Router();

// Initialize payment (requires auth and enhanced security)
router.post("/initialize", protect, paymentSecurity, initializePayment);

// Get payment status (requires auth)
router.get("/status/:orderId/:installmentId?", protect, getPaymentStatus);

// Payment gateway callbacks (public endpoints with validation)
router.post("/jazzcash/callback", validatePaymentCallback, jazzCashCallback);
router.get("/jazzcash/callback", validatePaymentCallback, jazzCashCallback);
router.post("/easypaisa/callback", validatePaymentCallback, easyPaisaCallback);
router.post("/mock/callback", validatePaymentCallback, mockPaymentCallback);

export default router;