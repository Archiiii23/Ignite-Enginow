import mongoose from "mongoose";

const organizerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    organizationType: {
      type: String,
      trim: true,
      default: "Community / Tech Club",
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    },
    website: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    documentsSubmitted: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ["NOT_REQUESTED", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "NOT_REQUESTED",
      index: true,
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    suspensionReason: {
      type: String,
      trim: true,
    },
    eventsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const OrganizerProfile = mongoose.model("OrganizerProfile", organizerProfileSchema);
export default OrganizerProfile;
