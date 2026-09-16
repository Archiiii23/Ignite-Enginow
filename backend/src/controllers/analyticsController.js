import { successResponse } from "../utils/apiResponse.js";
import { getAdminPlatformAnalytics } from "../services/analyticsService.js";
import { getOrganizerAnalytics } from "../services/organizerService.js";

export const getAdminAnalytics = async (req, res) => {
  const analytics = await getAdminPlatformAnalytics();
  return successResponse(res, 200, "Platform analytics", analytics);
};

export const getOrganizerAnalyticsController = async (req, res) => {
  const analytics = await getOrganizerAnalytics(req.user._id);
  return successResponse(res, 200, "Organizer analytics", analytics);
};
