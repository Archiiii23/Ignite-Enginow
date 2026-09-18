import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

export type EventCategory =
  | "AI"
  | "Web Development"
  | "Cloud"
  | "DevOps"
  | "Cyber Security"
  | "Robotics"
  | "Data Science"
  | "Machine Learning"
  | "UI/UX"
  | "Startup"
  | "Product Management"
  | "Career"
  | "College Events"
  | "Hackathons"
  // Aliases and legacy types for backwards compatibility
  | "Workshops"
  | "Workshop"
  | "Seminars"
  | "Seminar"
  | "Webinars"
  | "Webinar"
  | "Competitions"
  | "Competition"
  | "Bootcamps"
  | "Bootcamp"
  | "Conferences"
  | "Conference"
  | "Tech Talks"
  | "Tech Talk"
  | "Community Events"
  | "Meetup"
  | "College Festivals"
  | "College Festival"
  | "Networking Events"
  | "Networking"
  | "AI / ML"
  | "Cloud & DevOps";

export type EventType =
  | "Workshop"
  | "Hackathon"
  | "Webinar"
  | "Seminar"
  | "Bootcamp"
  | "Competition"
  | "Conference"
  | "Tech Talk"
  | "Meetup";

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: EventCategory;
  eventType?: EventType;
  mode: "Online" | "In-person" | "Hybrid";
  location: string;
  city?: string;
  college?: string;
  dateISO: string;
  dateLabel: string;
  registrationDeadline?: string;
  durationLabel: string;
  price: "Free" | string;
  prize?: string;
  seats: number;
  registered: number;
  viewsCount?: number;
  clicksCount?: number;
  cover: string;
  status: "live" | "closing" | "upcoming" | "ended";
  tags?: string[];
  host: {
    name: string;
    role: string;
    avatar?: string;
    logo?: string;
  };
  speakers?: { name: string; role: string; avatar?: string }[];
  sponsors?: { name: string; logoText?: string }[];
  faqs?: { q: string; a: string }[];
  contactEmail?: string;
  about: string;
  agenda: { time: string; title: string; description: string }[];
  perks: string[];
};

