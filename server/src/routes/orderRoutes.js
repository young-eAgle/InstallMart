import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);

export default router;

