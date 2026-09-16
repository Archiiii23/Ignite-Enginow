import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { demoLoginUser, getUserById } from "../services/authService.js";
import { logger } from "../utils/logger.js";

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
 * Google OAuth Callback handler
 */
export const googleAuthSuccess = (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  if (req.user) {
    if (req.session) req.session.userId = req.user._id.toString();
    res.redirect(`${clientUrl}/dashboard`);
  } else {
    res.redirect(`${clientUrl}/auth?error=oauth_failed`);
  }
};
