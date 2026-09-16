import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  return successResponse(res, 200, "Notifications retrieved", notifications);
};

export const markAsRead = async (req, res) => {
  const notification = await markNotificationAsRead(req.params.id, req.user._id);
  if (!notification) {
    return errorResponse(res, 404, "Notification not found", "NOT_FOUND");
  }
  return successResponse(res, 200, "Notification marked as read", notification);
};

export const markAllAsRead = async (req, res) => {
  await markAllNotificationsAsRead(req.user._id);
  return successResponse(res, 200, "All notifications marked as read");
};
