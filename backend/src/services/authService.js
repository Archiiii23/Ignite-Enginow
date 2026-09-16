import User from "../models/User.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import { logger } from "../utils/logger.js";

const DEMO_PERSONAS = {
  student: {
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    role: "student",
    headline: "CS & AI Undergraduate · Hackathon Enthusiast",
    college: "Indian Institute of Technology (IIT)",
    bio: "Passionate about machine learning, distributed systems, and competitive coding.",
    skills: ["Python", "PyTorch", "React", "TypeScript", "FastAPI"],
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  organizer: {
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    role: "organizer",
    headline: "Global Technical Community & Hackathon Organizers",
    college: "DevSphere Labs",
    bio: "Empowering 50,000+ engineers worldwide through open hackathons.",
    profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  },
  admin: {
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    role: "admin",
    headline: "Platform Operations & Governance Lead",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
};

export const demoLoginUser = async (role = "student") => {
  const seed = DEMO_PERSONAS[role] || DEMO_PERSONAS.student;

  let user = await User.findOne({ email: seed.email });
  if (!user) {
    user = await User.create({
      ...seed,
      accountStatus: "active",
      lastLoginAt: new Date(),
    });
  } else {
    user.lastLoginAt = new Date();
    await user.save();
  }

  // If organizer, ensure OrganizerProfile exists
  let organizerProfile = null;
  if (role === "organizer") {
    organizerProfile = await OrganizerProfile.findOne({ user: user._id });
    if (!organizerProfile) {
      organizerProfile = await OrganizerProfile.create({
        user: user._id,
        organizationName: "DevSphere Foundation",
        organizationType: "Global Community",
        website: "https://devsphere.org",
        contactEmail: "events@devsphere.org",
        verificationStatus: "APPROVED",
        submittedAt: new Date(),
        reviewedAt: new Date(),
      });
    }
  }

  return { user, organizerProfile };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  let organizerProfile = null;
  if (user.role === "organizer") {
    organizerProfile = await OrganizerProfile.findOne({ user: user._id });
  }

  const safeUser = user.toSafeObject();
  if (organizerProfile) {
    safeUser.orgName = organizerProfile.organizationName;
    safeUser.orgWebsite = organizerProfile.website;
    safeUser.orgBio = organizerProfile.description;
    safeUser.verificationStatus = organizerProfile.verificationStatus;
  }

  return safeUser;
};

export const updateUserProfile = async (userId, updates) => {
  // Disallow changing critical security fields arbitrarily per Section 9 & 10
  delete updates.role;
  delete updates.accountStatus;
  delete updates.googleId;
  delete updates.email;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return user ? user.toSafeObject() : null;
};
