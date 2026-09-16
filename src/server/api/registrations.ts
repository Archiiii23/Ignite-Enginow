import { db } from "../db";
import { readBackendEvents, writeBackendEvents } from "@/lib/backend-events";
import type { Registration } from "@/lib/platform-store";
import { requireRole } from "../auth";

export async function handleRegistrationsApi(
  request: Request,
  pathParts: string[],
): Promise<Response> {
  const method = request.method;
  const id = pathParts[2]; // e.g. /api/registrations/reg_123

  if (method === "GET") {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const eventId = url.searchParams.get("eventId");
    let registrations = await db.getRegistrations();

    if (id) {
      const reg = registrations.find((r) => r.id === id);
      if (!reg) return Response.json({ error: "Registration not found" }, { status: 404 });
      return Response.json(reg);
    }

    if (userId) {
      registrations = registrations.filter((r) => r.userId === userId);
    }
    if (eventId) {
      registrations = registrations.filter((r) => r.eventId === eventId);
    }

    return Response.json(registrations);
  }

  if (method === "POST") {
    const auth = await requireRole(request, ["student"]);
    if (auth.response) return auth.response;
    const body = (await request.json()) as {
      eventId: string;
      userId?: string;
      userName?: string;
      userEmail?: string;
      college?: string;
    };

    if (!body.eventId) {
      return Response.json({ error: "Missing eventId" }, { status: 400 });
    }

    const events = await readBackendEvents();
    const event = events.find((e) => e.id === body.eventId || e.slug === body.eventId);
    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    const registrations = await db.getRegistrations();
    const uid = auth.user.id;

    // Check if already registered
    const existing = registrations.find(
      (r) =>
        (r.eventId === event.id || r.eventId === event.slug) &&
        r.userId === uid &&
        r.status !== "cancelled",
    );
    if (existing) {
      return Response.json(existing, { status: 200 });
    }

    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const seatRand = Math.floor(10 + Math.random() * 90);
    const catCode = (event.category || "EVT").slice(0, 3).toUpperCase();

    const newRegistration: Registration = {
      id: `reg_${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.dateLabel,
      eventLocation: event.location,
      userId: uid,
      userName: body.userName || "Participant",
      userEmail: body.userEmail || "participant@example.com",
      college: body.college || "Global Tech University",
      registeredAt: new Date().toISOString(),
      status: "confirmed",
      ticketCode: `IGN-${catCode}-${randDigits}`,
      seatNumber: `${catCode}-${seatRand}`,
    };

    const updatedRegistrations = [newRegistration, ...registrations];
    await db.setRegistrations(updatedRegistrations);

    // Increment registered count on event
    const updatedEvents = events.map((e) =>
      e.id === event.id ? { ...e, registered: (e.registered || 0) + 1 } : e,
    );
    await writeBackendEvents(updatedEvents);

    return Response.json(newRegistration, { status: 201 });
  }

  if (method === "DELETE") {
    const auth = await requireRole(request, ["student", "admin"]);
    if (auth.response) return auth.response;
    if (!id) {
      return Response.json({ error: "Missing registration ID" }, { status: 400 });
    }

    const registrations = await db.getRegistrations();
    const target = registrations.find((r) => r.id === id);
    if (!target) {
      return Response.json({ error: "Registration not found" }, { status: 404 });
    }
    if (auth.user.role !== "admin" && target.userId !== auth.user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const updated = registrations.filter((r) => r.id !== id);
    await db.setRegistrations(updated);

    // Decrement registered count on event
    const events = await readBackendEvents();
    const updatedEvents = events.map((e) =>
      e.id === target.eventId ? { ...e, registered: Math.max(0, (e.registered || 1) - 1) } : e,
    );
    await writeBackendEvents(updatedEvents);

    return Response.json({ success: true, removedId: id });
  }

  if (method === "PATCH") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    if (!id) {
      return Response.json({ error: "Missing registration ID" }, { status: 400 });
    }

    const body = (await request.json()) as Partial<Registration>;
    const registrations = await db.getRegistrations();
    const index = registrations.findIndex((r) => r.id === id);
    if (index === -1) {
      return Response.json({ error: "Registration not found" }, { status: 404 });
    }
    if (auth.user.role !== "admin") {
      const events = await readBackendEvents();
      const event = events.find((item) => item.id === registrations[index].eventId);
      if (event?.organizerId !== auth.user.id)
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    registrations[index] = { ...registrations[index], ...body };
    await db.setRegistrations(registrations);
    return Response.json(registrations[index]);
  }

  if (method === "PUT") {
    const auth = await requireRole(request, ["student", "organizer", "admin"]);
    if (auth.response) return auth.response;
    const body = await request.json();
    if (Array.isArray(body)) {
      const incoming = body as Registration[];
      const current = await db.getRegistrations();
      const saved =
        auth.user.role === "admin"
          ? await db.setRegistrations(incoming)
          : await db.setRegistrations(
              current.map((registration) => {
                const candidate = incoming.find((item) => item.id === registration.id);
                if (!candidate) return registration;
                if (auth.user.role === "student")
                  return candidate.userId === auth.user.id
                    ? { ...registration, ...candidate, userId: auth.user.id }
                    : registration;
                return registration;
              }),
            );
      return Response.json(saved);
    }
    return Response.json({ error: "Expected array of registrations" }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
