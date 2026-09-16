/**
 * Production-safe logger for Ignite Enginow Backend
 * Filters out passwords, session secrets, and sensitive tokens
 */

const sanitize = (arg) => {
  if (!arg) return arg;
  if (typeof arg === "object") {
    const copy = { ...arg };
    const sensitiveKeys = [
      "password",
      "clientSecret",
      "secret",
      "GOOGLE_CLIENT_SECRET",
      "SESSION_SECRET",
      "CLOUDINARY_API_SECRET",
      "token",
      "accessToken",
      "refreshToken",
    ];
    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        copy[key] = "[REDACTED]";
      } else if (typeof copy[key] === "object" && copy[key] !== null) {
        copy[key] = sanitize(copy[key]);
      }
    }
    return copy;
  }
  return arg;
};

export const logger = {
  info: (...args) => {
    console.log(`[INFO] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  warn: (...args) => {
    console.warn(`[WARN] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  error: (...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] [${new Date().toISOString()}]`, ...args.map(sanitize));
    }
  },
};
