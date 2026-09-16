import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import {
  queryPublicEvents,
  getEventDetails,
  createEventDraft,
  updateOrganizerEvent,
  submitEventForReview,
  recordEventView,
} from "../services/eventService.js";
import { saveUserEvent, unsaveUserEvent } from "../services/registrationService.js";
import Event from "../models/Event.js";

/**
 * Public Events Listing (/api/events) per Section 21 & 22
 */
export const getEvents = async (req, res) => {
  const { events, pagination } = await queryPublicEvents(req.query);
  return paginatedResponse(res, 200, events, pagination);
};

/**
 * Event Details (/api/events/:id) per Section 23
 */
export const getEventById = async (req, res) => {
  const currentUserId = req.user?._id;
  const event = await getEventDetails(req.params.id, currentUserId);

  if (!event) {
    return errorResponse(res, 404, "Event not found", "EVENT_NOT_FOUND");
  }

  // Non-approved events can only be viewed by their author or admin
  if (
    event.status !== "APPROVED" &&
    (!req.user ||
      (req.user.role !== "admin" &&
        event.organizer?.toString() !== req.user._id.toString()))
  ) {
    return errorResponse(res, 404, "Event not found or not yet approved.", "EVENT_NOT_FOUND");
  }

  return successResponse(res, 200, "Event details retrieved", event);
};

/**
 * Create Event Draft (/api/events) per Section 18
 */
export const createEvent = async (req, res) => {
  const event = await createEventDraft(req.user._id, req.body);
  return successResponse(res, 201, "Event draft created successfully", event);
};

/**
 * Update Event (/api/events/:id) per Section 18
 */
export const updateEvent = async (req, res) => {
  const event = await updateOrganizerEvent(req.params.id, req.user._id, req.body);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "EVENT_NOT_FOUND");
  }
  return successResponse(res, 200, "Event updated successfully", event);
};

/**
 * Delete Event Draft (/api/events/:id)
 */
export const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "EVENT_NOT_FOUND");
  }

  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return errorResponse(res, 403, "Forbidden. You cannot delete this event.", "FORBIDDEN");
  }

  await event.deleteOne();
  return successResponse(res, 200, "Event deleted successfully");
};

/**
 * Submit Event for Admin Review (/api/events/:id/submit) per Section 18 & 61
 */
export const submitEvent = async (req, res) => {
  const event = await submitEventForReview(req.params.id, req.user._id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "EVENT_NOT_FOUND");
  }
  return successResponse(
    res,
    200,
    "Event submitted for admin review successfully. Status is now PENDING_REVIEW.",
    event
  );
};

/**
 * Save Event (/api/events/:id/save) per Section 29
 */
export const saveEvent = async (req, res) => {
  const saved = await saveUserEvent(req.user._id, req.params.id);
  return successResponse(res, 200, "Event saved to favorites", saved);
};

/**
 * Unsave Event (/api/events/:id/save) per Section 29
 */
export const unsaveEvent = async (req, res) => {
  await unsaveUserEvent(req.user._id, req.params.id);
  return successResponse(res, 200, "Event removed from favorites");
};

/**
 * Record view (/api/events/:id/view) per Section 45
 */
export const viewEvent = async (req, res) => {
  await recordEventView(req.params.id);
  return successResponse(res, 200, "View recorded");
};
