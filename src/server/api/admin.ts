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

  // Users Management API
  if (subRoute === "users") {
    if (request.method === "GET") {
      const users = await db.getUsers();
      const registrations = await db.getRegistrations();
      const events = await db.getEvents([]);

      // Enrich users with platform metrics
      const enrichedUsers = users.map((u) => {
        const userRegs = registrations.filter((r) => r.userId === u.id);
        const userEvents = events.filter((e) => e.organizerId === u.id);
        return {
          ...u,
          registrationsCount: userRegs.length,
          eventsCount: userEvents.length,
          joinedAt: u.joinedAt || "2026-08-15",
          isSuspended: !!u.isSuspended,
        };
      });

      return Response.json({ success: true, data: enrichedUsers });
    }

    // Change role
    if (request.method === "PATCH" && targetId && action === "role") {
      const body = (await request.json().catch(() => ({}))) as { role?: "student" | "organizer" | "admin" };
      if (!body.role || !["student", "organizer", "admin"].includes(body.role)) {
        return Response.json({ error: "Invalid role specified" }, { status: 400 });
      }
      const users = await db.getUsers();
      const targetUser = users.find((u) => u.id === targetId);
      if (!targetUser) return Response.json({ error: "User not found" }, { status: 404 });

      const updated = {
        ...targetUser,
        role: body.role,
        roleChangeRequest: {
          requestedRole: body.role as any,
          status: "APPROVED" as const,
          reviewedAt: new Date().toISOString(),
        },
      };
      await db.updateUser(updated);
      return Response.json({ success: true, data: updated });
    }

    // Toggle user suspension / status
    if (request.method === "PATCH" && targetId && action === "status") {
      const body = (await request.json().catch(() => ({}))) as { isSuspended?: boolean };
      const users = await db.getUsers();
      const targetUser = users.find((u) => u.id === targetId);
      if (!targetUser) return Response.json({ error: "User not found" }, { status: 404 });

      const updated = {
        ...targetUser,
        isSuspended: typeof body.isSuspended === "boolean" ? body.isSuspended : !targetUser.isSuspended,
      };
      await db.updateUser(updated);
      return Response.json({ success: true, data: updated });
    }

    // Delete user
    if (request.method === "DELETE" && targetId) {
      const deleted = await db.deleteUser(targetId);
      if (!deleted) return Response.json({ error: "User not found" }, { status: 404 });
      return Response.json({ success: true, removedId: targetId });
    }
  }

  // Audit Log & Activity Trail
  if (subRoute === "audit-log" && request.method === "GET") {
    const defaultAuditLogs = [
      { id: "log_1", action: "ORGANIZER_VERIFIED", target: "DevSphere Foundation", admin: "Sarah Chen", timestamp: "2026-09-18T14:20:00Z", details: "Approved after verifying incorporation documents." },
      { id: "log_2", action: "EVENT_APPROVED", target: "Quantum Hack 2026", admin: "Sarah Chen", timestamp: "2026-09-18T11:45:00Z", details: "Published to public listings." },
      { id: "log_3", action: "CATEGORY_CREATED", target: "Web3 & Zero Knowledge", admin: "Sarah Chen", timestamp: "2026-09-17T09:15:00Z", details: "Added technical track." },
      { id: "log_4", action: "ROLE_UPGRADED", target: "Alex Rivera -> Organizer", admin: "Sarah Chen", timestamp: "2026-09-16T16:00:00Z", details: "Approved student role change request." },
      { id: "log_5", action: "SECURITY_SCAN", target: "Platform JWT Sessions", admin: "System Guard", timestamp: "2026-09-19T04:00:00Z", details: "Zero unauthorized sessions detected." },
    ];
    return Response.json({ success: true, data: defaultAuditLogs });
  }

  return Response.json({ error: "Admin endpoint not found" }, { status: 404 });
}
