import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

export type EventCategory =
  | "Hackathon"
  | "Workshop"
  | "Webinar"
  | "Bootcamp"
  | "Conference"
  | "Meetup"
  | "AI / ML"
  | "Web Development"
  | "Cloud & DevOps"
  | "Cyber Security"
  | "Robotics"
  | "Data Science"
  | "UI/UX Design"
  | "Startup"
  | "Career"
  | "College Festival"
  | "Networking";

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: EventCategory;
  mode: "Online" | "In-person" | "Hybrid";
  location: string;
  city?: string;
  dateISO: string;
  dateLabel: string;
  registrationDeadline?: string;
  durationLabel: string;
  price: "Free" | string;
  prize?: string;
  seats: number;
  registered: number;
  cover: string;
  status: "live" | "closing" | "upcoming" | "ended";
  tags?: string[];
  host: { name: string; role: string; avatar?: string };
  speakers?: { name: string; role: string; avatar?: string }[];
  sponsors?: { name: string; logoText?: string }[];
  faqs?: { q: string; a: string }[];
  contactEmail?: string;
  about: string;
  agenda: { time: string; title: string; description: string }[];
  perks: string[];
};

export const events: EventItem[] = [
  {
    id: "e1",
    slug: "quantum-hack-2026",
    title: "Quantum Hack 2026",
    tagline: "48-hour applied quantum & AI hackathon for the next generation of engineers.",
    category: "Hackathon",
    mode: "Hybrid",
    location: "Bengaluru + Online",
    city: "Bengaluru",
    dateISO: "2026-08-14",
    dateLabel: "Aug 14 – 16, 2026",
    registrationDeadline: "2026-08-10",
    durationLabel: "48 hours",
    price: "Free",
    prize: "₹10,00,000 prize pool",
    seats: 800,
    registered: 612,
    cover: event1,
    status: "live",
    tags: ["Quantum", "AI", "ML", "Hackathon", "Prize"],
    host: { name: "Enginow Labs", role: "Verified Igniter" },
    speakers: [
      { name: "Dr. Priya Nair", role: "Quantum Research Lead, IBM" },
      { name: "Arun Krishnan", role: "Principal Engineer, Google DeepMind" },
    ],
    sponsors: [{ name: "Google" }, { name: "IBM Quantum" }, { name: "AWS" }],
    faqs: [
      { q: "Can I participate solo?", a: "Yes, solo participation is allowed but teams of 2–4 are preferred." },
      { q: "Is accommodation provided?", a: "We provide venue access. Travel and stay are at participant's expense." },
      { q: "What tech stack can I use?", a: "Any language or framework — this is an open hackathon." },
    ],
    contactEmail: "hack@enginow.io",
    about:
      "A flagship hybrid hackathon bringing together builders across quantum computing, applied ML, and edge devices. Ship a working prototype in 48 hours, get mentored by leading engineers, and pitch to a jury of investors and researchers.",
    agenda: [
      { time: "Day 1 · 09:00", title: "Opening keynote", description: "Framing the problem space with industry leaders." },
      { time: "Day 1 · 11:00", title: "Team formation & ideation", description: "Structured matchmaking and problem selection." },
      { time: "Day 2 · 10:00", title: "Mentor office hours", description: "1:1 sessions with domain mentors." },
      { time: "Day 3 · 14:00", title: "Final demos & judging", description: "Live demo in front of a live jury." },
    ],
    perks: ["Swag kit", "Certificate of participation", "Mentor access", "Recruiter shortlist"],
  },
  {
    id: "e2",
    slug: "designing-systems-that-scale",
    title: "Designing Systems That Scale",
    tagline: "A hands-on workshop on distributed systems, from first principles to production.",
    category: "Workshop",
    mode: "Online",
    location: "Live on Enginow",
    dateISO: "2026-07-22",
    dateLabel: "Jul 22, 2026",
    registrationDeadline: "2026-07-20",
    durationLabel: "3 hours",
    price: "₹499",
    seats: 300,
    registered: 214,
    cover: event2,
    status: "closing",
    tags: ["Distributed Systems", "Backend", "Architecture", "Paid"],
    host: { name: "Aarav Mehta", role: "Staff Engineer, Fintech" },
    speakers: [
      { name: "Aarav Mehta", role: "Staff Engineer" },
    ],
    sponsors: [{ name: "Razorpay" }, { name: "Cred" }],
    faqs: [
      { q: "Is this for beginners?", a: "Some programming experience is required. You should know basic networking concepts." },
      { q: "Will I get a recording?", a: "Yes, all registered attendees get a 7-day recording access." },
    ],
    contactEmail: "workshops@enginow.io",
    about:
      "Learn the mental models used by senior engineers to design services that scale — queues, caches, sharding, and failure handling. Live coding, real diagrams, and a take-home exercise.",
    agenda: [
      { time: "00:00", title: "Fundamentals of scale", description: "Latency vs throughput and system SLOs." },
      { time: "00:45", title: "Data plane patterns", description: "Caches, queues, and consistency choices." },
      { time: "01:45", title: "Live design session", description: "Design a real-world system with the room." },
    ],
    perks: ["Recording access", "Design worksheets", "Certificate"],
  },
  {
    id: "e3",
    slug: "ai-product-webinar",
    title: "Building AI Products Users Love",
    tagline: "A 60-minute webinar with product leaders shipping AI at scale.",
    category: "Webinar",
    mode: "Online",
    location: "Live on Enginow",
    dateISO: "2026-07-05",
    dateLabel: "Jul 5, 2026",
    registrationDeadline: "2026-07-04",
    durationLabel: "60 min",
    price: "Free",
    seats: 2000,
    registered: 1587,
    cover: event3,
    status: "live",
    tags: ["AI", "Product Management", "Free", "Webinar"],
    host: { name: "Isha Rao", role: "Head of Product, AI Platform" },
    speakers: [
      { name: "Isha Rao", role: "Head of Product, AI Platform" },
      { name: "Vikram Sethi", role: "VP Engineering, OpenAI" },
    ],
    sponsors: [{ name: "Enginow" }],
    faqs: [
      { q: "Is this recorded?", a: "Yes, the recording will be shared within 24 hours." },
      { q: "Can I ask questions live?", a: "Yes, there is a 15-minute live Q&A at the end." },
    ],
    contactEmail: "webinars@enginow.io",
    about:
      "What separates AI features that stick from ones that don't? A candid conversation on evals, latency, trust, and product craft.",
    agenda: [
      { time: "00:00", title: "Opening + framing", description: "Where AI actually earns its keep." },
      { time: "00:15", title: "Panel discussion", description: "Product leaders on their hardest calls." },
      { time: "00:45", title: "Live Q&A", description: "Audience questions." },
    ],
    perks: ["Live Q&A", "Slides & recording"],
  },
  {
    id: "e4",
    slug: "frontend-bootcamp-2026",
    title: "Modern Frontend Bootcamp",
    tagline: "Four weekends. Ship a production-grade React + TypeScript app.",
    category: "Bootcamp",
    mode: "Online",
    location: "Cohort-based",
    dateISO: "2026-09-05",
    dateLabel: "Sep 5 – 28, 2026",
    registrationDeadline: "2026-09-01",
    durationLabel: "4 weeks",
    price: "₹4,999",
    seats: 120,
    registered: 46,
    cover: event4,
    status: "upcoming",
    tags: ["React", "TypeScript", "Frontend", "Bootcamp", "Paid"],
    host: { name: "Enginow Academy", role: "Verified Igniter" },
    speakers: [
      { name: "Sania Mirza", role: "Senior Frontend Engineer, Stripe" },
      { name: "Rohan Gupta", role: "Tech Lead, Notion" },
    ],
    sponsors: [{ name: "Enginow Academy" }, { name: "JetBrains" }],
    faqs: [
      { q: "What are the prerequisites?", a: "Basic HTML, CSS, and JavaScript knowledge is required." },
      { q: "Are sessions live?", a: "All sessions are live with recordings available for replay." },
      { q: "Is there a refund policy?", a: "Full refund within 7 days of purchase." },
    ],
    contactEmail: "academy@enginow.io",
    about:
      "A cohort-based bootcamp taught by working engineers. Weekly live sessions, code reviews, and a capstone project reviewed by mentors.",
    agenda: [
      { time: "Week 1", title: "Architecture", description: "Routing, state, and data patterns." },
      { time: "Week 2", title: "UI craft", description: "Design systems, motion, and a11y." },
      { time: "Week 3", title: "Data & auth", description: "Query patterns and secure auth flows." },
      { time: "Week 4", title: "Ship the capstone", description: "Deploy and demo." },
    ],
    perks: ["Live cohort", "Mentor reviews", "Capstone certificate", "Alumni network"],
  },
  {
    id: "e5",
    slug: "devfest-south-2026",
    title: "DevFest South 2026",
    tagline: "The regional gathering for engineers, designers, and builders.",
    category: "Conference",
    mode: "In-person",
    location: "HICC, Hyderabad",
    city: "Hyderabad",
    dateISO: "2026-11-08",
    dateLabel: "Nov 8, 2026",
    registrationDeadline: "2026-11-01",
    durationLabel: "1 day",
    price: "₹1,499",
    seats: 1200,
    registered: 803,
    cover: event5,
    status: "upcoming",
    tags: ["Conference", "Networking", "Paid", "In-person"],
    host: { name: "Enginow Communities", role: "Verified Igniter" },
    speakers: [
      { name: "Ananya Das", role: "Engineering Director, Flipkart" },
      { name: "Karan Mehta", role: "Founder, HealthAI" },
      { name: "Prerna Sinha", role: "Staff ML Engineer, Microsoft" },
    ],
    sponsors: [{ name: "Google" }, { name: "Microsoft" }, { name: "Hyderabad Angels" }],
    faqs: [
      { q: "Is food included?", a: "Lunch and coffee breaks are included in the ticket." },
      { q: "Can I bring my team?", a: "Yes, group tickets available at a 20% discount." },
    ],
    contactEmail: "devfest@enginow.io",
    about:
      "A full-day conference with talks, workshops, and side quests. Meet founders, engineers, and the people building the next wave of technology in India.",
    agenda: [
      { time: "09:30", title: "Registration & coffee", description: "Pick up your badge." },
      { time: "10:15", title: "Keynote", description: "State of the ecosystem." },
      { time: "12:00", title: "Talks & workshops", description: "Parallel tracks." },
      { time: "18:00", title: "After hours", description: "Networking dinner." },
    ],
    perks: ["Full-day access", "Swag", "Recorded talks", "After-party"],
  },
  {
    id: "e6",
    slug: "engineers-meetup-blr",
    title: "Engineers Meetup — Bengaluru",
    tagline: "A curated monthly meetup for engineers building at frontier companies.",
    category: "Meetup",
    mode: "In-person",
    location: "WeWork, Bengaluru",
    city: "Bengaluru",
    dateISO: "2026-07-19",
    dateLabel: "Jul 19, 2026",
    registrationDeadline: "2026-07-18",
    durationLabel: "3 hours",
    price: "Free",
    seats: 120,
    registered: 118,
    cover: event6,
    status: "closing",
    tags: ["Networking", "Free", "In-person", "Bengaluru"],
    host: { name: "Enginow Communities", role: "Verified Igniter" },
    speakers: [],
    sponsors: [{ name: "WeWork India" }],
    faqs: [
      { q: "Is this invite-only?", a: "No, but seats are limited to 120 so register early." },
    ],
    contactEmail: "meetups@enginow.io",
    about:
      "An intimate, invite-only gathering with lightning talks and open conversations. High signal, low noise.",
    agenda: [
      { time: "18:30", title: "Doors", description: "Coffee and intros." },
      { time: "19:00", title: "Lightning talks", description: "Three 10-minute talks." },
      { time: "20:00", title: "Open discussion", description: "Roundtable conversation." },
    ],
    perks: ["Community access", "Curated attendee list"],
  },
];

