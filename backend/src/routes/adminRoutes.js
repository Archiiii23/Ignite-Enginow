import { Router } from "express";
import {
  getAdminUsers,
  toggleUserSuspension,
  getAdminOrganizers,
  approveOrganizer,
  rejectOrganizer,
  suspendOrganizer,
  getAdminEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  removeEvent,
  toggleFeaturedEvent,
  getAdminRegistrations,
  getAdminAnalytics,
} from "../controllers/adminController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  getAdminReports,
  updateAdminReport,
} from "../controllers/reportController.js";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import {
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { organizerRejectValidator } from "../validators/organizerValidators.js";
import { eventRejectValidator } from "../validators/registrationValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Protect ALL admin routes with Auth and Admin role per Section 36 & 59
router.use(requireAuth, requireRole("admin"));

// Users Management
router.get("/users", asyncHandler(getAdminUsers));
router.patch("/users/:id/suspend", asyncHandler(toggleUserSuspension));

// Organizers Queue & Approval
router.get("/organizers", asyncHandler(getAdminOrganizers));
router.patch("/organizers/:id/approve", asyncHandler(approveOrganizer));
router.patch("/organizers/:id/reject", validate(organizerRejectValidator), asyncHandler(rejectOrganizer));
router.patch("/organizers/:id/suspend", asyncHandler(suspendOrganizer));

// Events Review & Moderation
router.get("/events", asyncHandler(getAdminEvents));
router.get("/events/pending", asyncHandler(getPendingEvents));
router.patch("/events/:id/approve", asyncHandler(approveEvent));
router.patch("/events/:id/reject", validate(eventRejectValidator), asyncHandler(rejectEvent));
router.patch("/events/:id/remove", asyncHandler(removeEvent));
router.patch("/events/:id/feature", asyncHandler(toggleFeaturedEvent));

// Registrations & Analytics
router.get("/registrations", asyncHandler(getAdminRegistrations));
router.get("/analytics", asyncHandler(getAdminAnalytics));

// Category Management per Section 38
router.post("/categories", asyncHandler(createCategory));
router.patch("/categories/:id", asyncHandler(updateCategory));
router.delete("/categories/:id", asyncHandler(deleteCategory));

// Reports Management per Section 42
router.get("/reports", asyncHandler(getAdminReports));
router.patch("/reports/:id", asyncHandler(updateAdminReport));

// Announcement Management per Section 41
router.post("/announcements", asyncHandler(createAnnouncement));
router.patch("/announcements/:id", asyncHandler(updateAnnouncement));
router.delete("/announcements/:id", asyncHandler(deleteAnnouncement));

// Banner Management per Section 40
router.post("/banners", asyncHandler(createBanner));
router.patch("/banners/:id", asyncHandler(updateBanner));
router.delete("/banners/:id", asyncHandler(deleteBanner));

export default router;
