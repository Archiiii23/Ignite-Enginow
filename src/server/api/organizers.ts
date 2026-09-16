import { db } from "../db";
import type { OrganizerRecord } from "@/lib/platform-store";
import { requireRole } from "../auth";

export async function handleOrganizersApi(
  request: Request,
  pathParts: string[],
): Promise<Response> {
  const method = request.method;
  const id = pathParts[2]; // e.g. /api/organizers/org_rec_1

  if (method === "GET") {
    const organizers = await db.getOrganizers();
    if (id) {
      const org = organizers.find((o) => o.id === id || o.userId === id);
      if (!org) return Response.json({ error: "Organizer not found" }, { status: 404 });
      return Response.json(org);
    }
    return Response.json(organizers);
  }

  if (method === "POST") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    const body = (await request.json()) as Partial<OrganizerRecord>;
    const organizers = await db.getOrganizers();
    const userId = auth.user.role === "organizer" ? auth.user.id : body.userId || auth.user.id;

    const existingIndex = organizers.findIndex((o) => o.userId === userId || o.id === body.id);
    if (existingIndex !== -1) {
      organizers[existingIndex] = {
        ...organizers[existingIndex],
        ...body,
        verificationStatus: body.verificationStatus || "pending",
      };
      await db.setOrganizers(organizers);
      return Response.json(organizers[existingIndex]);
    }

    const newOrganizer: OrganizerRecord = {
      id: body.id || `org_${Date.now()}`,
      userId,
      name: body.name || "New Organizer",
      email: body.email || "org@example.com",
      orgName: body.orgName || body.name || "Organization",
      website: body.website || "https://example.org",
      verificationStatus: body.verificationStatus || "pending",
      documentsSubmitted: body.documentsSubmitted || "Official credentials provided",
      eventsCount: body.eventsCount || 0,
      joinedAt: body.joinedAt || new Date().toISOString().split("T")[0],
    };

    const updated = [newOrganizer, ...organizers];
    await db.setOrganizers(updated);
    return Response.json(newOrganizer, { status: 201 });
  }

  if (method === "PATCH") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    if (!id) {
      return Response.json({ error: "Missing organizer ID" }, { status: 400 });
    }

    const body = (await request.json()) as Partial<OrganizerRecord>;
    const organizers = await db.getOrganizers();
    const index = organizers.findIndex((o) => o.id === id || o.userId === id);
    if (index === -1) {
      return Response.json({ error: "Organizer not found" }, { status: 404 });
    }
    if (auth.user.role !== "admin" && organizers[index].userId !== auth.user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    organizers[index] =
      auth.user.role === "admin"
        ? { ...organizers[index], ...body }
        : {
            ...organizers[index],
            documentsSubmitted: body.documentsSubmitted,
            verificationStatus: "pending",
          };
    await db.setOrganizers(organizers);
    return Response.json(organizers[index]);
  }

  if (method === "PUT") {
    const auth = await requireRole(request, ["organizer", "admin"]);
    if (auth.response) return auth.response;
    const body = await request.json();
    if (Array.isArray(body)) {
      const incoming = body as OrganizerRecord[];
      const current = await db.getOrganizers();
      const saved =
        auth.user.role === "admin"
          ? await db.setOrganizers(incoming)
          : await db.setOrganizers(
              current.map(
                (organizer) =>
                  incoming.find(
                    (item) => item.id === organizer.id && item.userId === auth.user.id,
                  ) ?? organizer,
              ),
            );
      return Response.json(saved);
    }
    return Response.json({ error: "Expected array of organizers" }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
