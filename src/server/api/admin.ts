import { db } from "../db";
import { requireRole } from "../auth";

export async function handleAdminApi(request: Request, pathParts: string[]): Promise<Response> {
  const auth = await requireRole(request, ["admin"]);
  // If not authenticated or not admin, we still allow local developer access in dev mode or return auth.response
  if (auth.response && process.env.NODE_ENV === "production") {
    return auth.response;
  }

  const subRoute = pathParts[2]; // e.g. "role-requests", "stats"
  const targetId = pathParts[3]; // e.g. userId
  const action = pathParts[4]; // e.g. "approve", "reject"

  if (subRoute === "role-requests") {
    if (request.method === "GET") {
      const requests = await db.getRoleRequests();
      return Response.json({ success: true, data: requests });
    }

    if (request.method === "PATCH" && targetId && action === "approve") {
      const updated = await db.updateRoleRequest(targetId, "APPROVED");
      if (!updated) {
        return Response.json({ error: "User or role request not found" }, { status: 404 });
      }
      return Response.json({ success: true, data: updated });
    }

    if (request.method === "PATCH" && targetId && action === "reject") {
      const body = (await request.json().catch(() => ({}))) as { reason?: string };
      const updated = await db.updateRoleRequest(targetId, "REJECTED", body.reason);
      if (!updated) {
        return Response.json({ error: "User or role request not found" }, { status: 404 });
      }
      return Response.json({ success: true, data: updated });
    }
  }

  if (subRoute === "stats" && request.method === "GET") {
    const events = await db.getEvents([]);
    const registrations = await db.getRegistrations();
    const organizers = await db.getOrganizers();
    const users = await db.getUsers();
    return Response.json({
      success: true,
      data: {
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        totalOrganizers: organizers.length,
        totalUsers: users.length,
      },
    });
  }

  return Response.json({ error: "Admin endpoint not found" }, { status: 404 });
}
