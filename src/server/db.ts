import { Pool } from "pg";
import type { BackendEvent } from "@/lib/backend-events";
import type {
  Registration,
  OrganizerRecord,
  CategoryItem,
  Announcement,
} from "@/lib/platform-store";
import type { UserProfile } from "@/lib/auth-context";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

let schemaPromise: Promise<void> | undefined;

const defaultOrganizers: OrganizerRecord[] = [
  {
    id: "org_rec_1",
    userId: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    orgName: "DevSphere Foundation",
    website: "https://devsphere.org",
    verificationStatus: "verified",
    documentsSubmitted: "Verification documents approved",
    eventsCount: 4,
    joinedAt: "2026-07-10",
  },
  {
    id: "org_rec_2",
    userId: "usr_org_2",
    name: "OpenKernel Community",
    email: "team@openkernel.org",
    orgName: "OpenKernel Community",
    website: "https://openkernel.org",
    verificationStatus: "pending",
    documentsSubmitted: "Registration documents submitted",
    eventsCount: 2,
    joinedAt: "2026-08-28",
  },
  {
    id: "org_rec_3",
    userId: "usr_org_3",
    name: "Apex AI Labs",
    email: "contact@apexlabs.ai",
    orgName: "Apex AI Labs",
    website: "https://apexlabs.ai",
    verificationStatus: "pending",
    documentsSubmitted: "Corporate registration submitted",
    eventsCount: 1,
    joinedAt: "2026-09-01",
  },
];

const defaultRegistrations: Registration[] = [
  {
    id: "reg_1",
    eventId: "e1",
    eventTitle: "Quantum Hack 2026",
    eventDate: "Aug 14 - 16, 2026",
    eventLocation: "Bengaluru + Online",
    userId: "usr_student_1",
    userName: "Aarav Sharma",
    userEmail: "aarav.sharma@campus.edu",
    college: "Indian Institute of Technology (IIT)",
    registeredAt: "2026-08-10T14:30:00Z",
    status: "confirmed",
    ticketCode: "IGN-HAC-8812",
    seatNumber: "HAC-04",
  },
  {
    id: "reg_2",
    eventId: "e2",
    eventTitle: "Autonomous Agents Conf",
    eventDate: "Aug 22, 2026",
    eventLocation: "Virtual",
    userId: "usr_student_1",
    userName: "Aarav Sharma",
    userEmail: "aarav.sharma@campus.edu",
    college: "Indian Institute of Technology (IIT)",
    registeredAt: "2026-08-12T09:15:00Z",
    status: "attended",
    ticketCode: "IGN-CON-1904",
    seatNumber: "CON-14",
  },
  {
    id: "reg_3",
    eventId: "e1",
    eventTitle: "Quantum Hack 2026",
    eventDate: "Aug 14 - 16, 2026",
    eventLocation: "Bengaluru + Online",
    userId: "usr_student_2",
    userName: "Priya Sundaram",
    userEmail: "priya.s@tech.ac.in",
    college: "BITS Pilani",
    registeredAt: "2026-08-11T10:00:00Z",
    status: "confirmed",
    ticketCode: "IGN-HAC-9021",
    seatNumber: "HAC-05",
  },
];

const defaultCategories: CategoryItem[] = [
  {
    id: "c1",
    name: "Hackathon",
    description: "Multi-day building competitions and prize challenges",
    active: true,
  },
  {
    id: "c2",
    name: "Workshop",
    description: "Hands-on practical sessions guided by domain experts",
    active: true,
  },
  {
    id: "c3",
    name: "Webinar",
    description: "Interactive live masterclasses and industry panels",
    active: true,
  },
  {
    id: "c4",
    name: "Bootcamp",
    description: "Intensive multi-week skill acceleration cohorts",
    active: true,
  },
  {
    id: "c5",
    name: "Conference",
    description: "Keynotes, showcases, and networking summits",
    active: true,
  },
  {
    id: "c6",
    name: "Meetup",
    description: "Local and regional community gatherings",
    active: true,
  },
];

const defaultAnnouncements: Announcement[] = [
  {
    id: "ann_1",
    title: "Global AI Hackathon Registrations Open!",
    message: "Registrations are now open for the global AI hackathon.",
    type: "info",
    active: true,
    createdAt: "2026-09-10",
  },
];

