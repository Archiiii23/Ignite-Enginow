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

const router = Router();

// Google OAuth initiate
router.get("/google", (req, res, next) => {
  const preferredRole = req.query.role || "student";
  if (req.session) {
    req.session.preferredRole = preferredRole;
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: preferredRole,
  })(req, res, next);
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/auth?error=oauth_failed`,
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
