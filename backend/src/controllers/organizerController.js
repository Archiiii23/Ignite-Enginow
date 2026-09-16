import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  requestOrganizerVerification,
  getOrganizerProfile,
  updateOrganizerProfile,
  getOrganizerEvents,
  getEventRegistrations,
  exportEventRegistrationsCsv,
  getOrganizerAnalytics,
} from "../services/organizerService.js";
import OrganizerProfile from "../models/OrganizerProfile.js";

/**
 * Submit verification request (/api/organizers/request) per Section 15
 */
export const submitVerificationRequest = async (req, res) => {
  const profile = await requestOrganizerVerification(req.user._id, req.body);
  return successResponse(
    res,
    200,
    "Organizer verification submitted. Admin will review your request.",
    profile
  );
};

/**
 * Get own organizer profile (/api/organizers/me)
 */
export const getMyOrganizerProfile = async (req, res) => {
  const profile = await getOrganizerProfile(req.user._id);
  if (!profile) {
    return errorResponse(
      res,
      404,
      "Organizer profile has not been created yet.",
      "ORGANIZER_PROFILE_NOT_FOUND"
    );
  }
  return successResponse(res, 200, "Organizer profile retrieved", profile);
};

/**
 * Update own organizer profile (/api/organizers/me)
 */
export const updateMyOrganizerProfile = async (req, res) => {
  const profile = await updateOrganizerProfile(req.user._id, req.body);
  return successResponse(res, 200, "Organizer profile updated successfully", profile);
};

/**
 * Get all events belonging to logged in organizer (/api/organizer/events)
 */
export const getMyEvents = async (req, res) => {
  const events = await getOrganizerEvents(req.user._id);
  return successResponse(res, 200, "Organizer events retrieved", events);
};

/**
 * Get participants of an organizer's event (/api/organizer/events/:eventId/registrations)
 */
export const getParticipants = async (req, res) => {
  const participants = await getEventRegistrations(req.user._id, req.params.eventId);
  return successResponse(res, 200, "Event participants retrieved", participants);
};

/**
 * Export participants to CSV (/api/organizer/events/:eventId/registrations/export)
 */
export const exportParticipants = async (req, res) => {
  const csvData = await exportEventRegistrationsCsv(req.user._id, req.params.eventId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="participants-${req.params.eventId}-${Date.now()}.csv"`
  );
  return res.status(200).send(csvData);
};

/**
 * Get organizer analytics (/api/organizer/analytics)
 */
export const getMyAnalytics = async (req, res) => {
  const analytics = await getOrganizerAnalytics(req.user._id);
  return successResponse(res, 200, "Organizer analytics retrieved", analytics);
};

/**
 * Public listing of organizers (for popular organizers on homepage per Section 66)
 */
export const getPublicOrganizers = async (req, res) => {
  const organizers = await OrganizerProfile.find({ verificationStatus: "APPROVED" })
    .populate("user", "name email profileImage headline")
    .sort({ eventsCount: -1 })
    .limit(10);
  return successResponse(res, 200, "Public organizers retrieved", organizers);
};
