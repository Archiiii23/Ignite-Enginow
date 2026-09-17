import { Router } from "express";
import passport from "passport";
import {
  getMe,
  logout,
  demoLogin,
  googleAuthSuccess,
  selectRole,
  requestRoleChange,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

const router = Router();

// Google OAuth initiate
router.get("/google", async (req, res, next) => {
  const preferredRole = req.query.role || "student";
  if (req.session) {
    req.session.preferredRole = preferredRole;
  }

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const isRealGoogleConfigured = clientID && clientSecret && clientID !== "mock_google_client_id";

  if (isRealGoogleConfigured) {
    return passport.authenticate("google", {
      scope: ["profile", "email"],
      state: preferredRole,
    })(req, res, next);
  }

  // Developer mode simulation when actual Google OAuth client credentials are placeholders
  try {
    const email = "alex.rivera@campus.edu";
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: "Alex Rivera",
        email,
        googleId: "google_mock_12345",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "student",
        isRoleSelected: false,
        accountStatus: "active",
        lastLoginAt: new Date(),
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      if (req.session) req.session.userId = user._id.toString();
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const needsRole = user.isRoleSelected === false;
      return res.redirect(`${clientUrl}/${needsRole ? "?select_role=true" : ""}`);
    });
  } catch (err) {
    next(err);
  }
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth?error=oauth_failed`,
  }),
  googleAuthSuccess
);

// Get current session user
router.get("/me", requireAuth, asyncHandler(getMe));

// Logout
router.post("/logout", requireAuth, logout);

// First-login role selection: Participant (student) vs Organizer
router.post("/select-role", requireAuth, asyncHandler(selectRole));

// Request role change (requires administrator approval)
router.post("/request-role-change", requireAuth, asyncHandler(requestRoleChange));

// Instant developer demo login (student, organizer, admin)
router.post("/demo-login", asyncHandler(demoLogin));

export default router;
