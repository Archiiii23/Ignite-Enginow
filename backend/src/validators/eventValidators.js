import { errorResponse } from "../utils/apiResponse.js";

export const createEventValidatorRules = {
  title: { required: true, type: "string", min: 3, max: 200 },
  category: { required: true, type: "string" },
  eventDate: { required: true, type: "date" },
  location: { required: true, type: "string", min: 2 },
  capacity: { type: "number", min: 1 },
  mode: { enum: ["Online", "In-person", "Hybrid"] },
};

/**
 * Custom semantic validation for business dates & logic
 */
export const validateEventDates = (req, res, next) => {
  const { eventDate, registrationDeadline } = req.body;

  if (eventDate) {
    const eventD = new Date(eventDate);
    if (isNaN(eventD.getTime())) {
      return errorResponse(res, 400, "Invalid event date format.", "INVALID_DATE");
    }

    if (registrationDeadline) {
      const deadlineD = new Date(registrationDeadline);
      if (isNaN(deadlineD.getTime())) {
        return errorResponse(res, 400, "Invalid registration deadline format.", "INVALID_DEADLINE");
      }

      // Registration deadline must not be after event date per Section 19
      if (deadlineD.getTime() > eventD.getTime()) {
        return errorResponse(
          res,
          400,
          "Registration deadline must not be after the event date.",
          "INVALID_REGISTRATION_DEADLINE"
        );
      }
    }
  }

  next();
};
