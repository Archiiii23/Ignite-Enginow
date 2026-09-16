import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "REGISTRATION_SUCCESS",
        "APPROVAL_STATUS",
        "EVENT_PUBLISHED",
        "EVENT_REJECTED",
        "REGISTRATION_CLOSING",
        "EVENT_REMINDER",
        "ORGANIZER_APPROVED",
        "ORGANIZER_REJECTED",
        "SYSTEM",
      ],
      default: "SYSTEM",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedEntityType: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.recipient?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Fast lookups for unread notifications per user
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
