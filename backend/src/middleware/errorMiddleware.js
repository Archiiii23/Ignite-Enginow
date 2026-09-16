import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found`, "ROUTE_NOT_FOUND");
};

/**
 * Centralized Global Error Handler per Section 51
 */
export const globalErrorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${req.method} ${req.url}:`, err.message || err);

  // Mongoose Validation Error -> 400 or 422
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 400, messages.join(", "), "VALIDATION_ERROR", err.errors);
  }

  // Mongoose Duplicate Key Error (E11000) -> 409 Conflict per Section 26, 50
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "record";
    return errorResponse(
      res,
      409,
      `Duplicate entry for ${field}. A record with this value already exists.`,
      "DUPLICATE_KEY_ERROR"
    );
  }

  // Mongoose Cast Error (Invalid ObjectId) -> 400 Bad Request
  if (err.name === "CastError") {
    return errorResponse(res, 400, `Invalid ID format for ${err.path}`, "INVALID_ID");
  }

  // Authentication & Token errors
  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    return errorResponse(res, 401, "Invalid or expired authentication token", "UNAUTHORIZED");
  }

  // Custom status code if provided
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "OPERATION_FAILED");
  const message = err.message || "An unexpected internal server error occurred.";

  return errorResponse(
    res,
    statusCode,
    message,
    code,
    process.env.NODE_ENV !== "production" ? err.stack : undefined
  );
};
