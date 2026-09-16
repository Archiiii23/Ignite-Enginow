import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getUserById, updateUserProfile } from "../services/authService.js";

/**
 * Get current user profile per Section 28 & 58
 */
export const getCurrentUser = async (req, res) => {
  const profile = await getUserById(req.user._id);
  if (!profile) {
    return errorResponse(res, 404, "User not found.", "NOT_FOUND");
  }
  return successResponse(res, 200, "User profile retrieved", profile);
};

/**
 * Update current user profile per Section 58 & 69
 */
export const updateCurrentUser = async (req, res) => {
  const updated = await updateUserProfile(req.user._id, req.body);
  if (!updated) {
    return errorResponse(res, 404, "User not found.", "NOT_FOUND");
  }
  return successResponse(res, 200, "Profile updated successfully", updated);
};
