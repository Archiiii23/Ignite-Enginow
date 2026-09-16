import OrganizerProfile from "../models/OrganizerProfile.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import { generateParticipantsCsv } from "../utils/csvExporter.js";
import mongoose from "mongoose";

/**
 * Submit Organizer Verification Request per Section 15
 */
export const requestOrganizerVerification = async (userId, data = {}) => {
  let profile = await OrganizerProfile.findOne({ user: userId });

  if (!profile) {
    profile = new OrganizerProfile({
      user: userId,
      organizationName: data.organizationName || "My Organization",
      organizationType: data.organizationType || "Tech Club",
      description: data.description || "",
      website: data.website || "",
      contactEmail: data.contactEmail || "",
      contactPhone: data.contactPhone || "",
      documentsSubmitted: data.documentsSubmitted || data.documentsNote || "Verification Documents Attached",
      verificationStatus: "PENDING",
      submittedAt: new Date(),
    });
  } else {
    profile.organizationName = data.organizationName || profile.organizationName;
    profile.organizationType = data.organizationType || profile.organizationType;
    profile.description = data.description || profile.description;
    profile.website = data.website || profile.website;
    profile.contactEmail = data.contactEmail || profile.contactEmail;
    profile.contactPhone = data.contactPhone || profile.contactPhone;
    profile.documentsSubmitted = data.documentsSubmitted || data.documentsNote || profile.documentsSubmitted;
    profile.verificationStatus = "PENDING";
    profile.submittedAt = new Date();
    profile.rejectionReason = undefined;
  }

  await profile.save();
  return profile;
};

export const getOrganizerProfile = async (userId) => {
  return OrganizerProfile.findOne({ user: userId });
};

export const updateOrganizerProfile = async (userId, updates) => {
  // Prevent tampering with status via normal update
  delete updates.verificationStatus;
  delete updates.reviewedBy;
  delete updates.reviewedAt;

  return OrganizerProfile.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
};

export const getOrganizerEvents = async (userId) => {
  return Event.find({ organizer: userId }).sort({ createdAt: -1 });
};

/**
 * Organizer Participant List with ownership protection per Section 32 & 59
 */
export const getEventRegistrations = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw { statusCode: 404, message: "Event not found." };

  if (event.organizer.toString() !== userId.toString()) {
    throw { statusCode: 403, message: "Forbidden. You can only view participants for your own events." };
  }

  return Registration.find({ event: eventId, status: { $ne: "CANCELLED" } })
    .populate("user", "name email college phone headline avatar")
    .sort({ registeredAt: -1 });
};

/**
 * Organizer Participant CSV Export per Section 33
 */
export const exportEventRegistrationsCsv = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw { statusCode: 404, message: "Event not found." };

  if (event.organizer.toString() !== userId.toString()) {
    throw { statusCode: 403, message: "Forbidden. You can only export participants for your own events." };
  }

  const registrations = await Registration.find({ event: eventId, status: { $ne: "CANCELLED" } })
    .populate("user", "name email college phone")
    .lean();

  return generateParticipantsCsv(registrations);
};

/**
 * Organizer Analytics per Section 43 (Real DB calculation, no hardcoded values)
 */
export const getOrganizerAnalytics = async (userId) => {
  const myEvents = await Event.find({ organizer: userId });
  const eventIds = myEvents.map((e) => e._id);

  const totalRegistrations = await Registration.countDocuments({
    event: { $in: eventIds },
    status: { $ne: "CANCELLED" },
  });

  const views = myEvents.reduce((acc, e) => acc + (e.viewsCount || 0), 0);
  const eventClicks = myEvents.reduce((acc, e) => acc + (e.clicksCount || 0), 0);
  const conversionRate = views > 0 ? ((totalRegistrations / views) * 100).toFixed(1) : "0.0";

  // Top events by registrations
  const topEvents = myEvents
    .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
    .slice(0, 5)
    .map((e) => ({
      id: e._id.toString(),
      title: e.title,
      category: e.category,
      registered: e.registeredCount,
      capacity: e.capacity,
      views: e.viewsCount,
      status: e.status,
    }));

  return {
    totalEvents: myEvents.length,
    totalRegistrations,
    views,
    eventClicks,
    conversionRate: Number(conversionRate),
    topEvents,
  };
};
