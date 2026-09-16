import { successResponse } from "../utils/apiResponse.js";
import {
  getUserSavedEvents,
  saveUserEvent,
  unsaveUserEvent,
} from "../services/registrationService.js";

export const getSavedEvents = async (req, res) => {
  const events = await getUserSavedEvents(req.user._id);
  return successResponse(res, 200, "Saved events retrieved", events);
};

export const saveEvent = async (req, res) => {
  const saved = await saveUserEvent(req.user._id, req.params.id);
  return successResponse(res, 200, "Event saved to favorites", saved);
};

export const unsaveEvent = async (req, res) => {
  await unsaveUserEvent(req.user._id, req.params.id);
  return successResponse(res, 200, "Event removed from favorites");
};
