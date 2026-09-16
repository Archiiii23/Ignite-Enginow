import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import AuditLog from "../models/AuditLog.js";
import { createNotification } from "../services/notificationService.js";
import { getAdminPlatformAnalytics } from "../services/analyticsService.js";

/**
 * List all users with pagination & search per Section 37 & 70
 */
export const getAdminUsers = async (req, res) => {
  const { search = "", role, status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.accountStatus = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { college: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return paginatedResponse(res, 200, users, { page: pageNum, limit: limitNum, total });
};

/**
 * Suspend/Unsuspend user per Section 37
 */
export const toggleUserSuspension = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 404, "User not found", "NOT_FOUND");
  }

  const newStatus = user.accountStatus === "active" ? "suspended" : "active";
  user.accountStatus = newStatus;
  await user.save();

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: newStatus === "suspended" ? "USER_SUSPENSION" : "USER_ACTIVATION",
    entityType: "User",
    entityId: user._id,
    metadata: { newStatus },
  });

  return successResponse(res, 200, `User account status set to ${newStatus}`, user.toSafeObject());
};

/**
 * List all organizers (queue) per Section 15 & 36
 */
export const getAdminOrganizers = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.verificationStatus = status;

  const organizers = await OrganizerProfile.find(filter)
    .populate("user", "name email profileImage headline college")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Organizers retrieved", organizers);
};

/**
 * Approve organizer per Section 15 & 16
 */
export const approveOrganizer = async (req, res) => {
  const profile = await OrganizerProfile.findById(req.params.id);
  if (!profile) {
    return errorResponse(res, 404, "Organizer profile not found", "NOT_FOUND");
  }

  profile.verificationStatus = "APPROVED";
  profile.reviewedAt = new Date();
  profile.reviewedBy = req.user._id;
  profile.rejectionReason = undefined;
  await profile.save();

  // Create notification for organizer per Section 35
  await createNotification({
    recipient: profile.user,
    type: "ORGANIZER_APPROVED",
    title: "Organizer Verification Approved! 🎉",
    message: `Your organizer account for "${profile.organizationName}" has been approved. You can now publish events!`,
    relatedEntity: profile._id,
    relatedEntityType: "OrganizerProfile",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ORGANIZER_APPROVAL",
    entityType: "OrganizerProfile",
    entityId: profile._id,
    metadata: { orgName: profile.organizationName },
  });

  return successResponse(res, 200, "Organizer approved successfully", profile);
};

/**
 * Reject organizer per Section 15 & 16
 */
export const rejectOrganizer = async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason || !rejectionReason.trim()) {
    return errorResponse(res, 400, "Rejection reason is required.", "REJECTION_REASON_REQUIRED");
  }

  const profile = await OrganizerProfile.findById(req.params.id);
  if (!profile) {
    return errorResponse(res, 404, "Organizer profile not found", "NOT_FOUND");
  }

  profile.verificationStatus = "REJECTED";
  profile.rejectionReason = rejectionReason.trim();
  profile.reviewedAt = new Date();
  profile.reviewedBy = req.user._id;
  await profile.save();

  await createNotification({
    recipient: profile.user,
    type: "ORGANIZER_REJECTED",
    title: "Organizer Verification Rejected",
    message: `Your organizer request for "${profile.organizationName}" was rejected: ${rejectionReason}`,
    relatedEntity: profile._id,
    relatedEntityType: "OrganizerProfile",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ORGANIZER_REJECTION",
    entityType: "OrganizerProfile",
    entityId: profile._id,
    metadata: { orgName: profile.organizationName, reason: rejectionReason },
  });

  return successResponse(res, 200, "Organizer rejected successfully", profile);
};

/**
 * Suspend organizer per Section 16 & 36
 */
export const suspendOrganizer = async (req, res) => {
  const { reason = "Administrative suspension" } = req.body;
  const profile = await OrganizerProfile.findById(req.params.id);
  if (!profile) {
    return errorResponse(res, 404, "Organizer profile not found", "NOT_FOUND");
  }

  profile.verificationStatus = "SUSPENDED";
  profile.suspensionReason = reason;
  await profile.save();

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ORGANIZER_SUSPENSION",
    entityType: "OrganizerProfile",
    entityId: profile._id,
    metadata: { orgName: profile.organizationName, reason },
  });

  return successResponse(res, 200, "Organizer suspended successfully", profile);
};

/**
 * List all events (Admin view)
 */
export const getAdminEvents = async (req, res) => {
  const events = await Event.find()
    .populate("organizer", "name email")
    .sort({ createdAt: -1 });
  return successResponse(res, 200, "All events retrieved", events);
};

/**
 * List pending events for review per Section 20
 */
export const getPendingEvents = async (req, res) => {
  const events = await Event.find({ status: "PENDING_REVIEW" })
    .populate("organizer", "name email")
    .sort({ createdAt: -1 });
  return successResponse(res, 200, "Pending events retrieved", events);
};

/**
 * Approve event per Section 20
 */
export const approveEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "NOT_FOUND");
  }

  event.status = "APPROVED";
  event.approvedBy = req.user._id;
  event.approvedAt = new Date();
  event.publishedAt = new Date();
  event.rejectionReason = undefined;
  await event.save();

  // Notify organizer per Section 20 & 35
  await createNotification({
    recipient: event.organizer,
    type: "EVENT_PUBLISHED",
    title: "Event Approved & Published! 🚀",
    message: `Your event "${event.title}" is now live and open for student registrations!`,
    relatedEntity: event._id,
    relatedEntityType: "Event",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "EVENT_APPROVAL",
    entityType: "Event",
    entityId: event._id,
    metadata: { title: event.title },
  });

  return successResponse(res, 200, "Event approved and published successfully", event);
};

