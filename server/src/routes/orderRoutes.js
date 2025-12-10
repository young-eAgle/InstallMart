import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { createGuestOrder, getGuestOrder } from "../controllers/guestOrderController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Authenticated user routes
router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);

// Guest routes (no authentication required)
router.post("/guest", createGuestOrder);
router.get("/guest/:orderId", getGuestOrder);

export default router;