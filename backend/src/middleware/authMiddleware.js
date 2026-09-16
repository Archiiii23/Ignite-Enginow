import { errorResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";

/**
 * Authentication Middleware per Section 12
 * Determines whether the current request belongs to an authenticated user
 */
export const requireAuth = async (req, res, next) => {
  // Support Passport session
  let currentUser = req.user;

  // Also support dev auth token / session header if testing programmatically
  if (!currentUser && req.session?.userId) {
    currentUser = await User.findById(req.session.userId);
    if (currentUser) req.user = currentUser;
  }

  // Support Bearer JWT or user-id header in development / API test environments
  if (!currentUser && req.headers.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
        if (decoded?.id) {
          currentUser = await User.findById(decoded.id);
          if (currentUser) req.user = currentUser;
        }
      } catch {
        // invalid token format
      }
    }
  }

  if (!currentUser) {
    return errorResponse(res, 401, "Authentication required. Please sign in.", "UNAUTHORIZED");
  }

  if (currentUser.accountStatus === "suspended") {
    return errorResponse(
      res,
      403,
      "Your account has been suspended. Please contact platform administrators.",
      "ACCOUNT_SUSPENDED"
    );
  }

  next();
};

/**
 * Optional Auth Middleware:
 * If authenticated, attaches user; if not, allows request to continue (e.g. for public event details)
 */
export const optionalAuth = async (req, res, next) => {
  if (req.user) return next();

  if (req.session?.userId) {
    const u = await User.findById(req.session.userId);
    if (u && u.accountStatus !== "suspended") {
      req.user = u;
    }
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
      if (decoded?.id) {
        const u = await User.findById(decoded.id);
        if (u && u.accountStatus !== "suspended") req.user = u;
      }
    } catch {}
  }

  next();
};
