import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BackendEvent } from "@/lib/backend-events";
import type {
  Registration,
  OrganizerRecord,
  CategoryItem,
  Announcement,
} from "@/lib/platform-store";
import type { UserProfile } from "@/lib/auth-context";

const DATA_DIR = join(process.cwd(), "data");

// Initial Organizers Seed
const defaultOrganizersSeed: OrganizerRecord[] = [
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
    documentsSubmitted: "Corporate Entity License #APX-9921",
    eventsCount: 1,
    joinedAt: "2026-09-01",
  },
];

// Initial Registrations Seed
const defaultRegistrationsSeed: Registration[] = [
  {
    id: "reg_1",
    eventId: "e1",
    eventTitle: "Quantum Hack 2026",
    eventDate: "Aug 14 – 16, 2026",
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
    eventDate: "Aug 14 – 16, 2026",
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

// Initial Categories Seed
const defaultCategoriesSeed: CategoryItem[] = [
  { id: "c1", name: "Hackathon", description: "Multi-day building competitions & prize challenges", active: true },
  { id: "c2", name: "Workshop", description: "Hands-on practical sessions guided by domain experts", active: true },
  { id: "c3", name: "Webinar", description: "Interactive live masterclasses and industry panels", active: true },
  { id: "c4", name: "Bootcamp", description: "Intensive multi-week skill acceleration cohorts", active: true },
  { id: "c5", name: "Conference", description: "Keynotes, showcases, and networking summits", active: true },
  { id: "c6", name: "Meetup", description: "Local and regional community gatherings", active: true },
];

// Initial Announcements Seed
const defaultAnnouncementsSeed: Announcement[] = [
  {
    id: "ann_1",
    title: "Global AI Hackathon Registrations Open!",
    message: "Over ₹25,00,000 in bounties announced for open-source AI models. Register before seats fill.",
    type: "info",
    active: true,
    createdAt: "2026-09-10",
  },
];

// Initial Users Seed
const defaultUsersSeed: UserProfile[] = [
  {
    id: "usr_student_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "student",
    headline: "CS & AI Undergraduate · Hackathon Enthusiast",
    college: "Indian Institute of Technology (IIT)",
    bio: "Passionate about machine learning, distributed systems, and competitive coding. Built 3 hackathon-winning projects.",
    skills: ["Python", "PyTorch", "React", "TypeScript", "FastAPI"],
    github: "github.com/aaravsharma",
    linkedin: "linkedin.com/in/aaravsharma",
  },
  {
    id: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "organizer",
    headline: "Global Technical Community & Hackathon Organizers",
    orgName: "DevSphere Foundation",
    orgWebsite: "https://devsphere.org",
    orgBio: "Empowering 50,000+ engineers worldwide through open hackathons, bootcamps, and developer workshops.",
    verificationStatus: "verified",
  },
  {
    id: "usr_admin_1",
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    headline: "Platform Operations & Governance Lead",
  },
];

async function ensureFile<T>(filename: string, defaultData: T): Promise<string> {
  const filePath = join(DATA_DIR, filename);
  try {
    await readFile(filePath, "utf8");
  } catch {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(defaultData, null, 2), "utf8");
  }
  return filePath;
}

async function readJson<T>(filename: string, defaultData: T): Promise<T> {
  const filePath = await ensureFile(filename, defaultData);
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function writeJson<T>(filename: string, data: T): Promise<T> {
  const filePath = join(DATA_DIR, filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

// Database helper functions
export const db = {
  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    return readJson<Registration[]>("registrations.json", defaultRegistrationsSeed);
  },
  async setRegistrations(registrations: Registration[]): Promise<Registration[]> {
    return writeJson<Registration[]>("registrations.json", registrations);
  },

  // Organizers
  async getOrganizers(): Promise<OrganizerRecord[]> {
    return readJson<OrganizerRecord[]>("organizers.json", defaultOrganizersSeed);
  },
  async setOrganizers(organizers: OrganizerRecord[]): Promise<OrganizerRecord[]> {
    return writeJson<OrganizerRecord[]>("organizers.json", organizers);
  },

  // Categories
  async getCategories(): Promise<CategoryItem[]> {
    return readJson<CategoryItem[]>("categories.json", defaultCategoriesSeed);
  },
  async setCategories(categories: CategoryItem[]): Promise<CategoryItem[]> {
    return writeJson<CategoryItem[]>("categories.json", categories);
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return readJson<Announcement[]>("announcements.json", defaultAnnouncementsSeed);
  },
  async setAnnouncements(announcements: Announcement[]): Promise<Announcement[]> {
    return writeJson<Announcement[]>("announcements.json", announcements);
  },

  // Users
  async getUsers(): Promise<UserProfile[]> {
    return readJson<UserProfile[]>("users.json", defaultUsersSeed);
  },
  async setUsers(users: UserProfile[]): Promise<UserProfile[]> {
    return writeJson<UserProfile[]>("users.json", users);
  },
};
