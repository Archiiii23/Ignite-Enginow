import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { demoLoginUser, getUserById } from "../services/authService.js";
import { logger } from "../utils/logger.js";
import User from "../models/User.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Get currently authenticated user per Section 11 & 58 (/api/auth/me)
 */
export const getMe = async (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated", "UNAUTHORIZED");
  }

  const profile = await getUserById(req.user._id);
  if (!profile) {
    return errorResponse(res, 404, "User profile not found", "USER_NOT_FOUND");
  }

  return successResponse(res, 200, "Current authenticated user profile", profile);
};

/**
 * Logout user (/api/auth/logout)
 */
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy((destroyErr) => {
        if (destroyErr) logger.warn("Session destroy error on logout:", destroyErr);
        res.clearCookie("connect.sid");
        return successResponse(res, 200, "Logged out successfully");
      });
    } else {
      return successResponse(res, 200, "Logged out successfully");
    }
  });
};

/**
 * Demo Login Endpoint (/api/auth/demo-login)
 * Enables instant switching and full local testing of student, organizer, and admin
 */
export const demoLogin = async (req, res) => {
  const { role = "student" } = req.body;
  if (!["student", "organizer", "admin"].includes(role)) {
    return errorResponse(res, 400, "Invalid role specified.", "INVALID_ROLE");
  }

  const { user, organizerProfile } = await demoLoginUser(role);

  req.login(user, (err) => {
    if (err) {
      return errorResponse(res, 500, "Failed to establish session", "SESSION_ERROR");
    }
    if (req.session) {
      req.session.userId = user._id.toString();
    }

    const safeUser = user.toSafeObject();
    if (organizerProfile) {
      safeUser.orgName = organizerProfile.organizationName;
      safeUser.orgWebsite = organizerProfile.website;
      safeUser.verificationStatus = organizerProfile.verificationStatus;
    }

    return successResponse(res, 200, `Successfully signed in as ${role} persona`, safeUser);
  });
};

/**
 * First-Login Role Selection (/api/auth/select-role)
 * Users choose between Participant (student) and Organizer on first login
 */
export const selectRole = async (req, res) => {
  const { role } = req.body;
  if (!role || !["participant", "student", "organizer"].includes(role.toLowerCase())) {
    return errorResponse(res, 400, "Role must be 'participant' or 'organizer'", "INVALID_ROLE");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return errorResponse(res, 404, "User profile not found", "USER_NOT_FOUND");
  }

  if (user.isRoleSelected) {
    return errorResponse(
      res,
      403,
      "Your role has already been established. Role changes require administrator approval.",
      "ROLE_LOCKED"
    );
  }

  const finalRole = role.toLowerCase() === "organizer" ? "organizer" : "student";
  user.role = finalRole;
  user.isRoleSelected = true;
  await user.save();

  let orgProfile = null;
  if (finalRole === "organizer") {
    orgProfile = await OrganizerProfile.findOne({ user: user._id });
    if (!orgProfile) {
      orgProfile = await OrganizerProfile.create({
        user: user._id,
        organizationName: user.name + " Organization",
        organizationType: "Independent Organizer",
        contactEmail: user.email,
        verificationStatus: "NOT_REQUESTED",
      });
    }
  }

  await AuditLog.create({
    actor: user._id,
    actorName: user.name,
    actorEmail: user.email,
    action: "ROLE_SELECTED_FIRST_LOGIN",
    entityType: "User",
    entityId: user._id,
    metadata: { selectedRole: finalRole },
  });

  const safeUser = user.toSafeObject();
  if (orgProfile) {
    safeUser.orgName = orgProfile.organizationName;
    safeUser.orgWebsite = orgProfile.website;
    safeUser.verificationStatus = orgProfile.verificationStatus;
  }

  logger.info(`User ${user.email} completed first-login role selection: ${finalRole}`);
  return successResponse(res, 200, `Role confirmed as ${finalRole === "student" ? "Participant" : "Organizer"}`, safeUser);
};

/**
 * Request Role Change (/api/auth/request-role-change)
 * Role can only be changed after administrator approval
 */
export const requestRoleChange = async (req, res) => {
  const { requestedRole, reason } = req.body;
  if (!requestedRole || !["participant", "student", "organizer"].includes(requestedRole.toLowerCase())) {
    return errorResponse(res, 400, "Requested role must be 'participant' or 'organizer'", "INVALID_ROLE");
  }

  const targetRole = requestedRole.toLowerCase() === "organizer" ? "organizer" : "student";
  if (req.user.role === targetRole) {
    return errorResponse(res, 400, "You already have this role.", "SAME_ROLE");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return errorResponse(res, 404, "User profile not found", "USER_NOT_FOUND");
  }

  if (user.roleChangeRequest?.status === "PENDING") {
    return errorResponse(
      res,
      409,
      "A role change request is already pending administrator review.",
      "REQUEST_ALREADY_PENDING"
    );
  }

  user.roleChangeRequest = {
    requestedRole: targetRole,
    reason: reason || "User requested role change",
    status: "PENDING",
    requestedAt: new Date(),
  };
  await user.save();

  await AuditLog.create({
    actor: user._id,
    actorName: user.name,
    actorEmail: user.email,
    action: "ROLE_CHANGE_REQUESTED",
    entityType: "User",
    entityId: user._id,
    metadata: { currentRole: user.role, requestedRole: targetRole, reason },
  });

  logger.info(`Role change requested by ${user.email}: ${user.role} -> ${targetRole}`);
  return successResponse(
    res,
    200,
    "Role change request submitted successfully. Awaiting administrator approval.",
    user.toSafeObject()
  );
};

/**
 * Google OAuth Callback handler
 */
export const googleAuthSuccess = (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  if (req.user) {
    if (req.session) req.session.userId = req.user._id.toString();
    const needsRole = req.user.isRoleSelected === false;
    res.redirect(`${clientUrl}/dashboard${needsRole ? "?select_role=true" : ""}`);
  } else {
    res.redirect(`${clientUrl}/auth?error=oauth_failed`);
  }
};
