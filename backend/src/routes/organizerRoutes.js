import { Router } from "express";
import {
  submitVerificationRequest,
  getMyOrganizerProfile,
  updateMyOrganizerProfile,
  getMyEvents,
  getParticipants,
  exportParticipants,
  getMyAnalytics,
  getPublicOrganizers,
} from "../controllers/organizerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole, requireApprovedOrganizer } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { organizerRequestValidator } from "../validators/organizerValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public listing of active organizers per Section 66
router.get("/", asyncHandler(getPublicOrganizers));

// Authenticated organizer profile operations per Section 15 & 40
router.post(
  "/request",
  requireAuth,
  validate(organizerRequestValidator),
  asyncHandler(submitVerificationRequest)
);
router.get("/me", requireAuth, asyncHandler(getMyOrganizerProfile));
router.patch("/me", requireAuth, asyncHandler(updateMyOrganizerProfile));

// Organizer event and participant management per Section 31, 32, 33, 40
router.get(
  "/events",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(getMyEvents)
);

router.get(
  "/events/:eventId/registrations",
  requireAuth,
  requireRole("organizer", "admin"),
  requireApprovedOrganizer,
  asyncHandler(getParticipants)
);

router.get(
  "/events/:eventId/registrations/export",
  requireAuth,
  requireRole("organizer", "admin"),
  requireApprovedOrganizer,
  asyncHandler(exportParticipants)
);

router.get(
  "/analytics",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(getMyAnalytics)
);

export default router;
