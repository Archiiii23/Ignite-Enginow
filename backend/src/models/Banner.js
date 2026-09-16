import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      trim: true,
    },
    ctaLink: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
