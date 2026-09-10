import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

export type EventCategory = "Hackathon" | "Workshop" | "Webinar" | "Bootcamp" | "Conference" | "Meetup";

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: EventCategory;
  mode: "Online" | "In-person" | "Hybrid";
  location: string;
  dateISO: string;
  dateLabel: string;
  durationLabel: string;
  price: "Free" | string;
  prize?: string;
  seats: number;
  registered: number;
  cover: string;
  status: "live" | "closing" | "upcoming";
  host: { name: string; role: string };
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
    dateISO: "2026-08-14",
    dateLabel: "Aug 14 – 16, 2026",
    durationLabel: "48 hours",
    price: "Free",
    prize: "₹10,00,000 prize pool",
    seats: 800,
    registered: 612,
    cover: event1,
    status: "live",
    host: { name: "Enginow Labs", role: "Verified Igniter" },
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
    durationLabel: "3 hours",
    price: "₹499",
    seats: 300,
    registered: 214,
    cover: event2,
    status: "closing",
    host: { name: "Aarav Mehta", role: "Staff Engineer, Fintech" },
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
    durationLabel: "60 min",
    price: "Free",
    seats: 2000,
    registered: 1587,
    cover: event3,
    status: "live",
    host: { name: "Isha Rao", role: "Head of Product, AI Platform" },
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
    durationLabel: "4 weeks",
    price: "₹4,999",
    seats: 120,
    registered: 46,
    cover: event4,
    status: "upcoming",
    host: { name: "Enginow Academy", role: "Verified Igniter" },
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
    location: "Hyderabad",
    dateISO: "2026-11-08",
    dateLabel: "Nov 8, 2026",
    durationLabel: "1 day",
    price: "₹1,499",
    seats: 1200,
    registered: 803,
    cover: event5,
    status: "upcoming",
    host: { name: "Enginow Communities", role: "Verified Igniter" },
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
    location: "Bengaluru",
    dateISO: "2026-07-19",
    dateLabel: "Jul 19, 2026",
    durationLabel: "3 hours",
    price: "Free",
    seats: 120,
    registered: 118,
    cover: event6,
    status: "closing",
    host: { name: "Enginow Communities", role: "Verified Igniter" },
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
];
