import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB, closeDB } from "../config/db.js";
import User from "../models/User.js";
import OrganizerProfile from "../models/OrganizerProfile.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Category from "../models/Category.js";
import Announcement from "../models/Announcement.js";
import Banner from "../models/Banner.js";
import { logger } from "../utils/logger.js";

export const seedData = async (standalone = true) => {
  logger.info("==========================================");
  logger.info("Starting Ignite Enginow Database Seed...");
  logger.info("==========================================");

  if (standalone) {
    await connectDB();
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    OrganizerProfile.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Category.deleteMany({}),
    Announcement.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  logger.info("Cleared existing database records.");

  // 1. Seed Categories
  const categories = await Category.insertMany([
    { name: "Hackathon", description: "Multi-day building competitions & prize challenges", active: true, displayOrder: 1 },
    { name: "Workshop", description: "Hands-on practical sessions guided by domain experts", active: true, displayOrder: 2 },
    { name: "Webinar", description: "Interactive live masterclasses and industry panels", active: true, displayOrder: 3 },
    { name: "Bootcamp", description: "Intensive multi-week skill acceleration cohorts", active: true, displayOrder: 4 },
    { name: "Conference", description: "Keynotes, showcases, and networking summits", active: true, displayOrder: 5 },
    { name: "Meetup", description: "Local and regional community gatherings", active: true, displayOrder: 6 },
  ]);
  logger.info(`Seeded ${categories.length} categories.`);

  // 2. Seed Users
  const student = await User.create({
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    role: "student",
    accountStatus: "active",
    headline: "CS & AI Undergraduate · Hackathon Enthusiast",
    college: "Indian Institute of Technology (IIT)",
    bio: "Passionate about machine learning, distributed systems, and competitive coding.",
    skills: ["Python", "PyTorch", "React", "TypeScript", "FastAPI"],
    github: "github.com/aaravsharma",
    linkedin: "linkedin.com/in/aaravsharma",
  });

  const student2 = await User.create({
    name: "Priya Sundaram",
    email: "priya.s@tech.ac.in",
    role: "student",
    accountStatus: "active",
    headline: "Full-Stack Engineer & Open Source Contributor",
    college: "BITS Pilani",
    bio: "Web3 & Cloud architect.",
    skills: ["Go", "Node.js", "Kubernetes", "Next.js"],
  });

  const organizerUser = await User.create({
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    role: "organizer",
    accountStatus: "active",
    headline: "Global Technical Community & Hackathon Organizers",
    college: "DevSphere Labs",
    bio: "Empowering 50,000+ engineers worldwide through open hackathons.",
  });

  const adminUser = await User.create({
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    role: "admin",
    accountStatus: "active",
    headline: "Platform Operations & Governance Lead",
  });

  logger.info("Seeded 4 core persona users.");

  // 3. Seed Organizer Profile (APPROVED)
  const organizerProfile = await OrganizerProfile.create({
    user: organizerUser._id,
    organizationName: "DevSphere Foundation",
    organizationType: "Global Community Foundation",
    description: "Empowering 50,000+ engineers worldwide through open hackathons, bootcamps, and developer workshops.",
    website: "https://devsphere.org",
    contactEmail: "events@devsphere.org",
    contactPhone: "+91 98765 43210",
    verificationStatus: "APPROVED",
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    reviewedBy: adminUser._id,
    eventsCount: 3,
  });

  logger.info("Seeded approved OrganizerProfile.");

  // 4. Seed Events (both Approved/Published and Pending Review)
  const event1 = await Event.create({
    title: "Quantum Hack 2026",
    slug: "quantum-hack-2026",
    tagline: "India's Premier 48-Hour Hybrid Hackathon on Edge AI & Distributed Systems",
    about: "Build the next generation of intelligent decentralized applications with 1,200+ builders worldwide. Mentors from Google, AWS, and NVIDIA.",
    category: "Hackathon",
    mode: "Hybrid",
    location: "Bengaluru + Online",
    city: "Bengaluru",
    college: "IIT Bengaluru",
    eventDate: new Date("2026-10-15T09:00:00Z"),
    dateLabel: "Oct 15 – 17, 2026",
    durationLabel: "48 hours",
    registrationDeadline: new Date("2026-10-12T23:59:59Z"),
    price: "Free",
    registrationFee: "Free",
    prize: "₹5,00,000 Prize Pool",
    capacity: 250,
    seats: 250,
    registeredCount: 42,
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    status: "APPROVED",
    organizer: organizerUser._id,
    organizerName: "DevSphere Foundation",
    approvedBy: adminUser._id,
    approvedAt: new Date(),
    publishedAt: new Date(),
    isFeatured: true,
    registrationsOpen: true,
    tags: ["AI", "Hackathon", "Web3", "Distributed Systems"],
    speakers: [
      { name: "Dr. Elena Rostova", role: "AI Research Director, QuantumFlow", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
      { name: "Marcus Thorne", role: "VP Engineering, Distributed Scale", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    ],
    agenda: [
      { time: "Day 1 · 10:00 AM", title: "Opening Keynote & Problem Statements", description: "Kickoff ceremony with track announcements" },
      { time: "Day 2 · 02:00 PM", title: "Midway Checkpoint & Mentorship", description: "1-on-1 code reviews with staff engineers" },
      { time: "Day 3 · 05:00 PM", title: "Top 10 Demo Day & Awards", description: "Live streamed presentations to jury" },
    ],
  });

  const event2 = await Event.create({
    title: "Autonomous Agents Summit",
    slug: "autonomous-agents-summit",
    tagline: "Architecture, Tool-Calling, and Safety in Large Language Model Agentic Systems",
    about: "A deep-dive technical conference exploring practical multi-agent coordination, memory architectures, and production latency optimization.",
    category: "Conference",
    mode: "Online",
    location: "Virtual (Live Streamed)",
    eventDate: new Date("2026-11-05T14:00:00Z"),
    dateLabel: "Nov 5, 2026",
    durationLabel: "6 hours",
    registrationDeadline: new Date("2026-11-04T23:59:59Z"),
    price: "Free",
    registrationFee: "Free",
    capacity: 500,
    seats: 500,
    registeredCount: 110,
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
    status: "APPROVED",
    organizer: organizerUser._id,
    organizerName: "DevSphere Foundation",
    approvedBy: adminUser._id,
    approvedAt: new Date(),
    publishedAt: new Date(),
    isFeatured: true,
    registrationsOpen: true,
    tags: ["AI Agents", "LLMs", "Conference"],
  });

  // Pending Review Event (for Admin queue testing)
  await Event.create({
    title: "Zero-Knowledge Cryptography Bootcamp",
    slug: "zk-cryptography-bootcamp",
    tagline: "Master PLONK, zk-SNARKs and Circom circuits in 4 intensive sessions",
    about: "Comprehensive engineering bootcamp on zero-knowledge proofs for scalability and identity privacy.",
    category: "Bootcamp",
    mode: "Online",
    location: "Virtual Cohort",
    eventDate: new Date("2026-11-20T10:00:00Z"),
    dateLabel: "Nov 20 – Dec 10, 2026",
    durationLabel: "3 weeks",
    registrationDeadline: new Date("2026-11-18T23:59:59Z"),
    price: "Free",
    registrationFee: "Free",
    capacity: 80,
    seats: 80,
    registeredCount: 0,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    status: "PENDING_REVIEW",
    organizer: organizerUser._id,
    organizerName: "DevSphere Foundation",
    isFeatured: false,
    registrationsOpen: true,
    tags: ["Cryptography", "ZK", "Security"],
  });

  logger.info("Seeded approved and pending events.");

  // 5. Seed Registration for Student
  await Registration.create({
    user: student._id,
    event: event1._id,
    status: "REGISTERED",
    ticketCode: "IGN-HAC-8812",
    seatNumber: "HAC-B04",
    userName: student.name,
    userEmail: student.email,
    college: student.college,
    phone: "+91 91234 56789",
    eventTitle: event1.title,
    eventDate: event1.dateLabel,
    eventLocation: event1.location,
    registeredAt: new Date(),
  });

  // 6. Seed Announcements & Banners
  await Announcement.create({
    title: "Global AI Hackathon Registrations Open!",
    content: "Over ₹25,00,000 in bounties announced for open-source AI models. Register before seats fill.",
    message: "Over ₹25,00,000 in bounties announced for open-source AI models. Register before seats fill.",
    type: "info",
    active: true,
    createdBy: adminUser._id,
  });

  await Banner.create({
    title: "Build the Future at Ignite 2026",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    description: "Discover premier hackathons, tech conferences, and university summits.",
    ctaText: "Explore Events",
    ctaLink: "/events",
    active: true,
    displayOrder: 1,
    createdBy: adminUser._id,
  });

  logger.info("==========================================");
  logger.info("✅ Ignite Enginow Database Seed Complete!");
  logger.info("==========================================");

  if (standalone) {
    await closeDB();
  }
};

const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/seed.js");
if (isMain) {
  seedData(true).catch((err) => {
    logger.error("Seed failed:", err);
    process.exit(1);
  });
}
