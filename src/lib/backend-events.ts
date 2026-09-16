import type { EventItem } from "@/data/events";
import { db } from "@/server/db";

export type BackendEvent = EventItem & {
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  rejectionReason?: string;
  organizerId: string;
  organizerName: string;
  isFeatured?: boolean;
  registrationsOpen: boolean;
};

const fallbackEvents: BackendEvent[] = [
  {
    id: "e1",
    slug: "quantum-hack-2026",
    title: "Quantum Hack 2026",
    tagline: "48-hour global hackathon exploring quantum algorithms and quantum-safe cryptography.",
    category: "Hackathon",
    mode: "Hybrid",
    location: "Bengaluru, India + Virtual",
    city: "Bengaluru",
    dateISO: "2026-08-14",
    dateLabel: "Aug 14 – 16, 2026",
    registrationDeadline: "2026-08-10",
    durationLabel: "48 hours",
    price: "Free",
    prize: "₹15,00,000",
    seats: 500,
    registered: 382,
    cover: "/src/assets/event-1.jpg",
    status: "live",
    tags: ["Quantum", "Cryptography", "AI", "Global"],
    host: { name: "Quantum Labs India", role: "Organizer", avatar: "" },
    speakers: [],
    sponsors: [],
    faqs: [],
    contactEmail: "hack@quantumlabs.in",
    about: "Build the future of quantum computing.",
    agenda: [{ time: "Day 1 · 10:00", title: "Kickoff", description: "Opening session" }],
    perks: ["₹15L prize pool", "Mentorship", "Swag kits"],
    approvalStatus: "published",
    organizerId: "usr_org_1",
    organizerName: "DevSphere Foundation",
    isFeatured: true,
    registrationsOpen: true,
  },
];

export async function readBackendEvents(): Promise<BackendEvent[]> {
  return db.getEvents(fallbackEvents);
}

export async function writeBackendEvents(events: BackendEvent[]) {
  return db.setEvents(events);
}
