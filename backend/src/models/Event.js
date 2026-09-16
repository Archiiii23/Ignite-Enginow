import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "An exciting technical experience.",
    },
    description: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
      index: true,
    },
    eventType: {
      type: String,
      trim: true,
      default: "Technical",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizerName: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },
    dateLabel: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    durationLabel: {
      type: String,
      trim: true,
      default: "24 hours",
    },
    registrationDeadline: {
      type: Date,
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    college: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["Online", "In-person", "Hybrid"],
      default: "Online",
      index: true,
    },
    registrationFee: {
      type: String,
      default: "Free",
    },
    price: {
      type: String,
      default: "Free",
    },
    prize: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      default: 100,
    },
    seats: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    timeline: [
      {
        time: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    agenda: [
      {
        time: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    perks: {
      type: [String],
      default: ["Verified Certificate", "Community Access", "Networking"],
    },
    speakers: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        avatar: { type: String, trim: true },
      },
    ],
    sponsors: [
      {
        name: { type: String, trim: true },
        logoText: { type: String, trim: true },
      },
    ],
    faqs: [
      {
        q: { type: String, trim: true },
        a: { type: String, trim: true },
      },
    ],
    contactDetails: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_REVIEW",
        "APPROVED",
        "REJECTED",
        "REGISTRATION_CLOSED",
        "COMPLETED",
        "REMOVED",
      ],
      default: "DRAFT",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    registrationsOpen: {
      type: Boolean,
      default: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    clicksCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.seats = ret.capacity;
        ret.registered = ret.registeredCount;
        ret.cover = ret.coverImage;
        // Map backend lifecycle to frontend compatibility fields
        ret.approvalStatus =
          ret.status === "APPROVED"
            ? "published"
            : ret.status === "PENDING_REVIEW"
            ? "pending_approval"
            : ret.status === "REJECTED"
            ? "rejected"
            : "draft";
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for powerful search
eventSchema.index({ title: "text", description: "text", tags: "text", organizerName: "text" });

const Event = mongoose.model("Event", eventSchema);
export default Event;
