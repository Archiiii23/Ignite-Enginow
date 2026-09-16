import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      default: "student",
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    headline: {
      type: String,
      trim: true,
    },
    college: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
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

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    profileImage: this.profileImage,
    role: this.role,
    accountStatus: this.accountStatus,
    headline: this.headline,
    college: this.college,
    bio: this.bio,
    skills: this.skills,
    github: this.github,
    linkedin: this.linkedin,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);
export default User;