export const categories: (EventCategory | "All")[] = [
  "All",
  "Hackathon",
  "Workshop",
  "Webinar",
  "Bootcamp",
  "Conference",
  "Meetup",
  "AI / ML",
  "Web Development",
  "Cloud & DevOps",
  "Cyber Security",
  "Robotics",
  "Data Science",
  "UI/UX Design",
  "Startup",
  "Career",
  "College Festival",
  "Networking",
];

export const categoryMeta: Record<string, { icon: string; description: string; color: string }> = {
  Hackathon: { icon: "⚡", description: "Build & compete", color: "from-violet-500/20 to-purple-500/20 border-violet-500/20" },
  Workshop: { icon: "🛠️", description: "Hands-on sessions", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20" },
  Webinar: { icon: "🎙️", description: "Expert live talks", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" },
  Bootcamp: { icon: "🚀", description: "Intensive cohorts", color: "from-orange-500/20 to-amber-500/20 border-orange-500/20" },
  Conference: { icon: "🏛️", description: "Industry summits", color: "from-rose-500/20 to-pink-500/20 border-rose-500/20" },
  Meetup: { icon: "🤝", description: "Community gatherings", color: "from-sky-500/20 to-blue-500/20 border-sky-500/20" },
  "AI / ML": { icon: "🤖", description: "Artificial intelligence", color: "from-violet-500/20 to-indigo-500/20 border-violet-500/20" },
  "Web Development": { icon: "💻", description: "Frontend & backend", color: "from-blue-500/20 to-sky-500/20 border-blue-500/20" },
  "Cloud & DevOps": { icon: "☁️", description: "Infrastructure & CI/CD", color: "from-cyan-500/20 to-teal-500/20 border-cyan-500/20" },
  "Cyber Security": { icon: "🔐", description: "Security & privacy", color: "from-red-500/20 to-rose-500/20 border-red-500/20" },
  Robotics: { icon: "🦾", description: "Hardware & automation", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20" },
  "Data Science": { icon: "📊", description: "Analytics & insights", color: "from-purple-500/20 to-violet-500/20 border-purple-500/20" },
  "UI/UX Design": { icon: "🎨", description: "Design & prototyping", color: "from-pink-500/20 to-rose-500/20 border-pink-500/20" },
  Startup: { icon: "🌱", description: "Entrepreneurship", color: "from-green-500/20 to-emerald-500/20 border-green-500/20" },
  Career: { icon: "💼", description: "Jobs & growth", color: "from-slate-500/20 to-gray-500/20 border-slate-500/20" },
  "College Festival": { icon: "🎓", description: "Campus fests", color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/20" },
  Networking: { icon: "🌐", description: "Connect & grow", color: "from-teal-500/20 to-emerald-500/20 border-teal-500/20" },
};
