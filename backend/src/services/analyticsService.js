import User from "../models/User.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

/**
 * Admin Platform Analytics per Section 44
 * Calculates real platform statistics from MongoDB
 */
export const getAdminPlatformAnalytics = async () => {
  const [
    activeUsers,
    totalStudents,
    totalOrganizers,
    activeOrganizers,
    pendingOrganizers,
    totalEvents,
    publishedEvents,
    pendingEvents,
    totalRegistrations,
  ] = await Promise.all([
    User.countDocuments({ accountStatus: "active" }),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "organizer" }),
    OrganizerProfile.countDocuments({ verificationStatus: "APPROVED" }),
    OrganizerProfile.countDocuments({ verificationStatus: "PENDING" }),
    Event.countDocuments(),
    Event.countDocuments({ status: "APPROVED" }),
    Event.countDocuments({ status: "PENDING_REVIEW" }),
    Registration.countDocuments({ status: { $ne: "CANCELLED" } }),
  ]);

  // Aggregate monthly registration growth for charts
  const registrationTrends = await Registration.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    {
      $group: {
        _id: {
          year: { $year: "$registeredAt" },
          month: { $month: "$registeredAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  // Aggregate category breakdown
  const categoryBreakdown = await Event.aggregate([
    { $match: { status: "APPROVED" } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalAttendees: { $sum: "$registeredCount" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return {
    overview: {
      activeUsers,
      totalStudents,
      totalOrganizers,
      activeOrganizers,
      pendingApprovals: pendingOrganizers + pendingEvents,
      pendingOrganizers,
      pendingEvents,
      totalEvents,
      publishedEvents,
      totalRegistrations,
    },
    trends: registrationTrends.map((t) => ({
      period: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
      registrations: t.count,
    })),
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c._id,
      events: c.count,
      attendees: c.totalAttendees,
    })),
  };
};
