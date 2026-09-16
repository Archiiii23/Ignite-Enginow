import Notification from "../models/Notification.js";
import { logger } from "../utils/logger.js";

/**
 * Creates a notification in the database per Section 34 & 35
 */
export const createNotification = async ({
  recipient,
  type = "SYSTEM",
  title,
  message,
  relatedEntity = null,
  relatedEntityType = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedEntity,
      relatedEntityType,
      read: false,
    });
    return notification;
  } catch (err) {
    logger.error("Failed to create notification:", err);
    return null;
  }
};

export const getUserNotifications = async (userId, limit = 50) => {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  return Notification.updateMany({ recipient: userId, read: false }, { read: true });
};
