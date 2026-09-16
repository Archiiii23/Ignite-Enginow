import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["REGISTERED", "CANCELLED", "ATTENDED"],
      default: "REGISTERED",
      index: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    college: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    eventTitle: {
      type: String,
      trim: true,
    },
    eventDate: {
      type: String,
      trim: true,
    },
    eventLocation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.user?.toString();
        ret.eventId = ret.event?.toString();
        ret.status = ret.status === "REGISTERED" ? "confirmed" : ret.status.toLowerCase();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique compound index preventing duplicate registrations per Section 26
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
