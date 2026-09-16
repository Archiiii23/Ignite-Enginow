import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { logger } from "../utils/logger.js";

export const configurePassport = () => {
  // Session serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Session deserialization
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(null, false);
      }
      if (user.accountStatus === "suspended") {
        return done(null, false, { message: "Account is suspended" });
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (clientID && clientSecret && clientID !== "mock_google_client_id") {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const googleId = profile.id;
            const profileImage = profile.photos?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || "Ignite User";

            if (!email) {
              return done(new Error("No email found in Google profile"), null);
            }

            // Find existing user by googleId or email
            let user = await User.findOne({ $or: [{ googleId }, { email }] });

            if (user) {
              if (!user.googleId) user.googleId = googleId;
              if (!user.profileImage && profileImage) user.profileImage = profileImage;
              user.lastLoginAt = new Date();
              await user.save();
            } else {
              // Retrieve role if passed in OAuth state or session, defaulting to student
              const preferredRole = (req.session?.preferredRole === "organizer" || req.query?.state === "organizer")
                ? "organizer"
                : "student"; // Admin cannot be self-selected per Section 10

              user = await User.create({
                name,
                email,
                googleId,
                profileImage: profileImage || undefined,
                role: preferredRole,
                accountStatus: "active",
                lastLoginAt: new Date(),
              });
              logger.info(`New user registered via Google OAuth: ${email} (${user.role})`);
            }

            return done(null, user);
          } catch (err) {
            logger.error("Error in GoogleStrategy verify callback:", err);
            return done(err, null);
          }
        }
      )
    );
  } else {
    logger.info("Google OAuth credentials are placeholder/mock. Standard OAuth endpoint available, plus developer instant login.");
  }
};
