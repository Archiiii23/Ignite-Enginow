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

  // 1. Seed All 11 Requested Categories
  const categories = await Category.insertMany([
    { name: "Workshops", description: "Hands-on practical masterclasses guided by domain experts", active: true, displayOrder: 1 },
    { name: "Hackathons", description: "Multi-day building competitions & prize challenges", active: true, displayOrder: 2 },
    { name: "Seminars", description: "Academic and research deep-dives on frontier technologies", active: true, displayOrder: 3 },
    { name: "Webinars", description: "Interactive live masterclasses and industry panels", active: true, displayOrder: 4 },
    { name: "Competitions", description: "Speed coding, algorithmic contests & hack leagues", active: true, displayOrder: 5 },
    { name: "Bootcamps", description: "Intensive multi-week skill acceleration cohorts", active: true, displayOrder: 6 },
    { name: "Conferences", description: "Flagship keynotes, showcases, and networking summits", active: true, displayOrder: 7 },
    { name: "Tech Talks", description: "Focused technical lectures and architectural teardowns", active: true, displayOrder: 8 },
    { name: "Community Events", description: "Local gatherings, unconferences, and developer mixers", active: true, displayOrder: 9 },
    { name: "College Festivals", description: "Inter-collegiate technical, robotics, and gaming festivals", active: true, displayOrder: 10 },
    { name: "Networking Events", description: "Curated mixer for founders, engineers, and investors", active: true, displayOrder: 11 },
  ]);
  logger.info(`Seeded ${categories.length} core categories.`);

  // 2. Seed Users
  const student = await User.create({
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    role: "student",
    isRoleSelected: true,
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
    isRoleSelected: true,
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
    isRoleSelected: true,
    accountStatus: "active",
    headline: "Global Technical Community & Hackathon Organizers",
    college: "DevSphere Labs",
    bio: "Empowering 50,000+ engineers worldwide through open hackathons and technical summits.",
  });

  const organizerUser2 = await User.create({
    name: "OpenKernel Community",
    email: "team@openkernel.org",
    role: "organizer",
    isRoleSelected: true,
    accountStatus: "active",
    headline: "Open Source Systems & Developer Community",
    college: "OpenKernel Org",
    bio: "Democratizing systems engineering and low-level software.",
  });

  const adminUser = await User.create({
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    role: "admin",
    isRoleSelected: true,
    accountStatus: "active",
    headline: "Platform Operations & Governance Lead",
  });

  logger.info("Seeded core persona users.");

  // 3. Seed Organizer Profiles
  await OrganizerProfile.create({
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
    eventsCount: 6,
  });

  await OrganizerProfile.create({
    user: organizerUser2._id,
    organizationName: "OpenKernel Community",
    organizationType: "Open Source Foundation",
    description: "Building developer education pathways in distributed systems, OS kernels, and cloud tooling.",
    website: "https://openkernel.org",
    contactEmail: "team@openkernel.org",
    verificationStatus: "APPROVED",
    submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    reviewedBy: adminUser._id,
    eventsCount: 6,
  });

  logger.info("Seeded approved OrganizerProfiles.");

  // 4. Seed Full Events Catalog for all 11 Requested Categories + 1 Pending Admin Review Event
  const eventsData = [
    // 1. WORKSHOPS
    {
      title: "Designing Systems That Scale",
      slug: "designing-systems-that-scale",
      tagline: "Hands-on distributed systems architecture, event-driven pipelines, and high-throughput databases.",
      about: "Learn how modern high-scale platforms handle millions of concurrent operations with minimal latency. We cover message queues, distributed consensus, data sharding, caching strategies, and chaos engineering.",
      category: "Workshops",
      mode: "Online",
      location: "Live on Enginow Interactive Stage",
      city: "Online",
      eventDate: new Date("2026-07-22T14:00:00Z"),
      dateLabel: "Jul 22, 2026",
      durationLabel: "4 hours",
      registrationDeadline: new Date("2026-07-20T23:59:59Z"),
      price: "₹499",
      registrationFee: "₹499",
      capacity: 300,
      seats: 300,
      registeredCount: 214,
      coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser2._id,
      organizerName: "OpenKernel Community",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["Workshops", "Distributed Systems", "Backend", "Architecture"],
      speakers: [
        { name: "Aarav Mehta", role: "Staff Architect, Fintech Scale" },
        { name: "Maya Sen", role: "Principal Cloud Engineer, AWS" },
      ],
      agenda: [
        { time: "14:00", title: "Fundamentals of Distributed Scale", description: "Latency vs throughput and SLO definitions." },
        { time: "15:00", title: "Data Plane Patterns", description: "Queues, caches, and consistency trade-offs." },
        { time: "16:30", title: "Interactive System Design Lab", description: "Design a real-world resilient ride-sharing dispatch system." },
      ],
      perks: ["Verified Workshop Certificate", "Interactive Architecture Blueprint", "Lifetime Recording Access"],
    },

    // 2. HACKATHONS
    {
      title: "Quantum Hack 2026",
      slug: "quantum-hack-2026",
      tagline: "48-hour flagship hybrid hackathon on Edge AI, Quantum Computing & Decentralized Systems.",
      about: "A flagship hybrid hackathon bringing together 1,200+ builders across quantum computing, applied ML, and edge devices. Ship a working prototype in 48 hours, get mentored by senior staff engineers, and pitch to a jury of leading investors.",
      category: "Hackathons",
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
      prize: "₹10,00,000 Prize Pool",
      capacity: 800,
      seats: 800,
      registeredCount: 612,
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["Hackathons", "Quantum", "Edge AI", "Prize"],
      speakers: [
        { name: "Dr. Priya Nair", role: "Quantum Research Lead, IBM" },
        { name: "Arun Krishnan", role: "Principal Engineer, Google DeepMind" },
      ],
      agenda: [
        { time: "Day 1 · 09:00", title: "Opening Keynote & Problem Tracks", description: "Kickoff ceremony with track release." },
        { time: "Day 2 · 11:00", title: "Staff Engineer Office Hours", description: "1-on-1 code reviews and mentorship." },
        { time: "Day 3 · 15:00", title: "Top 10 Demo Day & Jury Pitch", description: "Live pitch session before industry judges." },
      ],
      perks: ["₹10,00,000 Cash Pool", "Exclusive Builder Swag Kit", "Direct Recruiter Fast-Track", "Mentorship Access"],
    },

    // 3. SEMINARS
    {
      title: "Frontier AI & Large Reasoning Models Research Seminar",
      slug: "frontier-ai-research-seminar",
      tagline: "Academic presentations on large reasoning models, diffusion architectures, and model safety.",
      about: "An academic research seminar diving deep into test-time compute, multimodal foundation models, formal verification of LLM outputs, and novel alignment techniques.",
      category: "Seminars",
      mode: "Hybrid",
      location: "IISc Main Auditorium, Bengaluru + Live Stream",
      city: "Bengaluru",
      eventDate: new Date("2026-09-18T09:30:00Z"),
      dateLabel: "Sep 18, 2026",
      durationLabel: "1 day",
      registrationDeadline: new Date("2026-09-15T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      capacity: 400,
      seats: 400,
      registeredCount: 285,
      coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["Seminars", "AI / ML", "Research", "Academic"],
      speakers: [
        { name: "Prof. K. Venkatesh", role: "Director, Computational Intelligence Lab" },
        { name: "Dr. Ananya Ray", role: "Senior Research Scientist, DeepMind" },
      ],
      agenda: [
        { time: "09:30", title: "Paper Presentation: Test-Time Reasoning", description: "Scaling search vs parameters." },
        { time: "11:30", title: "Diffusion & Generative Frontiers", description: "Advances in 3D generation and physics engines." },
        { time: "14:30", title: "Panel: AI Alignment & Robustness", description: "Safety guardrails for autonomous agents." },
      ],
      perks: ["Research Paper Pack", "Auditorium Access", "Networking Lunch", "Certificate of Attendance"],
    },

    // 4. WEBINARS
    {
      title: "Building AI Products Users Love",
      slug: "ai-product-webinar",
      tagline: "A live masterclass with product leaders shipping generative AI at 50M+ user scale.",
      about: "What separates AI features that delight from gimmicks that get abandoned? Practical insights on eval frameworks, latency budgets, user feedback loops, and unit economics.",
      category: "Webinars",
      mode: "Online",
      location: "Live Interactive Broadcast on Enginow",
      city: "Online",
      eventDate: new Date("2026-07-05T18:00:00Z"),
      dateLabel: "Jul 5, 2026",
      durationLabel: "90 min",
      registrationDeadline: new Date("2026-07-04T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      capacity: 2000,
      seats: 2000,
      registeredCount: 1587,
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: false,
      registrationsOpen: true,
      tags: ["Webinars", "AI", "Product Management", "Free"],
      speakers: [
        { name: "Isha Rao", role: "Head of Product, AI Platform" },
        { name: "Vikram Sethi", role: "VP Engineering, Scale AI" },
      ],
      agenda: [
        { time: "18:00", title: "Framing: Where AI Earns Its Keep", description: "The product landscape in 2026." },
        { time: "18:30", title: "Hardest Product Calls in Production", description: "Real-world case studies and teardowns." },
        { time: "19:00", title: "Live Audience Q&A", description: "Direct AMA with product leaders." },
      ],
      perks: ["Live Q&A Access", "Product Framework Deck", "Full Recording Access"],
    },

    // 5. COMPETITIONS
    {
      title: "AlgoStrike: National Algorithmic Championship",
      slug: "algostrike-code-championship",
      tagline: "Speed coding, graph optimization, and code golf tournament for elite programmers.",
      about: "A three-round algorithmic competition featuring advanced data structures, segment trees, flow algorithms, dynamic programming, and byte-minimization code golf challenges.",
      category: "Competitions",
      mode: "Online",
      location: "Enginow Competitive Arena",
      city: "Online",
      eventDate: new Date("2026-08-28T14:00:00Z"),
      dateLabel: "Aug 28, 2026",
      durationLabel: "6 hours",
      registrationDeadline: new Date("2026-08-25T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      prize: "₹3,50,000 Cash Pool",
      capacity: 1500,
      seats: 1500,
      registeredCount: 940,
      coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser2._id,
      organizerName: "OpenKernel Community",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["Competitions", "Competitive Programming", "Algorithms", "Prize"],
      speakers: [{ name: "Rohan Varma", role: "Grandmaster & IOI Gold Medalist" }],
      agenda: [
        { time: "14:00", title: "Qualifier Round", description: "5 algorithmic speed problems." },
        { time: "16:30", title: "The Decider: Hard Optimizations", description: "3 NP-hard approximation challenges." },
        { time: "19:00", title: "Live Leaderboard & Awards", description: "Prize distribution and solution analysis." },
      ],
      perks: ["₹3,50,000 Prize Pool", "HFT Interview Fast-Tracks", "Ranked Competitive Badge"],
    },

    // 6. BOOTCAMPS
    {
      title: "Modern Frontend & Systems Bootcamp",
      slug: "frontend-bootcamp-2026",
      tagline: "Four weekends. Ship a production-grade React, TypeScript & WebAssembly web app.",
      about: "An intensive four-weekend engineering cohort focused on modern state management, high-performance rendering, accessibility, WebSockets, and production deployments.",
      category: "Bootcamps",
      mode: "Online",
      location: "Cohort-based with 1:1 Code Reviews",
      city: "Online",
      eventDate: new Date("2026-09-05T10:00:00Z"),
      dateLabel: "Sep 5 – 28, 2026",
      durationLabel: "4 weeks",
      registrationDeadline: new Date("2026-09-01T23:59:59Z"),
      price: "₹4,999",
      registrationFee: "₹4,999",
      capacity: 120,
      seats: 120,
      registeredCount: 46,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser2._id,
      organizerName: "OpenKernel Community",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: false,
      registrationsOpen: true,
      tags: ["Bootcamps", "React", "TypeScript", "Frontend", "Paid"],
      speakers: [
        { name: "Sania Mirza", role: "Staff Engineer, Stripe" },
        { name: "Rohan Gupta", role: "Tech Lead, Notion" },
      ],
      agenda: [
        { time: "Week 1", title: "Architecture & Data Plane", description: "TanStack, Server State & Cache invalidation." },
        { time: "Week 2", title: "UI Craft & Micro-Interactions", description: "Motion, design tokens, and fluid animation." },
        { time: "Week 3", title: "Auth & Real-Time Sync", description: "WebSockets, CRDTs, and secure cookie sessions." },
        { time: "Week 4", title: "Deploy, Benchmark & Demo", description: "Lighthouse 100 audits and demo day." },
      ],
      perks: ["Live Cohort Access", "Personal Code Reviews", "Graduation Certificate", "Alumni Network"],
    },

    // 7. CONFERENCES
    {
      title: "DevFest South 2026",
      slug: "devfest-south-2026",
      tagline: "The flagship regional gathering for engineers, designers, and software leaders.",
      about: "A high-energy full-day technical conference featuring three parallel tracks: Cloud & Scalability, AI & LLMs in Production, and Modern Webcraft. Meet founders, engineering executives, and fellow innovators.",
      category: "Conferences",
      mode: "In-person",
      location: "HICC Convention Centre, Hyderabad",
      city: "Hyderabad",
      eventDate: new Date("2026-11-08T09:30:00Z"),
      dateLabel: "Nov 8, 2026",
      durationLabel: "1 day",
      registrationDeadline: new Date("2026-11-01T23:59:59Z"),
      price: "₹1,499",
      registrationFee: "₹1,499",
      capacity: 1200,
      seats: 1200,
      registeredCount: 803,
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["Conferences", "DevFest", "Networking", "In-person"],
      speakers: [
        { name: "Ananya Das", role: "Engineering Director, Flipkart" },
        { name: "Karan Mehta", role: "Founder, HealthAI" },
        { name: "Prerna Sinha", role: "Staff ML Engineer, Microsoft" },
      ],
      agenda: [
        { time: "09:30", title: "Registration & Breakfast Mixer", description: "Badge pickup & welcome lounge." },
        { time: "10:30", title: "Opening Keynote: Future of Software", description: "State of engineering in 2026." },
        { time: "12:00", title: "Parallel Deep-Dive Tracks", description: "3 tracks across AI, Systems, and Frontend." },
        { time: "18:00", title: "Networking Reception & After-Party", description: "Drinks, food, and open conversations." },
      ],
      perks: ["Full-Day Conference Badge", "Official Swag Pack", "Catered Lunch & Dinner", "Recorded Talks Access"],
    },

    // 8. TECH TALKS
    {
      title: "High-Performance Systems & Kernel Bypassing in Rust",
      slug: "rust-systems-tech-talk",
      tagline: "Zero-copy ring buffers, io_uring, and SIMD optimizations for ultra-low latency.",
      about: "An in-depth technical lecture exploring how staff engineers achieve sub-microsecond latency in Rust using Linux io_uring, custom allocators, and cache-line aligned memory layouts.",
      category: "Tech Talks",
      mode: "Hybrid",
      location: "NESCO Center, Goregaon, Mumbai",
      city: "Mumbai",
      eventDate: new Date("2026-10-10T18:30:00Z"),
      dateLabel: "Oct 10, 2026",
      durationLabel: "3 hours",
      registrationDeadline: new Date("2026-10-08T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      capacity: 250,
      seats: 250,
      registeredCount: 184,
      coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser2._id,
      organizerName: "OpenKernel Community",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: false,
      registrationsOpen: true,
      tags: ["Tech Talks", "Rust", "Systems", "Low Latency"],
      speakers: [{ name: "Vikramaditya Rao", role: "Staff Systems Engineer, Trading Tech" }],
      agenda: [
        { time: "18:30", title: "Hardware-Mechanical Sympathy", description: "CPU caches, TLB, and branch prediction." },
        { time: "19:15", title: "Zero-Copy Architectures in Rust", description: "io_uring and ring buffer design." },
        { time: "20:30", title: "Audience Code Walkthrough", description: "Benchmarking microsecond gains." },
      ],
      perks: ["Source Code Samples", "Speaker AMA", "Event Pass"],
    },

    // 9. COMMUNITY EVENTS
    {
      title: "Open Source Builders & Maintainers Mixer",
      slug: "open-source-builders-mixer",
      tagline: "An open community evening for contributors, OSS maintainers, and developer advocates.",
      about: "An informal, high-signal gathering for open-source project maintainers and contributors. Share lightning demos, discuss funding models, and find project collaborators.",
      category: "Community Events",
      mode: "In-person",
      location: "WeWork Galaxy, Residency Road, Bengaluru",
      city: "Bengaluru",
      eventDate: new Date("2026-07-19T18:30:00Z"),
      dateLabel: "Jul 19, 2026",
      durationLabel: "3 hours",
      registrationDeadline: new Date("2026-07-18T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      capacity: 150,
      seats: 150,
      registeredCount: 138,
      coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser2._id,
      organizerName: "OpenKernel Community",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: false,
      registrationsOpen: true,
      tags: ["Community Events", "Open Source", "Meetup", "Bengaluru"],
      speakers: [],
      agenda: [
        { time: "18:30", title: "Doors & Introductions", description: "Coffee & open conversations." },
        { time: "19:00", title: "5-Minute Lightning Talks", description: "Showcase what you shipped." },
        { time: "20:00", title: "Open Unconference Circles", description: "Tooling, documentation, and sponsorship." },
      ],
      perks: ["Open Source Stickers", "Community Directory Access", "Snacks & Coffee"],
    },

    // 10. COLLEGE FESTIVALS
    {
      title: "National Collegiate Tech Fest 'Ignite 26'",
      slug: "collegiate-tech-fest-ignite26",
      tagline: "The largest inter-collegiate engineering symposium: robot wars, hackathons, and esports.",
      about: "Over 5,000 engineering students from 75+ universities converge for three exhilarating days of technical competitions, drone races, robotic combat arenas, coding marathons, and a grand concert finale.",
      category: "College Festivals",
      mode: "In-person",
      location: "IIT Madras Open Air Theatre & Grounds, Chennai",
      city: "Chennai",
      eventDate: new Date("2026-12-18T09:00:00Z"),
      dateLabel: "Dec 18 – 20, 2026",
      durationLabel: "3 days",
      registrationDeadline: new Date("2026-12-14T23:59:59Z"),
      price: "₹299",
      registrationFee: "₹299",
      prize: "₹7,50,000 Total Prizes",
      capacity: 2500,
      seats: 2500,
      registeredCount: 1420,
      coverImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: true,
      registrationsOpen: true,
      tags: ["College Festivals", "Robotics", "Hackathons", "Campus", "Prize"],
      speakers: [{ name: "Dr. K. Sivan", role: "Former ISRO Chairman (Guest of Honor)" }],
      agenda: [
        { time: "Day 1", title: "RoboWars & Hackathon Kickoff", description: "Arena combat and 36-hour build marathon." },
        { time: "Day 2", title: "Paper Presentations & Esports", description: "Research tracks and gaming qualifiers." },
        { time: "Day 3", title: "Grand Finale & EDM Concert", description: "Awards ceremony and live celebrity performance." },
      ],
      perks: ["3-Day Festival Pass", "College Championship Points", "Concert Night Access", "Certificate of Merit"],
    },

    // 11. NETWORKING EVENTS
    {
      title: "Founders, Tech Leads & Angel Investors Networking Evening",
      slug: "founders-engineers-networking-night",
      tagline: "Curated high-signal networking mixer for early-stage startup builders and tech executives.",
      about: "An exclusive mixer connecting early-stage technology founders, prospective co-founders, seed angel investors, and senior staff engineers. No vanity pitches, just direct conversations.",
      category: "Networking Events",
      mode: "In-person",
      location: "The Leela Palace, HAL Old Airport Road, Bengaluru",
      city: "Bengaluru",
      eventDate: new Date("2026-08-07T18:00:00Z"),
      dateLabel: "Aug 7, 2026",
      durationLabel: "4 hours",
      registrationDeadline: new Date("2026-08-05T23:59:59Z"),
      price: "Free",
      registrationFee: "Free",
      capacity: 120,
      seats: 120,
      registeredCount: 96,
      coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "DevSphere Foundation",
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      publishedAt: new Date(),
      isFeatured: false,
      registrationsOpen: true,
      tags: ["Networking Events", "Founders", "Startups", "Investors"],
      speakers: [
        { name: "Tanmay Bhatia", role: "Managing Partner, SeedCapital" },
        { name: "Shreya Gupta", role: "Co-Founder & CTO, HyperScale" },
      ],
      agenda: [
        { time: "18:00", title: "Welcome Drinks & Registration", description: "Private lounge check-in." },
        { time: "19:00", title: "Founder Spotlight", description: "3 three-minute stories of scaling from 0 to 1." },
        { time: "19:30", title: "Open Mixer & Dinner", description: "Facilitated table networking." },
      ],
      perks: ["Curated Attendee List", "Investor Lounge Access", "Gourmet Dinner & Cocktails"],
    },

    // 12. PENDING REVIEW EVENT FOR ADMIN MODERATION TESTING
    {
      title: "Zero-Knowledge Cryptography & zk-SNARKs Bootcamp",
      slug: "zk-cryptography-bootcamp",
      tagline: "Master PLONK, zk-SNARKs, Groth16, and Circom circuits in 4 intensive sessions.",
      about: "Comprehensive engineering bootcamp on zero-knowledge proofs for scalability, cross-chain state verification, and identity privacy.",
      category: "Bootcamps",
      mode: "Online",
      location: "Virtual Cohort Labs",
      city: "Online",
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
      tags: ["Cryptography", "ZK", "Security", "Bootcamps"],
    },
  ];

  const createdEvents = await Event.insertMany(eventsData);
  logger.info(`Seeded ${createdEvents.length} full-spectrum events across all 11 categories (${createdEvents.filter(e => e.status === "APPROVED").length} Approved, 1 Pending Review).`);

  const primaryEvent = createdEvents[1]; // Quantum Hack

  // 5. Seed Registrations for Students
  await Registration.create({
    user: student._id,
    event: primaryEvent._id,
    status: "REGISTERED",
    ticketCode: "IGN-HAC-8812",
    seatNumber: "HAC-B04",
    userName: student.name,
    userEmail: student.email,
    college: student.college,
    phone: "+91 91234 56789",
    eventTitle: primaryEvent.title,
    eventDate: primaryEvent.dateLabel,
    eventLocation: primaryEvent.location,
    registeredAt: new Date(),
  });

  await Registration.create({
    user: student2._id,
    event: primaryEvent._id,
    status: "REGISTERED",
    ticketCode: "IGN-HAC-9021",
    seatNumber: "HAC-B05",
    userName: student2.name,
    userEmail: student2.email,
    college: student2.college,
    phone: "+91 98888 12345",
    eventTitle: primaryEvent.title,
    eventDate: primaryEvent.dateLabel,
    eventLocation: primaryEvent.location,
    registeredAt: new Date(),
  });

  // 6. Seed Announcements & Banners
  await Announcement.create({
    title: "Global Hackathon & Competition Registrations Open!",
    content: "Over ₹25,00,000 in bounties announced across national hackathons and competitions. Register before capacity fills.",
    message: "Over ₹25,00,000 in bounties announced across national hackathons and competitions. Register before capacity fills.",
    type: "info",
    active: true,
    createdBy: adminUser._id,
  });

  await Banner.create({
    title: "Explore Premier Technical Events on Ignite",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    description: "Discover workshops, hackathons, seminars, webinars, competitions, bootcamps, conferences, tech talks, community events, college festivals, and networking evenings.",
    ctaText: "Explore All Events",
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
