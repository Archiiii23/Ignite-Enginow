import { readBackendEvents, writeBackendEvents, type BackendEvent } from "@/lib/backend-events";
import { requireRole } from "../auth";

export async function handleEventsApi(request: Request, pathParts: string[]): Promise<Response> {
  const method = request.method;
  const idOrSlug = pathParts[2]; // e.g. /api/events/quantum-hack-2026 or /api/events/e1

  if (method === "GET") {
    const events = await readBackendEvents();
    if (!idOrSlug) {
      const url = new URL(request.url);
      const category = url.searchParams.get("category");
      const organizerId = url.searchParams.get("organizerId");
      const status = url.searchParams.get("status");

      let filtered = events;
      if (category) {
        filtered = filtered.filter((e) => e.category.toLowerCase() === category.toLowerCase());
      }
      if (organizerId) {
        filtered = filtered.filter((e) => e.organizerId === organizerId);
      }
      if (status) {
        filtered = filtered.filter((e) => e.status === status || e.approvalStatus === status);
      }
      return Response.json(filtered);
    }

    const event = events.find((e) => e.slug === idOrSlug || e.id === idOrSlug);
    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    return Response.json(event);
  }

  if (method === "POST") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    const body = (await request.json()) as Partial<BackendEvent>;
    const events = await readBackendEvents();
    const id = body.id || `ev_${Date.now()}`;
    const slug =
      body.slug ||
      (body.title || "new-event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newEvent: BackendEvent = {
      id,
      slug,
      title: body.title || "Untitled Event",
      tagline: body.tagline || "An exciting technical experience.",
      category: body.category || "Hackathon",
      mode: body.mode || "Online",
      location: body.location || "Virtual",
      city: body.city,
      dateISO: body.dateISO || new Date().toISOString().split("T")[0],
      dateLabel: body.dateLabel || "Upcoming 2026",
      registrationDeadline: body.registrationDeadline,
      durationLabel: body.durationLabel || "24 hours",
      price: body.price || "Free",
      prize: body.prize,
      seats: body.seats || 250,
      registered: body.registered || 0,
      cover: body.cover || "/src/assets/event-1.jpg",
      status: body.status || "upcoming",
      tags: body.tags || ["Technical", "Innovation"],
      host: body.host || { name: "Enginow Communities", role: "Verified Igniter" },
      speakers: body.speakers || [],
      sponsors: body.sponsors || [],
      faqs: body.faqs || [],
      contactEmail: body.contactEmail || "events@enginow.io",
      about: body.about || "Detailed description coming soon.",
      agenda: body.agenda || [
        { time: "Day 1 · 10:00", title: "Opening Kickoff", description: "Welcome note" },
      ],
      perks: body.perks || ["Verified Certificate", "Community Access"],
      approvalStatus: body.approvalStatus || "draft",
      rejectionReason: body.rejectionReason,
      organizerId: auth.user.role === "organizer" ? auth.user.id : body.organizerId || auth.user.id,
      organizerName:
        auth.user.role === "organizer" ? auth.user.name : body.organizerName || auth.user.name,
      isFeatured: body.isFeatured || false,
      registrationsOpen: body.registrationsOpen ?? true,
    };

    const updated = [newEvent, ...events];
    await writeBackendEvents(updated);
    return Response.json(newEvent, { status: 201 });
  }

  if (method === "PUT") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    // Bulk replace OR single item update
    const body = await request.json();
    if (Array.isArray(body)) {
      const existing = await readBackendEvents();
      const saved =
        auth.user.role === "admin"
          ? await writeBackendEvents(body as BackendEvent[])
          : await writeBackendEvents(
              existing.map(
                (event) =>
                  (body as BackendEvent[]).find(
                    (item) => item.id === event.id && item.organizerId === auth.user.id,
                  ) ?? event,
              ),
            );
      return Response.json(saved);
    }

    if (!idOrSlug) {
      return Response.json({ error: "Missing event ID or slug" }, { status: 400 });
    }

    const events = await readBackendEvents();
    const index = events.findIndex((e) => e.id === idOrSlug || e.slug === idOrSlug);
    if (index === -1) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    if (auth.user.role !== "admin" && events[index].organizerId !== auth.user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    events[index] = { ...events[index], ...(body as Partial<BackendEvent>) };
    await writeBackendEvents(events);
    return Response.json(events[index]);
  }

  if (method === "PATCH") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    if (!idOrSlug) {
      return Response.json({ error: "Missing event ID or slug" }, { status: 400 });
    }

    const body = (await request.json()) as Partial<BackendEvent>;
    const events = await readBackendEvents();
    const index = events.findIndex((e) => e.id === idOrSlug || e.slug === idOrSlug);
    if (index === -1) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    if (auth.user.role !== "admin" && events[index].organizerId !== auth.user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    events[index] = { ...events[index], ...body };
    await writeBackendEvents(events);
    return Response.json(events[index]);
  }

  if (method === "DELETE") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    if (!idOrSlug) {
      return Response.json({ error: "Missing event ID" }, { status: 400 });
    }

    const events = await readBackendEvents();
    const filtered = events.filter((e) => e.id !== idOrSlug && e.slug !== idOrSlug);
    if (filtered.length === events.length) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    const target = events.find((event) => event.id === idOrSlug || event.slug === idOrSlug);
    if (auth.user.role !== "admin" && target?.organizerId !== auth.user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    await writeBackendEvents(filtered);
    return Response.json({ success: true, removedId: idOrSlug });
  }

  if (method === "PUT") {
    const body = await request.json();
    if (Array.isArray(body)) {
      const incoming = body as BackendEvent[];
      await writeBackendEvents(incoming);
      return Response.json(incoming);
    }
    return Response.json({ error: "Expected array of events" }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
