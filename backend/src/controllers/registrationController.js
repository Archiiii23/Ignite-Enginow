import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  registerStudentForEvent,
  cancelStudentRegistration,
  getUserRegistrations,
} from "../services/registrationService.js";

/**
 * Register for Event (/api/events/:id/register) per Section 25
 */
export const registerForEvent = async (req, res) => {
  const registration = await registerStudentForEvent(
    req.user,
    req.params.id,
    req.body
  );
  return successResponse(res, 201, "Registered successfully for event!", registration);
};

/**
 * Get current student's registrations (/api/registrations/me) per Section 28
 */
export const getMyRegistrations = async (req, res) => {
  const registrations = await getUserRegistrations(req.user._id);
  return successResponse(res, 200, "Registrations retrieved successfully", registrations);
};

/**
 * Cancel registration (/api/registrations/:id) per Section 30
 */
export const cancelRegistration = async (req, res) => {
  const reg = await cancelStudentRegistration(req.user, req.params.id);
  return successResponse(res, 200, "Registration cancelled successfully", reg);
};
