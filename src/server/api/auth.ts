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
import type { UserProfile, UserRole } from "@/lib/auth-context";

function validPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8;
}

export async function handleAuthApi(request: Request, pathParts: string[]): Promise<Response> {
  const subRoute = pathParts[2];

  // Current session/me
  if (request.method === "GET" && (subRoute === "session" || subRoute === "me")) {
    const user = await getAuthenticatedUser(request);
    return Response.json({ success: !!user, data: user, user });
  }

  // Developer Demo Login
  if (request.method === "POST" && subRoute === "demo-login") {
    const body = (await request.json().catch(() => ({}))) as { role?: UserRole };
    const role: UserRole = body.role && ["student", "organizer", "admin"].includes(body.role)
      ? body.role
      : "student";

    const allUsers = await db.getUsers();
    let demoUser = allUsers.find((u) => u.role === role);

    if (!demoUser) {
      demoUser = {
        id: `usr_${role}_${Math.random().toString(36).slice(2, 7)}`,
        name: role === "admin" ? "Sarah Chen (Admin)" : role === "organizer" ? "Alex DevSphere" : "Alex Rivera",
        email: `${role}@enginow.ignite`,
        avatar: "",
        role,
        isRoleSelected: true,
      };
      await db.createUser(demoUser, await hashPassword("demoPassword123"));
    }

    const sessionToken = await createSession(demoUser.id);
    return withSession(
      Response.json({ success: true, data: demoUser, user: demoUser }),
      sessionToken,
    );
  }

  // First-login Role Selection
  if (request.method === "POST" && subRoute === "select-role") {
    const body = (await request.json().catch(() => ({}))) as {
      role?: "participant" | "organizer";
      orgName?: string;
      orgWebsite?: string;
      orgBio?: string;
      phone?: string;
      documentsSubmitted?: string;
    };
    const user = await getAuthenticatedUser(request);
    const finalRole: UserRole = body.role?.toLowerCase() === "organizer" ? "organizer" : "student";

    if (user) {
      const updated: UserProfile = {
        ...user,
        role: finalRole,
        isRoleSelected: true,
        orgName: body.orgName,
        orgWebsite: body.orgWebsite,
        orgBio: body.orgBio,
        verificationStatus: finalRole === "organizer" ? "pending" : undefined,
      };
      await db.updateUser(updated);

      if (finalRole === "organizer") {
        const organizers = await db.getOrganizers();
        const existingIdx = organizers.findIndex((o) => o.userId === user.id);
        const orgRec = {
          id: existingIdx !== -1 ? organizers[existingIdx].id : `org_rec_${Date.now()}`,
          userId: user.id,
          name: user.name,
          email: user.email,
          orgName: body.orgName || user.name,
          website: body.orgWebsite || "https://example.org",
          verificationStatus: "pending" as const,
          documentsSubmitted: body.documentsSubmitted || "Organizer credentials submitted for review",
          eventsCount: 0,
          joinedAt: new Date().toISOString().split("T")[0],
        };
        if (existingIdx !== -1) {
          organizers[existingIdx] = orgRec;
          await db.setOrganizers(organizers);
        } else {
          await db.setOrganizers([orgRec, ...organizers]);
        }
      }

      return Response.json({ success: true, data: updated, user: updated });
    }

    // Fallback profile if session not yet committed
    const fallbackProfile: UserProfile = {
      id: "usr_student_dev",
      name: "Alex Rivera",
      email: "alex.rivera@campus.edu",
      avatar: "",
      role: finalRole,
      isRoleSelected: true,
      orgName: body.orgName,
      orgWebsite: body.orgWebsite,
      verificationStatus: finalRole === "organizer" ? "pending" : undefined,
    };
    return Response.json({ success: true, data: fallbackProfile, user: fallbackProfile });
  }

  // Request Role Change
  if (request.method === "POST" && subRoute === "request-role-change") {
    const body = (await request.json().catch(() => ({}))) as {
      requestedRole?: "participant" | "organizer";
      reason?: string;
    };
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const updated: UserProfile = {
      ...user,
      roleChangeRequest: {
        requestedRole: body.requestedRole || "organizer",
        reason: body.reason,
        status: "PENDING",
        requestedAt: new Date().toISOString(),
      },
    };
    await db.updateUser(updated);
    return Response.json({ success: true, data: updated, user: updated });
  }

  // Signup
  if (request.method === "POST" && subRoute === "signup") {
    const body = (await request.json().catch(() => ({}))) as { name?: string; email?: string; password?: string; role?: UserRole };
    if (!body.name?.trim() || !body.email?.trim() || !validPassword(body.password)) {
      return Response.json(
        { error: "Name, email, and a password of at least 8 characters are required" },
        { status: 400 },
      );
    }
    if (await db.getUserByEmail(body.email)) {
      return Response.json({ error: "An account already exists for that email" }, { status: 409 });
    }
    const profile: UserProfile = {
      id: `usr_${crypto.randomUUID()}`,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      avatar: "",
      role: body.role || "student",
      isRoleSelected: true,
    };
    await db.createUser(profile, await hashPassword(body.password));
    const token = await createSession(profile.id);
    return withSession(Response.json({ success: true, data: profile, user: profile }, { status: 201 }), token);
  }

  // Login
  if (request.method === "POST" && subRoute === "login") {
    const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string; role?: UserRole };
    if (!body.email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    const account = await db.getUserByEmail(body.email);
    if (!account) {
      // Auto-create local user on email login if not exists for quick testing
      const newProfile: UserProfile = {
        id: `usr_${crypto.randomUUID()}`,
        name: body.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: body.email.trim().toLowerCase(),
        avatar: "",
        role: body.role || "student",
        isRoleSelected: true,
      };
      await db.createUser(newProfile, await hashPassword(body.password || "password123"));
      const token = await createSession(newProfile.id);
      return withSession(Response.json({ success: true, data: newProfile, user: newProfile }), token);
    }

    if (body.password && account.passwordHash && account.passwordHash !== "mock_password_hash") {
      const isValid = await verifyPassword(body.password, account.passwordHash);
      if (!isValid) return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession(account.profile.id);
    return withSession(Response.json({ success: true, data: account.profile, user: account.profile }), token);
  }

  // Logout
  if (request.method === "POST" && subRoute === "logout") {
    const sessionHash = getSessionHash(request);
    if (sessionHash) await db.deleteSession(sessionHash);
    const response = Response.json({ success: true });
    response.headers.set("set-cookie", clearSessionCookie());
    return response;
  }

  // List users (Admin)
  if (request.method === "GET" && subRoute === "users") {
    const user = await getAuthenticatedUser(request);
    if (user?.role !== "admin" && process.env.NODE_ENV === "production") {
      return Response.json({ error: "Forbidden" }, { status: user ? 403 : 401 });
    }
    return Response.json(await db.getUsers());
  }

  // Profile update
  if (request.method === "PATCH" && subRoute === "profile") {
    const user = await getAuthenticatedUser(request);
    if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as Partial<UserProfile>;
    const updated: UserProfile = {
      ...user,
      ...body,
      id: user.id,
      role: user.role,
      email: user.email,
    };
    await db.updateUser(updated);
    return Response.json({ success: true, data: updated, user: updated });
  }

  return Response.json({ error: "Auth endpoint not found" }, { status: 404 });
}
