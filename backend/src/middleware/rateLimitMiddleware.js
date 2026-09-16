import rateLimit from "express-rate-limit";
import { errorResponse } from "../utils/apiResponse.js";

// General rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many requests from this IP. Please try again after 15 minutes.",
      "RATE_LIMIT_EXCEEDED"
    );
  },
});

// Stricter limiter for registrations and auth
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many attempts. Please try again later.",
      "SENSITIVE_RATE_LIMIT_EXCEEDED"
    );
  },
});