/**
 * Reject event per Section 20
 */
export const rejectEvent = async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason || !rejectionReason.trim()) {
    return errorResponse(res, 400, "Rejection reason is required.", "REJECTION_REASON_REQUIRED");
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "NOT_FOUND");
  }

  event.status = "REJECTED";
  event.rejectionReason = rejectionReason.trim();
  await event.save();

  // Notify organizer per Section 20 & 35
  await createNotification({
    recipient: event.organizer,
    type: "EVENT_REJECTED",
    title: "Event Review: Revisions Requested",
    message: `Your event "${event.title}" was not approved: ${rejectionReason}`,
    relatedEntity: event._id,
    relatedEntityType: "Event",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "EVENT_REJECTION",
    entityType: "Event",
    entityId: event._id,
    metadata: { title: event.title, reason: rejectionReason },
  });

  return successResponse(res, 200, "Event rejected with feedback", event);
};

/**
 * Remove inappropriate event per Section 36
 */
export const removeEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "NOT_FOUND");
  }

  event.status = "REMOVED";
  await event.save();

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "EVENT_REMOVAL",
    entityType: "Event",
    entityId: event._id,
    metadata: { title: event.title },
  });

  return successResponse(res, 200, "Event removed from platform listings", event);
};

/**
 * Toggle featured event status per Section 39 & 68
 */
export const toggleFeaturedEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return errorResponse(res, 404, "Event not found", "NOT_FOUND");
  }

  event.isFeatured = !event.isFeatured;
  await event.save();

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "EVENT_FEATURE_TOGGLE",
    entityType: "Event",
    entityId: event._id,
    metadata: { title: event.title, isFeatured: event.isFeatured },
  });

  return successResponse(
    res,
    200,
    `Event featured status set to ${event.isFeatured}`,
    event
  );
};

/**
 * List all registrations across the platform
 */
export const getAdminRegistrations = async (req, res) => {
  const registrations = await Registration.find()
    .populate("user", "name email college")
    .populate("event", "title category eventDate")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "All registrations retrieved", registrations);
};

/**
 * Get platform analytics per Section 44
 */
export const getAdminAnalytics = async (req, res) => {
  const analytics = await getAdminPlatformAnalytics();
  return successResponse(res, 200, "Platform analytics calculated", analytics);
};

/**
 * Get all pending role change requests
 */
export const getAdminRoleRequests = async (req, res) => {
  const users = await User.find({ "roleChangeRequest.status": "PENDING" })
    .select("name email role isRoleSelected roleChangeRequest createdAt")
    .sort({ "roleChangeRequest.requestedAt": -1 });

  return successResponse(res, 200, "Pending role change requests retrieved", users);
};

/**
 * Approve role change request
 */
export const approveRoleRequest = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return errorResponse(res, 404, "User not found", "USER_NOT_FOUND");
  }

  if (user.roleChangeRequest?.status !== "PENDING") {
    return errorResponse(res, 400, "No pending role change request for this user", "NO_PENDING_REQUEST");
  }

  const previousRole = user.role;
  const newRole = user.roleChangeRequest.requestedRole;

  user.role = newRole;
  user.roleChangeRequest.status = "APPROVED";
  user.roleChangeRequest.reviewedAt = new Date();
  user.roleChangeRequest.reviewedBy = req.user._id;
  await user.save();

  if (newRole === "organizer") {
    let orgProfile = await OrganizerProfile.findOne({ user: user._id });
    if (!orgProfile) {
      await OrganizerProfile.create({
        user: user._id,
        organizationName: user.name + " Organization",
        organizationType: "Independent Organizer",
        contactEmail: user.email,
        verificationStatus: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      });
    } else {
      orgProfile.verificationStatus = "APPROVED";
      await orgProfile.save();
    }
  }

  await createNotification({
    recipient: user._id,
    type: "ROLE_CHANGE_APPROVED",
    title: "Role Change Request Approved! 🎉",
    message: `Your request to change your role to ${newRole === "student" ? "Participant" : "Organizer"} has been approved by an administrator.`,
    relatedEntity: user._id,
    relatedEntityType: "User",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ADMIN_ROLE_CHANGE_APPROVED",
    entityType: "User",
    entityId: user._id,
    metadata: { previousRole, newRole, approvedBy: req.user.email },
  });

  return successResponse(res, 200, `Role change approved. User is now ${newRole}.`, user.toSafeObject());
};

/**
 * Reject role change request
 */
export const rejectRoleRequest = async (req, res) => {
  const { reason = "Request denied by administrator" } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return errorResponse(res, 404, "User not found", "USER_NOT_FOUND");
  }

  if (user.roleChangeRequest?.status !== "PENDING") {
    return errorResponse(res, 400, "No pending role change request for this user", "NO_PENDING_REQUEST");
  }

  user.roleChangeRequest.status = "REJECTED";
  user.roleChangeRequest.rejectionReason = reason;
  user.roleChangeRequest.reviewedAt = new Date();
  user.roleChangeRequest.reviewedBy = req.user._id;
  await user.save();

  await createNotification({
    recipient: user._id,
    type: "ROLE_CHANGE_REJECTED",
    title: "Role Change Request Update",
    message: `Your role change request was not approved: ${reason}`,
    relatedEntity: user._id,
    relatedEntityType: "User",
  });

  await AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: "ADMIN_ROLE_CHANGE_REJECTED",
    entityType: "User",
    entityId: user._id,
    metadata: { requestedRole: user.roleChangeRequest.requestedRole, reason },
  });

  return successResponse(res, 200, "Role change request rejected.", user.toSafeObject());
};
