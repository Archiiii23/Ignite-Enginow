import { errorResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

/**
 * Validates request payload against rule definitions
 */
export const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];
    const target = { ...req.params, ...req.query, ...req.body };

    for (const [field, constraints] of Object.entries(rules)) {
      const val = target[field];

      if (constraints.required && (val === undefined || val === null || val === "")) {
        errors.push(`${field} is required.`);
        continue;
      }

      if (val !== undefined && val !== null && val !== "") {
        if (constraints.type === "string" && typeof val !== "string") {
          errors.push(`${field} must be a string.`);
        }

        if (constraints.type === "number" && (isNaN(Number(val)) || typeof Number(val) !== "number")) {
          errors.push(`${field} must be a valid number.`);
        }

        if (constraints.type === "objectId" && !mongoose.Types.ObjectId.isValid(val)) {
          errors.push(`${field} must be a valid MongoDB ObjectId.`);
        }

        if (constraints.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val))) {
            errors.push(`${field} must be a valid email address.`);
          }
        }

        if (constraints.type === "date") {
          const d = new Date(val);
          if (isNaN(d.getTime())) {
            errors.push(`${field} must be a valid date.`);
          }
        }

        if (constraints.enum && !constraints.enum.includes(val)) {
          errors.push(`${field} must be one of: ${constraints.enum.join(", ")}.`);
        }

        if (constraints.min !== undefined) {
          if (typeof val === "string" && val.length < constraints.min) {
            errors.push(`${field} must be at least ${constraints.min} characters.`);
          }
          if (typeof val === "number" && val < constraints.min) {
            errors.push(`${field} must be greater than or equal to ${constraints.min}.`);
          }
        }

        if (constraints.max !== undefined) {
          if (typeof val === "string" && val.length > constraints.max) {
            errors.push(`${field} must not exceed ${constraints.max} characters.`);
          }
          if (typeof val === "number" && val > constraints.max) {
            errors.push(`${field} must be less than or equal to ${constraints.max}.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(" "), "VALIDATION_FAILED", errors);
    }

    next();
  };
};
