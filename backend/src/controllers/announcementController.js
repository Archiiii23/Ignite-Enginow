import { successResponse, errorResponse } from "../utils/apiResponse.js";
import Announcement from "../models/Announcement.js";
import AuditLog from "../models/AuditLog.js";

/**
 * Public active announcements (/api/announcements)
 */
export const getAnnouncements = async (req, res) => {
  const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 });
  return successResponse(res, 200, "Announcements retrieved", announcements);
};

/**
 * Create announcement (Admin) (/api/admin/announcements)
 */
export const createAnnouncement = async (req, res) => {
  const { title, message, content, type, audience, active } = req.body;
  const ann = await Announcement.create({
    title,
    message: message || content,
    content: content || message,
    type: type || "info",
    audience: audience || "all",
    active: active !== undefined ? active : true,
    createdBy: req.user._id,
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ANNOUNCEMENT_CREATE",
    entityType: "Announcement",
    entityId: ann._id,
    metadata: { title },
  });

  return successResponse(res, 201, "Announcement created successfully", ann);
};

/**
 * Update announcement (Admin) (/api/admin/announcements/:id)
 */
export const updateAnnouncement = async (req, res) => {
  const ann = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!ann) {
    return errorResponse(res, 404, "Announcement not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ANNOUNCEMENT_UPDATE",
    entityType: "Announcement",
    entityId: ann._id,
    metadata: req.body,
  });

  return successResponse(res, 200, "Announcement updated successfully", ann);
};

/**
 * Delete announcement (Admin) (/api/admin/announcements/:id)
 */
export const deleteAnnouncement = async (req, res) => {
  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) {
    return errorResponse(res, 404, "Announcement not found", "NOT_FOUND");
  }

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ANNOUNCEMENT_DELETE",
    entityType: "Announcement",
    entityId: ann._id,
    metadata: { title: ann.title },
  });

  return successResponse(res, 200, "Announcement deleted successfully");
};
