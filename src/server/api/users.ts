import { getAuthenticatedUser } from "../auth";
import { db } from "../db";
import type { UserProfile } from "@/lib/auth-context";

export async function handleUsersApi(request: Request, pathParts: string[]): Promise<Response> {
  const subRoute = pathParts[2]; // "me" or userId

  if (subRoute === "me") {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    if (request.method === "GET") {
      return Response.json({ success: true, data: user });
    }

    if (request.method === "PATCH") {
      const body = (await request.json().catch(() => ({}))) as Partial<UserProfile>;
      const updated: UserProfile = {
        ...user,
        ...body,
        id: user.id,
      };
      await db.updateUser(updated);
      return Response.json({ success: true, data: updated });
    }
  }

  if (request.method === "GET") {
    const allUsers = await db.getUsers();
    return Response.json({ success: true, data: allUsers });
  }

  return Response.json({ error: "User endpoint not found" }, { status: 404 });
}
