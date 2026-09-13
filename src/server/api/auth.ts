import { db } from "../db";
import type { UserProfile, UserRole } from "@/lib/auth-context";

export async function handleAuthApi(request: Request, pathParts: string[]): Promise<Response> {
  const method = request.method;
  const subRoute = pathParts[2]; // e.g. /api/auth/login, /api/auth/signup, /api/auth/profile, /api/auth/users

  if (method === "GET" && subRoute === "users") {
    const users = await db.getUsers();
    return Response.json(users);
  }

  if (method === "POST" && subRoute === "login") {
    const body = (await request.json()) as { email: string; role?: UserRole };
    const users = await db.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());

    if (!user) {
      const role: UserRole = body.role || "student";
      user = {
        id: `usr_${Date.now()}`,
        name: body.email.split("@")[0],
        email: body.email,
        role,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      };
      await db.setUsers([user, ...users]);
    }

    return Response.json(user);
  }

  if (method === "POST" && subRoute === "signup") {
    const body = (await request.json()) as { name: string; email: string; role: UserRole };
    const users = await db.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());

    if (user) {
      return Response.json(user);
    }

    user = {
      id: `usr_${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role || "student",
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    await db.setUsers([user, ...users]);
    return Response.json(user, { status: 201 });
  }

  if (method === "PATCH" && subRoute === "profile") {
    const body = (await request.json()) as Partial<UserProfile> & { id: string };
    if (!body.id) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const users = await db.getUsers();
    const index = users.findIndex((u) => u.id === body.id);
    if (index === -1) {
      // create if not exists
      const newUser = body as UserProfile;
      await db.setUsers([newUser, ...users]);
      return Response.json(newUser);
    }

    users[index] = { ...users[index], ...body };
    await db.setUsers(users);
    return Response.json(users[index]);
  }

  return Response.json({ error: "Endpoint not found" }, { status: 404 });
}
