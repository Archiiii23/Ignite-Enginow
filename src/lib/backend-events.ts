import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { events as seedEvents, type EventItem } from "@/data/events";

export type BackendEvent = EventItem & {
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  organizerId: string;
  organizerName: string;
  isFeatured?: boolean;
  registrationsOpen: boolean;
};

const dataPath = join(process.cwd(), "data", "events.json");

const seedBackendEvents: BackendEvent[] = seedEvents.map((event, index) => ({
  ...event,
  approvalStatus: "published",
  organizerId: index % 2 === 0 ? "usr_org_1" : "usr_org_2",
  organizerName: index % 2 === 0 ? "DevSphere Foundation" : "OpenKernel Community",
  isFeatured: index < 3,
  registrationsOpen: event.status !== "closing",
}));

async function ensureDataFile() {
  try {
    await readFile(dataPath, "utf8");
  } catch {
    await mkdir(dirname(dataPath), { recursive: true });
    await writeFile(dataPath, JSON.stringify(seedBackendEvents, null, 2), "utf8");
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