export const events: EventItem[] = [
  // 1. CLOUD & DEVOPS / WORKSHOPS
  {
    id: "e-ws-1",
    slug: "designing-systems-that-scale",
    title: "Designing Systems That Scale",
    tagline: "Hands-on distributed systems architecture, event-driven pipelines, and high-throughput databases.",
    category: "Cloud",
    eventType: "Workshop",
    mode: "Online",
    location: "Live on Enginow Interactive Stage",
    city: "Online",
    college: "IIT Bombay",
    dateISO: "2026-10-24",
    dateLabel: "Oct 24, 2026",
    registrationDeadline: "2026-10-22",
    durationLabel: "4 hours",
    price: "₹499",
    seats: 300,
    registered: 214,
    viewsCount: 3840,
    clicksCount: 920,
    cover: event2,
    status: "live",
    tags: ["Cloud", "Distributed Systems", "Backend", "Architecture"],
    host: {
      name: "OpenKernel Community",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      logo: "OK",
    },
    speakers: [
      { name: "Aarav Mehta", role: "Staff Architect, Fintech Scale", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
      { name: "Maya Sen", role: "Principal Cloud Engineer, AWS", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Razorpay" }, { name: "Cred" }],
    faqs: [
      { q: "Is this workshop interactive?", a: "Yes, you will design architectures live with 1-on-1 feedback." },
      { q: "Will recordings be provided?", a: "Full HD recordings and architecture diagrams are provided for lifetime access." },
    ],
    contactEmail: "workshops@enginow.io",
    about: "Learn how modern high-scale platforms handle millions of concurrent operations with minimal latency. We cover message queues, distributed consensus, data sharding, caching strategies, and chaos engineering.",
    agenda: [
      { time: "14:00", title: "Fundamentals of Distributed Scale", description: "Latency vs throughput and SLO definitions." },
      { time: "15:00", title: "Data Plane Patterns", description: "Queues, caches, and consistency trade-offs." },
      { time: "16:30", title: "Interactive System Design Lab", description: "Design a real-world resilient ride-sharing dispatch system." },
    ],
    perks: ["Verified Workshop Certificate", "Interactive Architecture Blueprint", "Lifetime Recording Access"],
  },

  // 2. HACKATHONS / AI
  {
    id: "e-hk-1",
    slug: "quantum-hack-2026",
    title: "Quantum Hack 2026",
    tagline: "48-hour flagship hybrid hackathon on Edge AI, Quantum Computing & Decentralized Systems.",
    category: "Hackathons",
    eventType: "Hackathon",
    mode: "Hybrid",
    location: "Bengaluru + Online",
    city: "Bengaluru",
    college: "IISc Bengaluru",
    dateISO: "2026-11-13",
    dateLabel: "Nov 13 – 15, 2026",
    registrationDeadline: "2026-11-09",
    durationLabel: "48 hours",
    price: "Free",
    prize: "₹10,00,000 Prize Pool",
    seats: 800,
    registered: 612,
    viewsCount: 14200,
    clicksCount: 3850,
    cover: event1,
    status: "live",
    tags: ["Hackathons", "AI", "Quantum", "Prize"],
    host: {
      name: "DevSphere Foundation",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
      logo: "DF",
    },
    speakers: [
      { name: "Dr. Priya Nair", role: "Quantum Research Lead, IBM", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80" },
      { name: "Arun Krishnan", role: "Principal Engineer, Google DeepMind", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Google Cloud" }, { name: "IBM Quantum" }, { name: "NVIDIA" }],
    faqs: [
      { q: "Can I participate solo or in teams?", a: "You can participate solo or in teams of up to 4 members." },
      { q: "Are prizes cash or credits?", a: "Cash bounties will be wired directly to winners, along with cloud compute credits." },
    ],
    contactEmail: "hack@enginow.io",
    about: "A flagship hybrid hackathon bringing together builders across quantum computing, applied ML, and edge systems. Ship a working prototype in 48 hours, get mentored by senior staff engineers, and pitch to leading investors.",
    agenda: [
      { time: "Day 1 · 09:00", title: "Opening Keynote & Problem Tracks", description: "Kickoff ceremony with track release." },
      { time: "Day 2 · 11:00", title: "Staff Engineer Office Hours", description: "1-on-1 code reviews and mentorship." },
      { time: "Day 3 · 15:00", title: "Top 10 Demo Day & Jury Pitch", description: "Live pitch session before industry judges." },
    ],
    perks: ["₹10,00,000 Cash Pool", "Exclusive Builder Swag Kit", "Direct Recruiter Fast-Track", "Mentorship Access"],
  },

  // 3. AI / RESEARCH SEMINARS
  {
    id: "e-sm-1",
    slug: "frontier-ai-research-seminar",
    title: "Frontier AI & Generative Models Research Seminar",
    tagline: "Academic presentations on large reasoning models, diffusion architectures, and model safety.",
    category: "AI",
    eventType: "Seminar",
    mode: "Hybrid",
    location: "IISc Main Auditorium, Bengaluru + Live Stream",
    city: "Bengaluru",
    college: "IISc Bengaluru",
    dateISO: "2026-10-18",
    dateLabel: "Oct 18, 2026",
    registrationDeadline: "2026-10-15",
    durationLabel: "1 day",
    price: "Free",
    seats: 400,
    registered: 285,
    viewsCount: 5200,
    clicksCount: 1400,
    cover: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
    status: "upcoming",
    tags: ["AI", "Machine Learning", "Research", "Academic"],
    host: {
      name: "IISc Research Collective",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      logo: "IISc",
    },
    speakers: [
      { name: "Prof. K. Venkatesh", role: "Director, Computational Intelligence Lab", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" },
      { name: "Dr. Ananya Ray", role: "Senior Research Scientist, DeepMind", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "IISc Bengaluru" }, { name: "Microsoft Research" }],
    faqs: [
      { q: "Is prior ML knowledge required?", a: "Familiarity with neural networks and linear algebra is recommended." },
      { q: "Will paper preprints be shared?", a: "Yes, attendees receive digital access to all featured research papers." },
    ],
    contactEmail: "seminars@enginow.io",
    about: "An academic research seminar diving deep into test-time compute, multimodal foundation models, formal verification of LLM outputs, and novel alignment techniques.",
    agenda: [
      { time: "09:30", title: "Paper Presentation: Test-Time Reasoning", description: "Scaling search vs parameters." },
      { time: "11:30", title: "Diffusion & Generative Frontiers", description: "Advances in 3D generation and physics engines." },
      { time: "14:30", title: "Panel: AI Alignment & Robustness", description: "Safety guardrails for autonomous agents." },
    ],
    perks: ["Research Paper Pack", "Auditorium Access", "Networking Lunch", "Certificate of Attendance"],
  },

  // 4. PRODUCT MANAGEMENT / WEBINARS
  {
    id: "e-wb-1",
    slug: "ai-product-webinar",
    title: "Building AI Products Users Love",
    tagline: "A live masterclass with product leaders shipping generative AI at 50M+ user scale.",
    category: "Product Management",
    eventType: "Webinar",
    mode: "Online",
    location: "Live Interactive Broadcast on Enginow",
    city: "Online",
    college: "Stanford University",
    dateISO: "2026-11-04",
    dateLabel: "Nov 4, 2026",
    registrationDeadline: "2026-11-03",
    durationLabel: "90 min",
    price: "Free",
    seats: 2000,
    registered: 1587,
    viewsCount: 9400,
    clicksCount: 2900,
    cover: event3,
    status: "live",
    tags: ["Product Management", "AI", "Strategy", "Free"],
    host: {
      name: "Enginow Product Network",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      logo: "EPN",
    },
    speakers: [
      { name: "Isha Rao", role: "Head of Product, AI Platform", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" },
      { name: "Vikram Sethi", role: "VP Engineering, Scale AI", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Enginow" }],
    faqs: [
      { q: "Can I ask questions live?", a: "Yes, 30 minutes are reserved for live audience Q&A." },
      { q: "Will I get slides?", a: "Presentation slides and curated PM frameworks will be emailed." },
    ],
    contactEmail: "webinars@enginow.io",
    about: "What separates AI features that delight from gimmicks that get abandoned? Practical insights on eval frameworks, latency budgets, user feedback loops, and unit economics.",
    agenda: [
      { time: "18:00", title: "Framing: Where AI Earns Its Keep", description: "The product landscape in 2026." },
      { time: "18:30", title: "Hardest Product Calls in Production", description: "Real-world case studies and teardowns." },
      { time: "19:00", title: "Live Audience Q&A", description: "Direct AMA with product leaders." },
    ],
    perks: ["Live Q&A Access", "Product Framework Deck", "Full Recording Access"],
  },

  // 5. DATA SCIENCE & ALGORITHMS / COMPETITIONS
  {
    id: "e-cp-1",
    slug: "algostrike-code-championship",
    title: "AlgoStrike: National Algorithmic Championship",
    tagline: "Speed coding, graph optimization, and code golf tournament for elite programmers.",
    category: "Data Science",
    eventType: "Competition",
    mode: "Online",
    location: "Enginow Competitive Arena",
    city: "Online",
    college: "BITS Pilani",
    dateISO: "2026-10-31",
    dateLabel: "Oct 31, 2026",
    registrationDeadline: "2026-10-28",
    durationLabel: "6 hours",
    price: "Free",
    prize: "₹3,50,000 Cash Pool",
    seats: 1500,
    registered: 940,
    viewsCount: 7100,
    clicksCount: 2150,
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    status: "upcoming",
    tags: ["Data Science", "Competitive Programming", "Algorithms", "Prize"],
    host: {
      name: "AlgoStrike League",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80",
      logo: "AS",
    },
    speakers: [{ name: "Rohan Varma", role: "Grandmaster & IOI Gold Medalist", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80" }],
    sponsors: [{ name: "Tower Research" }, { name: "DE Shaw" }],
    faqs: [
      { q: "What programming languages are supported?", a: "C++, Java, Python, Rust, and Go." },
      { q: "Is anti-cheat active?", a: "Yes, automated code plagiarism detection and webcam proctoring apply." },
    ],
    contactEmail: "competitions@enginow.io",
    about: "A three-round algorithmic competition featuring advanced data structures, segment trees, flow algorithms, dynamic programming, and byte-minimization code golf challenges.",
    agenda: [
      { time: "14:00", title: "Qualifier Round", description: "5 algorithmic speed problems." },
      { time: "16:30", title: "The Decider: Hard Optimizations", description: "3 NP-hard approximation challenges." },
      { time: "19:00", title: "Live Leaderboard & Awards", description: "Prize distribution and solution analysis." },
    ],
    perks: ["₹3,50,00,000 Prize Pool", "HFT Interview Fast-Tracks", "Ranked Competitive Badge"],
  },

  // 6. WEB DEVELOPMENT / BOOTCAMPS
  {
    id: "e-bc-1",
    slug: "frontend-bootcamp-2026",
    title: "Modern Frontend & Systems Bootcamp",
    tagline: "Four weekends. Ship a production-grade React, TypeScript & WebAssembly web app.",
    category: "Web Development",
    eventType: "Bootcamp",
    mode: "Online",
    location: "Cohort-based with 1:1 Code Reviews",
    city: "Online",
    college: "IIIT Hyderabad",
    dateISO: "2026-11-07",
    dateLabel: "Nov 7 – 29, 2026",
    registrationDeadline: "2026-11-04",
    durationLabel: "4 weeks",
    price: "₹4,999",
    seats: 120,
    registered: 46,
    viewsCount: 4600,
    clicksCount: 880,
    cover: event4,
    status: "upcoming",
    tags: ["Web Development", "React", "TypeScript", "Frontend", "Paid"],
    host: {
      name: "Enginow Academy",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80",
      logo: "EA",
    },
    speakers: [
      { name: "Sania Mirza", role: "Staff Engineer, Stripe", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
      { name: "Rohan Gupta", role: "Tech Lead, Notion", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "JetBrains" }, { name: "Vercel" }],
    faqs: [
      { q: "What is the weekly time commitment?", a: "Approximately 6–8 hours including weekend live sessions." },
      { q: "Is there a capstone project?", a: "Yes, a production deployment reviewed directly by staff engineers." },
    ],
    contactEmail: "academy@enginow.io",
    about: "An intensive four-weekend engineering cohort focused on modern state management, high-performance rendering, accessibility, WebSockets, and production deployments.",
    agenda: [
      { time: "Week 1", title: "Architecture & Data Plane", description: "TanStack, Server State & Cache invalidation." },
      { time: "Week 2", title: "UI Craft & Micro-Interactions", description: "Motion, design tokens, and fluid animation." },
      { time: "Week 3", title: "Auth & Real-Time Sync", description: "WebSockets, CRDTs, and secure cookie sessions." },
      { time: "Week 4", title: "Deploy, Benchmark & Demo", description: "Lighthouse 100 audits and demo day." },
    ],
    perks: ["Live Cohort Access", "Personal Code Reviews", "Graduation Certificate", "Alumni Network"],
  },

  // 7. CAREER & CONFERENCES
  {
    id: "e-cf-1",
    slug: "devfest-south-2026",
    title: "DevFest South 2026",
    tagline: "The flagship regional gathering for engineers, designers, and software leaders.",
    category: "Career",
    eventType: "Conference",
    mode: "In-person",
    location: "HICC Convention Centre, Hyderabad",
    city: "Hyderabad",
    college: "IIIT Hyderabad",
    dateISO: "2026-11-28",
    dateLabel: "Nov 28, 2026",
    registrationDeadline: "2026-11-24",
    durationLabel: "1 day",
    price: "₹1,499",
    seats: 1200,
    registered: 803,
    viewsCount: 11200,
    clicksCount: 3100,
    cover: event5,
    status: "upcoming",
    tags: ["Career", "Conferences", "Networking", "In-person"],
    host: {
      name: "DevSphere Communities",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      logo: "DC",
    },
    speakers: [
      { name: "Ananya Das", role: "Engineering Director, Flipkart", avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80" },
      { name: "Karan Mehta", role: "Founder, HealthAI", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
      { name: "Prerna Sinha", role: "Staff ML Engineer, Microsoft", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Google" }, { name: "Microsoft" }, { name: "GitHub" }],
    faqs: [
      { q: "Are meals included?", a: "Buffet lunch, coffee breaks, and conference reception are included." },
      { q: "Can college students get discounts?", a: "Yes, 30% student discounts apply with valid college ID." },
    ],
    contactEmail: "devfest@enginow.io",
    about: "A high-energy full-day technical conference featuring three parallel tracks: Cloud & Scalability, AI & LLMs in Production, and Modern Webcraft. Meet founders, engineering executives, and fellow innovators.",
    agenda: [
      { time: "09:30", title: "Registration & Breakfast Mixer", description: "Badge pickup & welcome lounge." },
      { time: "10:30", title: "Opening Keynote: Future of Software", description: "State of engineering in 2026." },
      { time: "12:00", title: "Parallel Deep-Dive Tracks", description: "3 tracks across AI, Systems, and Frontend." },
      { time: "18:00", title: "Networking Reception & After-Party", description: "Drinks, food, and open conversations." },
    ],
    perks: ["Full-Day Conference Badge", "Official Swag Pack", "Catered Lunch & Dinner", "Recorded Talks Access"],
  },

  // 8. DEVOPS & SYSTEMS / TECH TALKS
  {
    id: "e-tt-1",
    slug: "rust-systems-tech-talk",
    title: "High-Performance Systems & Kernel Bypassing in Rust",
    tagline: "Zero-copy ring buffers, io_uring, and SIMD optimizations for ultra-low latency.",
    category: "DevOps",
    eventType: "Tech Talk",
    mode: "Hybrid",
    location: "NESCO Center, Goregaon, Mumbai",
    city: "Mumbai",
    college: "IIT Bombay",
    dateISO: "2026-10-16",
    dateLabel: "Oct 16, 2026",
    registrationDeadline: "2026-10-14",
    durationLabel: "3 hours",
    price: "Free",
    seats: 250,
    registered: 184,
    viewsCount: 3900,
    clicksCount: 950,
    cover: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
    status: "upcoming",
    tags: ["DevOps", "Rust", "Systems", "Low Latency"],
    host: {
      name: "Rust India Community",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
      logo: "RIC",
    },
    speakers: [{ name: "Vikramaditya Rao", role: "Staff Systems Engineer, Trading Tech", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" }],
    sponsors: [{ name: "Rust Foundation" }, { name: "Tower Research" }],
    faqs: [
      { q: "Is Rust experience required?", a: "Intermediate programming experience in Rust, C++, or Go is recommended." },
    ],
    contactEmail: "techtalks@enginow.io",
    about: "An in-depth technical lecture exploring how staff engineers achieve sub-microsecond latency in Rust using Linux io_uring, custom allocators, and cache-line aligned memory layouts.",
    agenda: [
      { time: "18:30", title: "Hardware-Mechanical Sympathy", description: "CPU caches, TLB, and branch prediction." },
      { time: "19:15", title: "Zero-Copy Architectures in Rust", description: "io_uring and ring buffer design." },
      { time: "20:30", title: "Audience Code Walkthrough", description: "Benchmarking microsecond gains." },
    ],
    perks: ["Source Code Samples", "Speaker AMA", "Event Pass"],
  },

  // 9. CYBER SECURITY / WORKSHOP
  {
    id: "e-sec-1",
    slug: "offensive-cyber-security-bootcamp",
    title: "Offensive Cyber Security & Red Teaming Masterclass",
    tagline: "Live simulated enterprise penetration testing, zero-day analysis, and cloud defense.",
    category: "Cyber Security",
    eventType: "Workshop",
    mode: "Online",
    location: "Enginow Cyber Range Virtual Sandbox",
    city: "Online",
    college: "IIT Delhi",
    dateISO: "2026-11-21",
    dateLabel: "Nov 21 – 22, 2026",
    registrationDeadline: "2026-11-19",
    durationLabel: "2 days",
    price: "₹799",
    prize: "₹1,00,000 Bug Bounty Pool",
    seats: 500,
    registered: 342,
    viewsCount: 6800,
    clicksCount: 1650,
    cover: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    status: "live",
    tags: ["Cyber Security", "Ethical Hacking", "Red Team", "Cloud Defense"],
    host: {
      name: "CyberShield Academy",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      logo: "CS",
    },
    speakers: [
      { name: "Devansh Saxena", role: "Principal Security Researcher, NullCon", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "CrowdStrike" }, { name: "Palo Alto Networks" }],
    faqs: [
      { q: "Is a pre-configured VM provided?", a: "Yes, participants gain access to a dedicated cloud Kali Linux sandbox." },
    ],
    contactEmail: "security@enginow.io",
    about: "A battle-tested offensive security workshop. Practice exploitation vectors, bypass modern WAFs, audit Kubernetes clusters, and capture flags in an active virtual corporate network.",
    agenda: [
      { time: "Day 1", title: "Web & API Exploitation", description: "JWT forgery, SSRF to cloud metadata, and SQLi." },
      { time: "Day 2", title: "Cloud Privilege Escalation", description: "AWS IAM abuse, container escapes, and defense evasion." },
    ],
    perks: ["Cloud Sandbox Access", "Certified Ethical Penetration Tester Badge", "Bug Bounty Guide"],
  },

  // 10. ROBOTICS & HARDWARE / COLLEGE EVENTS
  {
    id: "e-fest-1",
    slug: "collegiate-tech-fest-ignite26",
    title: "National Collegiate Tech Fest 'Ignite 26'",
    tagline: "The largest inter-collegiate engineering symposium: robot wars, hackathons, and esports.",
    category: "College Events",
    eventType: "Competition",
    mode: "In-person",
    location: "IIT Madras Open Air Theatre & Grounds, Chennai",
    city: "Chennai",
    college: "IIT Madras",
    dateISO: "2026-12-18",
    dateLabel: "Dec 18 – 20, 2026",
    registrationDeadline: "2026-12-14",
    durationLabel: "3 days",
    price: "₹299",
    prize: "₹7,50,000 Total Prizes",
    seats: 2500,
    registered: 1420,
    viewsCount: 18500,
    clicksCount: 4200,
    cover: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80",
    status: "upcoming",
    tags: ["College Events", "Robotics", "Hackathons", "Campus", "Prize"],
    host: {
      name: "IIT Madras Tech Council",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      logo: "IITM",
    },
    speakers: [{ name: "Dr. K. Sivan", role: "Former ISRO Chairman (Guest of Honor)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80" }],
    sponsors: [{ name: "ISRO" }, { name: "Tata Technologies" }, { name: "Infosys" }],
    faqs: [
      { q: "Is accommodation provided for outstation students?", a: "Yes, hostel accommodations are provided on prior booking." },
    ],
    contactEmail: "fest@enginow.io",
    about: "Over 5,000 engineering students from 75+ universities converge for three exhilarating days of technical competitions, drone races, robotic combat arenas, coding marathons, and a grand concert finale.",
    agenda: [
      { time: "Day 1", title: "RoboWars & Hackathon Kickoff", description: "Arena combat and 36-hour build marathon." },
      { time: "Day 2", title: "Paper Presentations & Esports", description: "Research tracks and gaming qualifiers." },
      { time: "Day 3", title: "Grand Finale & EDM Concert", description: "Awards ceremony and live celebrity performance." },
    ],
    perks: ["3-Day Festival Pass", "College Championship Points", "Concert Night Access", "Certificate of Merit"],
  },

  // 11. ROBOTICS & AUTONOMY
  {
    id: "e-rob-1",
    slug: "autonomous-robotics-summit",
    title: "Autonomous Drones & Mobile Robotics Summit",
    tagline: "ROS 2, computer vision navigation, and SLAM for next-generation autonomous robotics.",
    category: "Robotics",
    eventType: "Seminar",
    mode: "In-person",
    location: "IIT Delhi Robotics Arena, New Delhi",
    city: "New Delhi",
    college: "IIT Delhi",
    dateISO: "2026-11-18",
    dateLabel: "Nov 18, 2026",
    registrationDeadline: "2026-11-15",
    durationLabel: "1 day",
    price: "₹350",
    prize: "₹2,00,000 Drone Race Bounty",
    seats: 350,
    registered: 218,
    viewsCount: 4100,
    clicksCount: 980,
    cover: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    status: "upcoming",
    tags: ["Robotics", "Computer Vision", "ROS2", "Hardware"],
    host: {
      name: "RoboNation Collective",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      logo: "RN",
    },
    speakers: [
      { name: "Prof. Arvind Bansal", role: "Chair of Mechatronics, IIT Delhi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "DJI" }, { name: "NVIDIA Robotics" }],
    faqs: [
      { q: "Can I bring my custom robot or drone?", a: "Yes, dedicated calibration pits and test flight cages are available." },
    ],
    contactEmail: "robotics@enginow.io",
    about: "Explore LiDAR-based SLAM, real-time object detection with edge TensorRT, and motion planning for quadcopters and bipedal robots.",
    agenda: [
      { time: "10:00", title: "Modern Robotics with ROS 2", description: "Architecture and DDS middleware." },
      { time: "13:00", title: "Live Indoor Drone Obstacle Run", description: "Real-time SLAM navigation test." },
    ],
    perks: ["Hardware Lab Access", "Robotics Component Kit Discount", "Event Pass"],
  },

  // 12. UI/UX DESIGN / WORKSHOPS
  {
    id: "e-ux-1",
    slug: "design-systems-microinteractions-masterclass",
    title: "Design Systems & High-Fidelity Micro-Interactions",
    tagline: "Design delightful interfaces with Figma token variables, Framer Motion, and fluid physics.",
    category: "UI/UX",
    eventType: "Workshop",
    mode: "Online",
    location: "Live Interactive Figma & Code Lab",
    city: "Online",
    college: "National Institute of Design (NID)",
    dateISO: "2026-10-29",
    dateLabel: "Oct 29, 2026",
    registrationDeadline: "2026-10-27",
    durationLabel: "4 hours",
    price: "₹399",
    seats: 400,
    registered: 312,
    viewsCount: 5800,
    clicksCount: 1420,
    cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
    status: "live",
    tags: ["UI/UX", "Figma", "Design Systems", "Framer Motion"],
    host: {
      name: "CraftDesign Guild",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      logo: "CDG",
    },
    speakers: [
      { name: "Tara Menon", role: "Design Director, Linear", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Figma" }, { name: "Raycast" }],
    faqs: [
      { q: "Is coding experience required?", a: "Basic understanding of CSS/HTML is helpful but not mandatory." },
    ],
    contactEmail: "design@enginow.io",
    about: "Step-by-step masterclass on creating tokenized design systems, gesture-driven transitions, spring physics, and bridging the gap between Figma mockups and production React code.",
    agenda: [
      { time: "15:00", title: "Design Tokens & Variable Architecture", description: "Color modes, spacing, and typography scales." },
      { time: "16:30", title: "Physics-Based Micro-Animations", description: "Spring dynamics and gesture feedback." },
    ],
    perks: ["Figma UI Component Kit (.fig)", "Framer Motion Template Repo", "Recording Access"],
  },

  // 13. STARTUP & VENTURES / NETWORKING
  {
    id: "e-net-1",
    slug: "founders-engineers-networking-night",
    title: "Founders, Tech Leads & Angel Investors Networking Evening",
    tagline: "Curated high-signal networking mixer for early-stage startup builders and tech executives.",
    category: "Startup",
    eventType: "Meetup",
    mode: "In-person",
    location: "The Leela Palace, HAL Old Airport Road, Bengaluru",
    city: "Bengaluru",
    college: "Stanford University",
    dateISO: "2026-12-05",
    dateLabel: "Dec 5, 2026",
    registrationDeadline: "2026-12-02",
    durationLabel: "4 hours",
    price: "Free",
    seats: 120,
    registered: 96,
    viewsCount: 4200,
    clicksCount: 1100,
    cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
    status: "live",
    tags: ["Startup", "Founders", "Networking", "Investors"],
    host: {
      name: "Ignite Venture Network",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      logo: "IVN",
    },
    speakers: [
      { name: "Tanmay Bhatia", role: "Managing Partner, SeedCapital", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
      { name: "Shreya Gupta", role: "Co-Founder & CTO, HyperScale", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Silicon Valley Bank" }, { name: "AWS Startups" }],
    faqs: [
      { q: "Is registration curated?", a: "Yes, registrations are reviewed to maintain a high-signal founder/engineer attendee mix." },
    ],
    contactEmail: "networking@enginow.io",
    about: "An exclusive mixer connecting early-stage technology founders, prospective co-founders, seed angel investors, and senior staff engineers. No vanity pitches, just direct conversations.",
    agenda: [
      { time: "18:00", title: "Welcome Drinks & Registration", description: "Private lounge check-in." },
      { time: "19:00", title: "Founder Spotlight", description: "3 three-minute stories of scaling from 0 to 1." },
      { time: "19:30", title: "Open Mixer & Dinner", description: "Facilitated table networking." },
    ],
    perks: ["Curated Attendee List", "Investor Lounge Access", "Gourmet Dinner & Cocktails"],
  },

  // 14. MACHINE LEARNING & MLOPS / WEBINAR
  {
    id: "e-ml-1",
    slug: "mlops-production-pipeline-webinar",
    title: "LLMOps & Production Model Monitoring at Scale",
    tagline: "Automated evaluations, prompt drift detection, and low-latency inference pipelines.",
    category: "Machine Learning",
    eventType: "Webinar",
    mode: "Online",
    location: "Live Interactive Broadcast on Enginow",
    city: "Online",
    college: "BITS Pilani",
    dateISO: "2026-10-26",
    dateLabel: "Oct 26, 2026",
    registrationDeadline: "2026-10-25",
    durationLabel: "2 hours",
    price: "Free",
    seats: 1200,
    registered: 840,
    viewsCount: 6100,
    clicksCount: 1750,
    cover: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&auto=format&fit=crop&q=80",
    status: "closing",
    tags: ["Machine Learning", "MLOps", "LLM", "Python"],
    host: {
      name: "Machine Learning Guild",
      role: "Verified Organizer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      logo: "MLG",
    },
    speakers: [
      { name: "Raghav Suri", role: "Principal MLOps Architect", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80" },
    ],
    sponsors: [{ name: "Weights & Biases" }, { name: "Anyscale" }],
    faqs: [
      { q: "Will repo code be shared?", a: "Yes, complete GitHub repository with GitHub Actions CI/CD and Docker setups is provided." },
    ],
    contactEmail: "mlops@enginow.io",
    about: "Learn how to build resilient LLM inference architectures with automated guardrails, latency caching, fallback models, and continuous evaluation suites.",
    agenda: [
      { time: "17:00", title: "Latency vs Accuracy Trade-offs", description: "Quantization and model routing." },
      { time: "18:00", title: "Drift Monitoring & Auto-Retraining", description: "Real-time telemetry and alerting." },
    ],
    perks: ["Open Source Pipeline Starter Kit", "Weights & Biases Cloud Credits", "Live Q&A"],
  },
];

// 14 Official Categories requested
export const categories: (EventCategory | "All")[] = [
  "All",
  "AI",
  "Web Development",
  "Cloud",
  "DevOps",
  "Cyber Security",
  "Robotics",
  "Data Science",
  "Machine Learning",
  "UI/UX",
  "Startup",
  "Product Management",
  "Career",
  "College Events",
  "Hackathons",
];

export const eventTypes: EventType[] = [
  "Workshop",
  "Hackathon",
  "Webinar",
  "Seminar",
  "Bootcamp",
  "Competition",
  "Conference",
  "Tech Talk",
  "Meetup",
];

export const categoryMeta: Record<string, { icon: string; description: string; color: string }> = {
  All: { icon: "✨", description: "All topics & categories", color: "from-primary/20 to-primary-glow/20 border-primary/20" },
  AI: { icon: "🧠", description: "Artificial intelligence & neural models", color: "from-purple-500/20 to-indigo-500/20 border-purple-500/20" },
  "Web Development": { icon: "💻", description: "Modern frontend, backend & fullstack", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
  Cloud: { icon: "☁️", description: "Cloud infrastructure & scale", color: "from-sky-500/20 to-indigo-500/20 border-sky-500/20" },
  DevOps: { icon: "⚙️", description: "CI/CD, Kubernetes & telemetry", color: "from-cyan-500/20 to-teal-500/20 border-cyan-500/20" },
  "Cyber Security": { icon: "🛡️", description: "Offensive security & defense", color: "from-rose-500/20 to-red-500/20 border-rose-500/20" },
  Robotics: { icon: "🤖", description: "Drones, ROS & hardware autonomy", color: "from-amber-500/20 to-orange-500/20 border-amber-500/20" },
  "Data Science": { icon: "📊", description: "Big data, analytics & algorithms", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" },
  "Machine Learning": { icon: "⚡", description: "Deep learning & MLOps pipelines", color: "from-violet-500/20 to-purple-500/20 border-violet-500/20" },
  "UI/UX": { icon: "🎨", description: "Design systems & product craft", color: "from-pink-500/20 to-rose-500/20 border-pink-500/20" },
  Startup: { icon: "🚀", description: "Founder mixers & venture building", color: "from-orange-500/20 to-amber-500/20 border-orange-500/20" },
  "Product Management": { icon: "🎯", description: "Product strategy & execution", color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/20" },
  Career: { icon: "💼", description: "Recruiting summits & engineering pathways", color: "from-teal-500/20 to-emerald-500/20 border-teal-500/20" },
  "College Events": { icon: "🎓", description: "Inter-collegiate symposiums & fests", color: "from-blue-500/20 to-violet-500/20 border-blue-500/20" },
  Hackathons: { icon: "⚡", description: "Multi-day build sprints & demo days", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20" },
  // Backward compatibility keys
  Workshops: { icon: "🛠️", description: "Hands-on masterclasses", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
  Workshop: { icon: "🛠️", description: "Hands-on masterclasses", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
  Seminars: { icon: "📚", description: "Academic & research lectures", color: "from-indigo-500/20 to-sky-500/20 border-indigo-500/20" },
  Seminar: { icon: "📚", description: "Academic & research lectures", color: "from-indigo-500/20 to-sky-500/20 border-indigo-500/20" },
  Webinars: { icon: "🎙️", description: "Live expert broadcasts", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" },
  Webinar: { icon: "🎙️", description: "Live expert broadcasts", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" },
  Competitions: { icon: "🏆", description: "Competitive coding & challenges", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20" },
  Competition: { icon: "🏆", description: "Competitive coding & challenges", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20" },
  Bootcamps: { icon: "🚀", description: "Accelerated skill cohorts", color: "from-orange-500/20 to-amber-500/20 border-orange-500/20" },
  Bootcamp: { icon: "🚀", description: "Accelerated skill cohorts", color: "from-orange-500/20 to-amber-500/20 border-orange-500/20" },
  Conferences: { icon: "🏛️", description: "Flagship industry summits", color: "from-rose-500/20 to-pink-500/20 border-rose-500/20" },
  Conference: { icon: "🏛️", description: "Flagship industry summits", color: "from-rose-500/20 to-pink-500/20 border-rose-500/20" },
  "Tech Talks": { icon: "💡", description: "Insightful engineering talks", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20" },
  "Tech Talk": { icon: "💡", description: "Insightful engineering talks", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20" },
  "Community Events": { icon: "🤝", description: "Community gatherings & mixers", color: "from-sky-500/20 to-blue-500/20 border-sky-500/20" },
  Meetup: { icon: "🤝", description: "Community gatherings & mixers", color: "from-sky-500/20 to-blue-500/20 border-sky-500/20" },
  "College Festivals": { icon: "🎓", description: "Inter-collegiate technical fests", color: "from-purple-500/20 to-violet-500/20 border-purple-500/20" },
  "Networking Events": { icon: "🌐", description: "High-signal mixer & connections", color: "from-teal-500/20 to-emerald-500/20 border-teal-500/20" },
};
