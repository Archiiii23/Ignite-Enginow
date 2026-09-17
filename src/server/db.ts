import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Pool } from "pg";
import type { BackendEvent } from "@/lib/backend-events";
import type {
  Registration,
  OrganizerRecord,
  CategoryItem,
  Announcement,
} from "@/lib/platform-store";
import type { UserProfile } from "@/lib/auth-context";

const hasPostgres = !!process.env.DATABASE_URL;
const pool = hasPostgres
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

let schemaPromise: Promise<void> | undefined;

const DATA_DIR = join(process.cwd(), "data", "db");

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const filePath = join(DATA_DIR, filename);
  try {
    const text = await readFile(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<T> {
  const filePath = join(DATA_DIR, filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

const defaultOrganizers: OrganizerRecord[] = [
  {
    id: "org_rec_1",
    userId: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    orgName: "DevSphere Foundation",
    website: "https://devsphere.org",
    verificationStatus: "verified",
    documentsSubmitted: "Certificate of Incorporation & Gov ID (Verified by Admin on Aug 2026)",
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
    documentsSubmitted: "Open Source Non-Profit Registration PDF & Domain TXT verification",
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
    message: "Over ₹25,00,000 in bounties announced for open-source AI models. Register before seats fill.",
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
    avatar: "",
    role: "student",
    isRoleSelected: true,
    headline: "CS and AI Undergraduate",
    college: "Indian Institute of Technology (IIT)",
    skills: ["Python", "PyTorch", "React", "TypeScript"],
  },
  {
    id: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    avatar: "",
    role: "organizer",
    isRoleSelected: true,
    headline: "Global Technical Community and Hackathon Organizers",
    orgName: "DevSphere Foundation",
    orgWebsite: "https://devsphere.org",
    verificationStatus: "verified",
  },
  {
    id: "usr_admin_1",
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    avatar: "",
    role: "admin",
    isRoleSelected: true,
    headline: "Platform Operations and Governance Lead",
  },
];

interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

interface StoredSession {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}

async function ensureSchema() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_collections (name text PRIMARY KEY, data jsonb NOT NULL);
      CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, profile jsonb NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
      CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
    `);
  } catch (err) {
    console.warn("[Postgres] Failed to initialize Postgres pool schema, falling back to local file DB:", err);
  }
}

async function ready() {
  if (pool) {
    schemaPromise ??= ensureSchema();
    await schemaPromise;
  }
}

async function getCollection<T>(name: string, seed: T): Promise<T> {
  if (pool) {
    try {
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
    } catch {
      // fallback to file
    }
  }
  return readJsonFile<T>(`${name}.json`, seed);
}

async function setCollection<T>(name: string, data: T): Promise<T> {
  if (pool) {
    try {
      await ready();
      await pool.query(
        "INSERT INTO platform_collections (name, data) VALUES ($1, $2::jsonb) ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data",
        [name, JSON.stringify(data)],
      );
    } catch {
      // fallback to file
    }
  }
  return writeJsonFile<T>(`${name}.json`, data);
}

async function getUsers(): Promise<UserProfile[]> {
  if (pool) {
    try {
      await ready();
      const result = await pool.query<{ profile: UserProfile }>(
        "SELECT profile FROM users ORDER BY id",
      );
      if (result.rows.length) return result.rows.map((row) => row.profile);
      const seedPasswordHash = process.env.SEED_PASSWORD_HASH;
      if (seedPasswordHash) {
        for (const profile of defaultUsers) {
          await pool.query(
            "INSERT INTO users (id, email, password_hash, profile) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (id) DO NOTHING",
            [profile.id, profile.email.toLowerCase(), seedPasswordHash, JSON.stringify(profile)],
          );
        }
      }
    } catch {
      // fallback
    }
  }
  const accounts = await readJsonFile<StoredUserAccount[]>(
    "users.json",
    defaultUsers.map((profile) => ({
      id: profile.id,
      email: profile.email.toLowerCase(),
      passwordHash: "mock_password_hash",
      profile,
    })),
  );
  return accounts.map((acc) => acc.profile);
}

export const db = {
  getRegistrations: () => getCollection<Registration[]>("registrations", defaultRegistrations),
  setRegistrations: (value: Registration[]) => setCollection<Registration[]>("registrations", value),
  getOrganizers: () => getCollection<OrganizerRecord[]>("organizers", defaultOrganizers),
  setOrganizers: (value: OrganizerRecord[]) => setCollection<OrganizerRecord[]>("organizers", value),
  getCategories: () => getCollection<CategoryItem[]>("categories", defaultCategories),
  setCategories: (value: CategoryItem[]) => setCollection<CategoryItem[]>("categories", value),
  getAnnouncements: () => getCollection<Announcement[]>("announcements", defaultAnnouncements),
  setAnnouncements: (value: Announcement[]) => setCollection<Announcement[]>("announcements", value),
  getEvents: (seed: BackendEvent[]) => getCollection<BackendEvent[]>("events", seed),
  setEvents: (value: BackendEvent[]) => setCollection<BackendEvent[]>("events", value),
  getUsers,

  async getUserByEmail(email: string): Promise<{ profile: UserProfile; passwordHash: string } | null> {
    if (pool) {
      try {
        await ready();
        const result = await pool.query<{ profile: UserProfile; password_hash: string }>(
          "SELECT profile, password_hash FROM users WHERE lower(email) = lower($1)",
          [email],
        );
        if (result.rows[0]) {
          return { profile: result.rows[0].profile, passwordHash: result.rows[0].password_hash };
        }
      } catch {
        // fallback
      }
    }
    const accounts = await readJsonFile<StoredUserAccount[]>("users.json", []);
    const found = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    return found ? { profile: found.profile, passwordHash: found.passwordHash } : null;
  },

  async createUser(profile: UserProfile, passwordHash: string): Promise<UserProfile> {
    if (pool) {
      try {
        await ready();
        await pool.query(
          "INSERT INTO users (id, email, password_hash, profile) VALUES ($1, $2, $3, $4::jsonb)",
          [profile.id, profile.email.toLowerCase(), passwordHash, JSON.stringify(profile)],
        );
      } catch {
        // fallback
      }
    }
    const accounts = await readJsonFile<StoredUserAccount[]>("users.json", []);
    const existingIndex = accounts.findIndex((a) => a.id === profile.id || a.email.toLowerCase() === profile.email.toLowerCase());
    const newEntry: StoredUserAccount = {
      id: profile.id,
      email: profile.email.toLowerCase(),
      passwordHash,
      profile,
    };
    if (existingIndex >= 0) {
      accounts[existingIndex] = newEntry;
    } else {
      accounts.push(newEntry);
    }
    await writeJsonFile("users.json", accounts);
    return profile;
  },

  async updateUser(profile: UserProfile): Promise<UserProfile> {
    if (pool) {
      try {
        await ready();
        await pool.query("UPDATE users SET email = $2, profile = $3::jsonb WHERE id = $1", [
          profile.id,
          profile.email.toLowerCase(),
          JSON.stringify(profile),
        ]);
      } catch {
        // fallback
      }
    }
    const accounts = await readJsonFile<StoredUserAccount[]>("users.json", []);
    const index = accounts.findIndex((a) => a.id === profile.id);
    if (index >= 0) {
      accounts[index].email = profile.email.toLowerCase();
      accounts[index].profile = profile;
    } else {
      accounts.push({
        id: profile.id,
        email: profile.email.toLowerCase(),
        passwordHash: "mock_password_hash",
        profile,
      });
    }
    await writeJsonFile("users.json", accounts);
    return profile;
  },

  async createSession(tokenHash: string, userId: string, expiresAt: Date): Promise<void> {
    if (pool) {
      try {
        await ready();
        await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
          tokenHash,
          userId,
          expiresAt,
        ]);
      } catch {
        // fallback
      }
    }
    const sessions = await readJsonFile<StoredSession[]>("sessions.json", []);
    sessions.push({
      tokenHash,
      userId,
      expiresAt: expiresAt.toISOString(),
    });
    await writeJsonFile("sessions.json", sessions);
  },

  async getUserBySession(tokenHash: string): Promise<UserProfile | null> {
    if (pool) {
      try {
        await ready();
        const result = await pool.query<{ profile: UserProfile }>(
          "SELECT u.profile FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > NOW()",
          [tokenHash],
        );
        if (result.rows[0]) return result.rows[0].profile;
      } catch {
        // fallback
      }
    }
    const sessions = await readJsonFile<StoredSession[]>("sessions.json", []);
    const validSession = sessions.find(
      (s) => s.tokenHash === tokenHash && new Date(s.expiresAt) > new Date(),
    );
    if (!validSession) return null;
    const users = await getUsers();
    return users.find((u) => u.id === validSession.userId) ?? null;
  },

  async deleteSession(tokenHash: string): Promise<void> {
    if (pool) {
      try {
        await ready();
        await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
      } catch {
        // fallback
      }
    }
    const sessions = await readJsonFile<StoredSession[]>("sessions.json", []);
    const filtered = sessions.filter((s) => s.tokenHash !== tokenHash);
    await writeJsonFile("sessions.json", filtered);
  },

  async getRoleRequests(): Promise<UserProfile[]> {
    const users = await getUsers();
    return users.filter(
      (u) => u.roleChangeRequest && u.roleChangeRequest.status === "PENDING",
    );
  },

  async updateRoleRequest(
    userId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ): Promise<UserProfile | null> {
    const users = await getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || !user.roleChangeRequest) return null;

    const requestedRole = user.roleChangeRequest.requestedRole;
    const finalRole = status === "APPROVED"
      ? (requestedRole === "organizer" ? "organizer" : "student")
      : user.role;

    const updatedProfile: UserProfile = {
      ...user,
      role: finalRole,
      roleChangeRequest: {
        ...user.roleChangeRequest,
        status,
        reviewedAt: new Date().toISOString(),
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      },
    };
    await this.updateUser(updatedProfile);
    return updatedProfile;
  },
};
