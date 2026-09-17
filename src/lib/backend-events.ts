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

import { events as staticEvents } from "@/data/events";

export const defaultBackendEvents: BackendEvent[] = staticEvents.map((e, idx) => ({
  ...e,
  approvalStatus: "published" as const,
  organizerId: idx % 2 === 0 ? "usr_org_1" : "usr_org_2",
  organizerName: idx % 2 === 0 ? "DevSphere Foundation" : "OpenKernel Community",
  isFeatured: idx < 3,
  registrationsOpen: e.status !== "ended",
}));

export async function readBackendEvents(): Promise<BackendEvent[]> {
  return db.getEvents(defaultBackendEvents);
}

export async function writeBackendEvents(events: BackendEvent[]) {
  return db.setEvents(events);
}
