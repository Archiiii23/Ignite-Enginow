import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import SavedEvent from "../models/SavedEvent.js";
import { createNotification } from "./notificationService.js";
import mongoose from "mongoose";

/**
 * Register student for an approved event per Section 25, 26, 27
 */
export const registerStudentForEvent = async (user, eventId, studentInfo = {}) => {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(eventId)) {
    query = { $or: [{ _id: eventId }, { slug: eventId }] };
  } else {
    query = { slug: eventId };
  }

  const event = await Event.findOne(query);
  if (!event) {
    throw { statusCode: 404, message: "Event not found.", code: "EVENT_NOT_FOUND" };
  }

  // Check event is APPROVED per Section 25
  if (event.status !== "APPROVED") {
    throw {
      statusCode: 400,
      message: `Registration is not available for events in status: ${event.status}`,
      code: "EVENT_NOT_APPROVED",
    };
  }

  // Check registrations are open
  if (!event.registrationsOpen) {
    throw {
      statusCode: 400,
      message: "Registrations for this event have been closed by the organizer.",
      code: "REGISTRATIONS_CLOSED",
    };
  }

  // Check registration deadline per Section 25 & 53
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    throw {
      statusCode: 400,
      message: "Registration deadline has already passed.",
      code: "DEADLINE_PASSED",
    };
  }

  // Check if duplicate registration exists per Section 26
  const existingReg = await Registration.findOne({
    user: user._id,
    event: event._id,
    status: { $ne: "CANCELLED" },
  });

  if (existingReg) {
    throw {
      statusCode: 409,
      message: "You are already registered for this event.",
      code: "DUPLICATE_REGISTRATION",
    };
  }

  // Atomic Capacity Check & Increment per Section 27 & 72
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: event._id,
      registeredCount: { $lt: event.capacity },
    },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );

  if (!updatedEvent) {
    throw {
      statusCode: 400,
      message: "This event is currently sold out. No capacity left.",
      code: "CAPACITY_FULL",
    };
  }

  // Generate Unique Ticket Code and Seat Number
  const catCode = (event.category || "IGN").slice(0, 3).toUpperCase();
  const randDigits = Math.floor(1000 + Math.random() * 9000);
  const ticketCode = `IGN-${catCode}-${randDigits}-${Date.now().toString().slice(-4)}`;
  const seatNumber = `${catCode}-${Math.floor(10 + Math.random() * 90)}`;

  const registration = await Registration.create({
    user: user._id,
    event: event._id,
    status: "REGISTERED",
    ticketCode,
    seatNumber,
    userName: studentInfo.name || user.name,
    userEmail: studentInfo.email || user.email,
    college: studentInfo.college || user.college || "Global Tech University",
    phone: studentInfo.phone || "",
    eventTitle: event.title,
    eventDate: event.dateLabel || event.eventDate?.toLocaleDateString(),
    eventLocation: event.location,
    registeredAt: new Date(),
  });

  // Create registration success notification per Section 35
  await createNotification({
    recipient: user._id,
    type: "REGISTRATION_SUCCESS",
    title: "Registration Confirmed! 🎉",
    message: `You are officially registered for "${event.title}". Ticket: ${ticketCode}`,
    relatedEntity: event._id,
    relatedEntityType: "Event",
  });

  return registration;
};

/**
 * Cancel Registration per Section 30
 */
export const cancelStudentRegistration = async (user, registrationId) => {
  const reg = await Registration.findOne({ _id: registrationId, user: user._id });
  if (!reg) {
    throw { statusCode: 404, message: "Registration not found.", code: "NOT_FOUND" };
  }

  if (reg.status === "CANCELLED") {
    return reg;
  }

  reg.status = "CANCELLED";
  reg.cancelledAt = new Date();
  await reg.save();

  // Atomically decrement event registered count
  await Event.findByIdAndUpdate(reg.event, {
    $inc: { registeredCount: -1 },
  });

  // Create notification
  await createNotification({
    recipient: user._id,
    type: "SYSTEM",
    title: "Registration Cancelled",
    message: `Your registration for "${reg.eventTitle}" has been cancelled.`,
    relatedEntity: reg.event,
    relatedEntityType: "Event",
  });

  return reg;
};

/**
 * Get current user registrations
 */
export const getUserRegistrations = async (userId) => {
  return Registration.find({ user: userId })
    .sort({ registeredAt: -1 })
    .populate("event", "title coverImage category dateLabel location eventDate slug status");
};

/**
 * Save / Favorite Event per Section 29
 */
export const saveUserEvent = async (userId, eventId) => {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(eventId)) {
    query = { $or: [{ _id: eventId }, { slug: eventId }] };
  } else {
    query = { slug: eventId };
  }

  const event = await Event.findOne(query);
  if (!event) throw { statusCode: 404, message: "Event not found." };

  try {
    const saved = await SavedEvent.findOneAndUpdate(
      { user: userId, event: event._id },
      { user: userId, event: event._id },
      { upsert: true, new: true }
    );
    return saved;
  } catch (err) {
    if (err.code === 11000) {
      return { user: userId, event: event._id };
    }
    throw err;
  }
};

/**
 * Unsave Event per Section 29
 */
export const unsaveUserEvent = async (userId, eventId) => {
  let query = {};
  if (mongoose.Types.ObjectId.isValid(eventId)) {
    query = { $or: [{ _id: eventId }, { slug: eventId }] };
  } else {
    query = { slug: eventId };
  }

  const event = await Event.findOne(query);
  if (!event) return null;

  return SavedEvent.findOneAndDelete({ user: userId, event: event._id });
};

/**
 * Get Saved Events for user
 */
export const getUserSavedEvents = async (userId) => {
  const saved = await SavedEvent.find({ user: userId }).populate("event");
  return saved.map((s) => s.event).filter(Boolean);
};
