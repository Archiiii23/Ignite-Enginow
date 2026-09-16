import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import SavedEvent from "../models/SavedEvent.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import mongoose from "mongoose";

/**
 * Public Events Query per Section 21 & 22
 * Strictly returns only APPROVED events to public queries
 */
export const queryPublicEvents = async ({
  search = "",
  mode,
  isFree,
  city,
  college,
  category,
  date,
  sortBy = "upcoming",
  page = 1,
  limit = 12,
  includeAll = false, // internal override only for admin
}) => {
  const filter = {};

  if (!includeAll) {
    filter.status = "APPROVED";
  }

  if (category) {
    filter.category = new RegExp(`^${category}$`, "i");
  }

  if (mode) {
    filter.mode = new RegExp(`^${mode}$`, "i");
  }

  if (city) {
    filter.city = new RegExp(city, "i");
  }

  if (college) {
    filter.college = new RegExp(college, "i");
  }

  if (isFree !== undefined && isFree !== null && isFree !== "") {
    if (isFree === "true" || isFree === true) {
      filter.$or = [{ registrationFee: /^free$/i }, { price: /^free$/i }];
    } else if (isFree === "false" || isFree === false) {
      filter.$and = [
        { registrationFee: { $not: /^free$/i } },
        { price: { $not: /^free$/i } },
      ];
    }
  }

  if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.eventDate = { $gte: startOfDay, $lte: endOfDay };
    }
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: "i" } },
      { organizerName: { $regex: s, $options: "i" } },
      { category: { $regex: s, $options: "i" } },
      { tags: { $in: [new RegExp(s, "i")] } },
      { location: { $regex: s, $options: "i" } },
    ];
  }

  // Sorting
  let sortOption = { eventDate: 1 }; // default upcoming
  if (sortBy === "latest") {
    sortOption = { createdAt: -1 };
  } else if (sortBy === "popular") {
    sortOption = { registeredCount: -1, viewsCount: -1 };
  } else if (sortBy === "registration closing soon") {
    sortOption = { registrationDeadline: 1 };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Event.countDocuments(filter),
  ]);

  // Shape response for UI compatibility
  const formattedEvents = events.map((ev) => ({
    ...ev,
    id: ev._id.toString(),
    seats: ev.capacity,
    registered: ev.registeredCount,
    cover: ev.coverImage,
    approvalStatus:
      ev.status === "APPROVED"
        ? "published"
        : ev.status === "PENDING_REVIEW"
        ? "pending_approval"
        : ev.status === "REJECTED"
        ? "rejected"
        : "draft",
  }));

  return {
    events: formattedEvents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get Event Details with contextual student registration state per Section 23
 */
export const getEventDetails = async (idOrSlug, currentUserId = null) => {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
  } else {
    query = { slug: idOrSlug };
  }

  const event = await Event.findOne(query).lean();
  if (!event) return null;

  let isRegistered = false;
  let registrationStatus = null;
  let isSaved = false;

  if (currentUserId) {
    const reg = await Registration.findOne({
      user: currentUserId,
      event: event._id,
      status: { $ne: "CANCELLED" },
    });
    if (reg) {
      isRegistered = true;
      registrationStatus = reg.status;
    }

    const saved = await SavedEvent.findOne({
      user: currentUserId,
      event: event._id,
    });
    if (saved) {
      isSaved = true;
    }
  }

  return {
    ...event,
    id: event._id.toString(),
    seats: event.capacity,
    registered: event.registeredCount,
    cover: event.coverImage,
    approvalStatus:
      event.status === "APPROVED"
        ? "published"
        : event.status === "PENDING_REVIEW"
        ? "pending_approval"
        : event.status === "REJECTED"
        ? "rejected"
        : "draft",
    isRegistered,
    registrationStatus,
    isSaved,
  };
};

/**
 * Create a new event draft (Organizer) per Section 18
 */
export const createEventDraft = async (userId, eventData) => {
  const userOrg = await OrganizerProfile.findOne({ user: userId });
  const organizerName = userOrg?.organizationName || "Community Organizer";

  const rawTitle = eventData.title || "Untitled Event";
  let slugBase = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  if (!slugBase) slugBase = `event-${Date.now()}`;

  // Ensure unique slug
  let slug = slugBase;
  let counter = 1;
  while (await Event.exists({ slug })) {
    slug = `${slugBase}-${counter++}`;
  }

  const event = await Event.create({
    ...eventData,
    slug,
    organizer: userId,
    organizerName,
    capacity: eventData.seats || eventData.capacity || 100,
    seats: eventData.seats || eventData.capacity || 100,
    coverImage: eventData.cover || eventData.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    status: "DRAFT", // Must start as DRAFT per Section 18
  });

  return event;
};

/**
 * Update event (Ownership restricted to author, and only if DRAFT or REJECTED)
 */
export const updateOrganizerEvent = async (eventId, userId, updates) => {
  const event = await Event.findById(eventId);
  if (!event) return null;

  if (event.organizer.toString() !== userId.toString()) {
    throw { statusCode: 403, message: "You are not authorized to modify another organizer's event." };
  }

  if (event.status !== "DRAFT" && event.status !== "REJECTED") {
    throw { statusCode: 400, message: `Cannot modify event in ${event.status} status directly.` };
  }

  // Prevent organizer from arbitrarily making event public per Section 60
  delete updates.status;
  delete updates.approvedBy;
  delete updates.approvedAt;
  delete updates.publishedAt;
  delete updates.registeredCount;

  Object.assign(event, updates);
  if (updates.seats) event.capacity = updates.seats;
  if (updates.cover) event.coverImage = updates.cover;

  await event.save();
  return event;
};

/**
 * Submit event for admin review per Section 18 & 61
 */
export const submitEventForReview = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) return null;

  if (event.organizer.toString() !== userId.toString()) {
    throw { statusCode: 403, message: "Forbidden. Not your event." };
  }

  // Verify that organizer is APPROVED per Section 18, 19, 61
  const profile = await OrganizerProfile.findOne({ user: userId });
  if (!profile || profile.verificationStatus !== "APPROVED") {
    throw {
      statusCode: 403,
      message: "Only verified & approved organizers can submit events for review.",
    };
  }

  if (event.status !== "DRAFT" && event.status !== "REJECTED") {
    throw {
      statusCode: 400,
      message: `Event cannot be submitted from status ${event.status}`,
    };
  }

  event.status = "PENDING_REVIEW";
  event.rejectionReason = undefined;
  await event.save();

  return event;
};

/**
 * Record view per Section 45
 */
export const recordEventView = async (eventId) => {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(eventId)) {
    query = { $or: [{ _id: eventId }, { slug: eventId }] };
  } else {
    query = { slug: eventId };
  }
  return Event.findOneAndUpdate(query, { $inc: { viewsCount: 1 } }, { new: true });
};
