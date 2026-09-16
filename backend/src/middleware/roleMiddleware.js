import { errorResponse } from "../utils/apiResponse.js";
import OrganizerProfile from "../models/OrganizerProfile.js";

/**
 * Role-Based Authorization Middleware per Section 13
 * Reusable for "student", "organizer", "admin"
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required.", "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden. Access requires one of the following roles: ${allowedRoles.join(", ")}`,
        "FORBIDDEN_ROLE"
      );
    }

    next();
  };
};

/**
 * Organizer Verification Guard per Section 13, 14, 61
 * Checks that user is an organizer AND has an APPROVED verificationStatus
 */
export const requireApprovedOrganizer = async (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required.", "UNAUTHORIZED");
  }

  // Admin bypasses organizer requirement for administrative actions
  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.role !== "organizer") {
    return errorResponse(
      res,
      403,
      "Forbidden. Only organizers can access this resource.",
      "FORBIDDEN_ROLE"
    );
  }

  const profile = await OrganizerProfile.findOne({ user: req.user._id });

  if (!profile || profile.verificationStatus !== "APPROVED") {
    const status = profile?.verificationStatus || "NOT_REQUESTED";
    return errorResponse(
      res,
      403,
      `Organizer verification is required. Current status: ${status}`,
      "ORGANIZER_NOT_APPROVED"
    );
  }

  req.organizerProfile = profile;
  next();
};