const defaultUsers: UserProfile[] = [
  {
    id: "usr_student_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "student",
    headline: "CS and AI Undergraduate",
    college: "Indian Institute of Technology (IIT)",
    skills: ["Python", "PyTorch", "React", "TypeScript"],
  },
  {
    id: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "organizer",
    headline: "Global Technical Community and Hackathon Organizers",
    orgName: "DevSphere Foundation",
    orgWebsite: "https://devsphere.org",
    verificationStatus: "verified",
  },
  {
    id: "usr_admin_1",
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    headline: "Platform Operations and Governance Lead",
  },
];

async function ensureSchema() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required for the Postgres backend");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS platform_collections (name text PRIMARY KEY, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, profile jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
  `);
}

async function ready() {
  schemaPromise ??= ensureSchema();
  return schemaPromise;
}

async function getCollection<T>(name: string, seed: T) {
  await ready();
  const result = await pool.query<{ data: T }>(
    "SELECT data FROM platform_collections WHERE name = $1",
    [name],
  );
  if (result.rows[0]) return result.rows[0].data;
  await pool.query(
    "INSERT INTO platform_collections (name, data) VALUES ($1, $2::jsonb) ON CONFLICT (name) DO NOTHING",
    [name, JSON.stringify(seed)],
  );
  return seed;
}

async function setCollection<T>(name: string, data: T) {
  await ready();
  await pool.query(
    "INSERT INTO platform_collections (name, data) VALUES ($1, $2::jsonb) ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data",
    [name, JSON.stringify(data)],
  );
  return data;
}

async function getUsers() {
  await ready();
  const result = await pool.query<{ profile: UserProfile }>(
    "SELECT profile FROM users ORDER BY id",
  );
  if (result.rows.length) return result.rows.map((row) => row.profile);
  const seedPasswordHash = process.env.SEED_PASSWORD_HASH;
  if (!seedPasswordHash) return defaultUsers;
  for (const profile of defaultUsers) {
    await pool.query(
      "INSERT INTO users (id, email, password_hash, profile) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO NOTHING",
      [profile.id, profile.email.toLowerCase(), seedPasswordHash, JSON.stringify(profile)],
    );
  }
  return defaultUsers;
}

export const db = {
  getRegistrations: () => getCollection("registrations", defaultRegistrations),
  setRegistrations: (value: Registration[]) => setCollection("registrations", value),
  getOrganizers: () => getCollection("organizers", defaultOrganizers),
  setOrganizers: (value: OrganizerRecord[]) => setCollection("organizers", value),
  getCategories: () => getCollection("categories", defaultCategories),
  setCategories: (value: CategoryItem[]) => setCollection("categories", value),
  getAnnouncements: () => getCollection("announcements", defaultAnnouncements),
  setAnnouncements: (value: Announcement[]) => setCollection("announcements", value),
  getEvents: (seed: BackendEvent[]) => getCollection("events", seed),
  setEvents: (value: BackendEvent[]) => setCollection("events", value),
  getUsers,
  async getUserByEmail(email: string) {
    await getUsers();
    const result = await pool.query<{ profile: UserProfile; password_hash: string }>(
      "SELECT profile, password_hash FROM users WHERE lower(email) = lower($1)",
      [email],
    );
    return result.rows[0]
      ? { profile: result.rows[0].profile, passwordHash: result.rows[0].password_hash }
      : null;
  },
  async createUser(profile: UserProfile, passwordHash: string) {
    await ready();
    await pool.query(
      "INSERT INTO users (id, email, password_hash, profile) VALUES ($1, $2, $3, $4::jsonb)",
      [profile.id, profile.email.toLowerCase(), passwordHash, JSON.stringify(profile)],
    );
    return profile;
  },
  async updateUser(profile: UserProfile) {
    await ready();
    await pool.query("UPDATE users SET email = $2, profile = $3::jsonb WHERE id = $1", [
      profile.id,
      profile.email.toLowerCase(),
      JSON.stringify(profile),
    ]);
    return profile;
  },
  async createSession(tokenHash: string, userId: string, expiresAt: Date) {
    await ready();
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
      tokenHash,
      userId,
      expiresAt,
    ]);
  },
  async getUserBySession(tokenHash: string) {
    await ready();
    const result = await pool.query<{ profile: UserProfile }>(
      "SELECT u.profile FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > NOW()",
      [tokenHash],
    );
    return result.rows[0]?.profile ?? null;
  },
  async deleteSession(tokenHash: string) {
    await ready();
    await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
  },
};
