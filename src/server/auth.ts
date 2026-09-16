import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";
import type { UserRole, UserProfile } from "@/lib/auth-context";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "ignite_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.createSession(
    hashSessionToken(token),
    userId,
    new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  );
  return token;
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1);
}

export async function getAuthenticatedUser(request: Request) {
  const token = getSessionToken(request);
  return token ? db.getUserBySession(hashSessionToken(token)) : null;
}

export async function requireRole(request: Request, roles: UserRole[]) {
  const user = await getAuthenticatedUser(request);
  if (!user)
    return { response: Response.json({ error: "Authentication required" }, { status: 401 }) };
  if (!roles.includes(user.role))
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export function withSession(response: Response, token: string) {
  response.headers.set("set-cookie", sessionCookie(token));
  return response;
}

export function getSessionHash(request: Request) {
  const token = getSessionToken(request);
  return token ? hashSessionToken(token) : null;
}

export type AuthenticatedUser = UserProfile;
