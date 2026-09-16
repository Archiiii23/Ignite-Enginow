import {
  createSession,
  clearSessionCookie,
  getAuthenticatedUser,
  getSessionHash,
  hashPassword,
  verifyPassword,
  withSession,
} from "../auth";
import { db } from "../db";
import type { UserProfile } from "@/lib/auth-context";

function validPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8;
}

export async function handleAuthApi(request: Request, pathParts: string[]): Promise<Response> {
  const subRoute = pathParts[2];

  if (request.method === "GET" && subRoute === "session") {
    return Response.json({ user: await getAuthenticatedUser(request) });
  }

  if (request.method === "POST" && subRoute === "signup") {
    const body = (await request.json()) as { name?: string; email?: string; password?: string };
    if (!body.name?.trim() || !body.email?.trim() || !validPassword(body.password)) {
      return Response.json(
        { error: "Name, email, and a password of at least 8 characters are required" },
        { status: 400 },
      );
    }
    if (await db.getUserByEmail(body.email))
      return Response.json({ error: "An account already exists for that email" }, { status: 409 });
    const profile: UserProfile = {
      id: `usr_${crypto.randomUUID()}`,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "student",
    };
    await db.createUser(profile, await hashPassword(body.password));
    return withSession(Response.json(profile, { status: 201 }), await createSession(profile.id));
  }

  if (request.method === "POST" && subRoute === "login") {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !validPassword(body.password))
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    const account = await db.getUserByEmail(body.email);
    if (!account || !(await verifyPassword(body.password, account.passwordHash)))
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    return withSession(Response.json(account.profile), await createSession(account.profile.id));
  }

  if (request.method === "POST" && subRoute === "logout") {
    const sessionHash = getSessionHash(request);
    if (sessionHash) await db.deleteSession(sessionHash);
    const response = Response.json({ success: true });
    response.headers.set("set-cookie", clearSessionCookie());
    return response;
  }

  if (request.method === "GET" && subRoute === "users") {
    const user = await getAuthenticatedUser(request);
    if (user?.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: user ? 403 : 401 });
    return Response.json(await db.getUsers());
  }

  if (request.method === "PATCH" && subRoute === "profile") {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const body = (await request.json()) as Partial<UserProfile>;
    const updated: UserProfile = {
      ...user,
      ...body,
      id: user.id,
      role: user.role,
      email: user.email,
    };
    await db.updateUser(updated);
    return Response.json(updated);
  }

  return Response.json({ error: "Endpoint not found" }, { status: 404 });
}
