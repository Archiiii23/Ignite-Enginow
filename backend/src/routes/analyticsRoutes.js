import { Router } from "express";
import {
  getAdminAnalytics,
  getOrganizerAnalyticsController,
} from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/admin", requireRole("admin"), asyncHandler(getAdminAnalytics));
router.get("/organizer", requireRole("organizer", "admin"), asyncHandler(getOrganizerAnalyticsController));

export default router;
