import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getNotifications));
router.patch("/:id/read", asyncHandler(markAsRead));
router.patch("/read-all", asyncHandler(markAllAsRead));

export default router;
