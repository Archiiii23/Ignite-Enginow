import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { EventItem } from "@/data/events";

export type BackendEvent = EventItem & {
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  rejectionReason?: string;
  organizerId: string;
  organizerName: string;
  isFeatured?: boolean;
  registrationsOpen: boolean;
};

const dataPath = join(process.cwd(), "data", "events.json");

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

async function ensureDataFile() {
  try {
    await readFile(dataPath, "utf8");
  } catch {
    await mkdir(dirname(dataPath), { recursive: true });
    await writeFile(dataPath, JSON.stringify(fallbackEvents, null, 2), "utf8");
  }
}

export async function readBackendEvents(): Promise<BackendEvent[]> {
  await ensureDataFile();
  return JSON.parse(await readFile(dataPath, "utf8")) as BackendEvent[];
}

export async function writeBackendEvents(events: BackendEvent[]) {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(events, null, 2), "utf8");
  return events;
}