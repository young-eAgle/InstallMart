import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.delete("/", clearWishlist);
router.get("/check/:productId", checkInWishlist);

export default router;
