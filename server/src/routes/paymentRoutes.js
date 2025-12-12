import { Router } from "express";
import {
  initializePayment,
  safePayCallback,
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
router.post("/safepay/callback", validatePaymentCallback, safePayCallback);
router.get("/safepay/callback", validatePaymentCallback, safePayCallback);
router.post("/mock/callback", validatePaymentCallback, mockPaymentCallback);

export default router;