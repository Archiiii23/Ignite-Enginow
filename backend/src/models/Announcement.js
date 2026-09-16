import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info",
    },
    audience: {
      type: String,
      enum: ["all", "students", "organizers"],
      default: "all",
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.message = ret.message || ret.content;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
