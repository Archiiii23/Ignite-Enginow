import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEvent,
  saveEvent,
  unsaveEvent,
  viewEvent,
} from "../controllers/eventController.js";
import { registerForEvent } from "../controllers/registrationController.js";
import { requireAuth, optionalAuth } from "../middleware/authMiddleware.js";
import { requireRole, requireApprovedOrganizer } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  createEventValidatorRules,
  validateEventDates,
} from "../validators/eventValidators.js";
import { registerValidator } from "../validators/registrationValidators.js";
import { sensitiveLimiter } from "../middleware/rateLimitMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public event listing with search, filtering, and pagination
router.get("/", asyncHandler(getEvents));

// Event details (supports optional auth to return student registration status)
router.get("/:id", optionalAuth, asyncHandler(getEventById));

// Create event draft (Organizer must be approved per Section 18 & 61)
router.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  requireApprovedOrganizer,
  validate(createEventValidatorRules),
  validateEventDates,
  asyncHandler(createEvent)
);

// Edit draft / rejected event
router.patch(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  validateEventDates,
  asyncHandler(updateEvent)
);

// Delete event draft
router.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(deleteEvent)
);

// Submit event for admin review per Section 18 & 61
router.post(
  "/:id/submit",
  requireAuth,
  requireRole("organizer", "admin"),
  requireApprovedOrganizer,
  asyncHandler(submitEvent)
);

// Save / Favorite event per Section 29
router.post("/:id/save", requireAuth, asyncHandler(saveEvent));
router.delete("/:id/save", requireAuth, asyncHandler(unsaveEvent));

// Record view per Section 45
router.post("/:id/view", asyncHandler(viewEvent));

// Student registration per Section 25 & 40
router.post(
  "/:id/register",
  requireAuth,
  requireRole("student", "admin"),
  sensitiveLimiter,
  validate(registerValidator),
  asyncHandler(registerForEvent)
);

export default router;
