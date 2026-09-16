import mongoose from "mongoose";

const savedEventSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.user?.toString();
        ret.eventId = ret.event?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index to prevent duplicate saves per Section 29
savedEventSchema.index({ user: 1, event: 1 }, { unique: true });

const SavedEvent = mongoose.model("SavedEvent", savedEventSchema);
export default SavedEvent;
