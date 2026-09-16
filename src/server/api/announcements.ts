import { db } from "../db";
import type { Announcement } from "@/lib/platform-store";
import { requireRole } from "../auth";

export async function handleAnnouncementsApi(
  request: Request,
  pathParts: string[],
): Promise<Response> {
  const method = request.method;
  const id = pathParts[2]; // e.g. /api/announcements/ann_1

  if (method === "GET") {
    const announcements = await db.getAnnouncements();
    return Response.json(announcements);
  }

  if (method === "POST") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    const body = (await request.json()) as {
      title: string;
      message: string;
      type?: "info" | "success" | "warning";
    };

    if (!body.title || !body.message) {
      return Response.json({ error: "Title and message are required" }, { status: 400 });
    }

    const announcements = await db.getAnnouncements();
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newAnnouncement, ...announcements];
    await db.setAnnouncements(updated);
    return Response.json(newAnnouncement, { status: 201 });
  }

  if (method === "DELETE") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    if (!id) return Response.json({ error: "Missing announcement ID" }, { status: 400 });

    const announcements = await db.getAnnouncements();
    const filtered = announcements.filter((a) => a.id !== id);
    if (filtered.length === announcements.length) {
      return Response.json({ error: "Announcement not found" }, { status: 404 });
    }

    await db.setAnnouncements(filtered);
    return Response.json({ success: true, removedId: id });
  }

  if (method === "PUT") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    const body = await request.json();
    if (Array.isArray(body)) {
      const saved = await db.setAnnouncements(body as Announcement[]);
      return Response.json(saved);
    }
    return Response.json({ error: "Expected array of announcements" }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
