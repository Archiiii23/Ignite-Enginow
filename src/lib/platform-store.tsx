import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { events as initialEventsSeed } from "@/data/events";
import { useAuth } from "./auth-context";

export interface PlatformEvent {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  eventType?: string;
  mode: "Online" | "In-person" | "Hybrid";
  location: string;
  city?: string;
  college?: string;
  dateISO: string;
  dateLabel: string;
  registrationDeadline?: string;
  durationLabel: string;
  price: string;
  prize?: string;
  seats: number;
  registered: number;
  viewsCount?: number;
  clicksCount?: number;
  cover: string;
  status: "live" | "closing" | "upcoming" | "ended";
  tags?: string[];
  host?: { name: string; role: string; avatar?: string; logo?: string };
  speakers?: { name: string; role: string; avatar?: string }[];
  sponsors?: { name: string; logoText?: string }[];
  faqs?: { q: string; a: string }[];
  contactEmail?: string;
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  rejectionReason?: string;
  organizerId: string;
  organizerName: string;
  isFeatured?: boolean;
  registrationsOpen: boolean;
  about: string;
  agenda: { time: string; title: string; description: string }[];
  perks: string[];
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  college?: string;
  phone?: string;
  degree?: string;
  yearOfStudy?: string;
  rollNumber?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experienceLevel?: string;
  skills?: string[];
  participationType?: "solo" | "team";
  teamName?: string;
  teamSize?: number;
  teamRole?: string;
  reasonForAttending?: string;
  tshirtSize?: string;
  dietaryPreference?: string;
  registeredAt: string;
  status: "confirmed" | "cancelled" | "attended";
  ticketCode: string;
  seatNumber: string;
}

export interface OrganizerRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  orgName: string;
  website: string;
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected" | "suspended";
  documentsSubmitted?: string;
  rejectionReason?: string;
  eventsCount: number;
  joinedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  active: boolean;
  createdAt: string;
}

interface PlatformContextType {
  events: PlatformEvent[];
  registrations: Registration[];
  organizers: OrganizerRecord[];
  favorites: string[];
  categories: CategoryItem[];
  announcements: Announcement[];
  // Student Actions
  registerForEvent: (
    eventId: string,
    studentInfo?: Partial<Registration> & { name?: string; email?: string }
  ) => Promise<Registration>;
  cancelRegistration: (registrationId: string) => void;
  isRegistered: (eventId: string, userId?: string) => boolean;
  getRegistration: (eventId: string, userId?: string) => Registration | undefined;
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  // Organizer Actions
  createEvent: (eventData: Partial<PlatformEvent>) => PlatformEvent;
  updateEvent: (eventId: string, updates: Partial<PlatformEvent>) => void;
  deleteEvent: (eventId: string) => void;
  submitEventForApproval: (eventId: string) => void;
  publishEvent: (eventId: string) => void;
  toggleRegistrations: (eventId: string) => void;
  markAttendance: (registrationId: string, attended: boolean) => void;
  submitVerification: (documentsNote: string) => void;
  getEventRegistrations: (eventId: string) => Registration[];
  // Admin Actions
  approveOrganizer: (orgId: string) => void;
  rejectOrganizer: (orgId: string, reason?: string) => void;
  suspendOrganizer: (orgId: string) => void;
  approveEvent: (eventId: string) => void;
  rejectEvent: (eventId: string, reason: string) => void;
  toggleFeatureEvent: (eventId: string) => void;
  removeInappropriateEvent: (eventId: string) => void;
  addCategory: (name: string, description: string) => void;
  toggleCategory: (catId: string) => void;
  deleteCategory: (catId: string) => void;
  createAnnouncement: (title: string, message: string, type: "info" | "success" | "warning") => void;
  deleteAnnouncement: (id: string) => void;
  cancelRegistrationAdmin: (registrationId: string) => void;
}

const STORAGE_KEY_EVENTS = "ignite-platform-events-v4";
const STORAGE_KEY_REGISTRATIONS = "ignite-platform-registrations-v4";
const STORAGE_KEY_ORGANIZERS = "ignite-platform-organizers-v4";
const STORAGE_KEY_FAVORITES = "ignite-platform-favorites-v4";
const STORAGE_KEY_CATEGORIES = "ignite-platform-categories-v4";
const STORAGE_KEY_ANNOUNCEMENTS = "ignite-platform-announcements-v4";

// Convert initial static seed events into platform events
const defaultEventsSeed: PlatformEvent[] = initialEventsSeed.map((e, idx) => ({
  ...e,
  approvalStatus: "published" as const,
  organizerId: idx % 2 === 0 ? "usr_org_1" : "usr_org_2",
  organizerName: idx % 2 === 0 ? "DevSphere Foundation" : "OpenKernel Community",
  isFeatured: idx < 3,
  registrationsOpen: e.status !== "ended",
  viewsCount: e.viewsCount ?? Math.floor(3200 + Math.random() * 9500),
  clicksCount: e.clicksCount ?? Math.floor(750 + Math.random() * 2500),
  college: e.college ?? (idx % 2 === 0 ? "IIT Bombay" : "BITS Pilani"),
}));

// Initial organizers seed
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
    eventsCount: 5,
    joinedAt: "2026-07-10",
  },
  {
    id: "org_rec_2",
    userId: "usr_org_2",
    name: "OpenKernel Community",
    email: "team@openkernel.org",
    orgName: "OpenKernel Community",
    website: "https://openkernel.org",
    verificationStatus: "verified",
    documentsSubmitted: "Open Source Non-Profit Registration PDF & Domain TXT verification",
    eventsCount: 3,
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

// Initial registrations seed for student demo & organizer roster viewing
const defaultRegistrationsSeed: Registration[] = [
  {
    id: "reg_1",
    eventId: "e-hk-1",
    eventTitle: "Quantum Hack 2026",
    eventDate: "Nov 13 – 15, 2026",
    eventLocation: "Bengaluru + Online",
    userId: "usr_student_1",
    userName: "Aarav Sharma",
    userEmail: "aarav.sharma@campus.edu",
    college: "Indian Institute of Technology (IIT Bombay)",
    phone: "+91 98765 43210",
    degree: "B.Tech Computer Science",
    yearOfStudy: "3rd Year",
    registeredAt: "2026-10-10T14:30:00Z",
    status: "confirmed",
    ticketCode: "IGN-QNT-8812",
    seatNumber: "HACK-B04",
  },
  {
    id: "reg_2",
    eventId: "e-cf-1",
    eventTitle: "DevFest South 2026",
    eventDate: "Nov 28, 2026",
    eventLocation: "HICC Convention Centre, Hyderabad",
    userId: "usr_student_1",
    userName: "Aarav Sharma",
    userEmail: "aarav.sharma@campus.edu",
    college: "Indian Institute of Technology (IIT Bombay)",
    phone: "+91 98765 43210",
    degree: "B.Tech Computer Science",
    yearOfStudy: "3rd Year",
    registeredAt: "2026-10-12T09:15:00Z",
    status: "attended",
    ticketCode: "IGN-AGT-1904",
    seatNumber: "GEN-114",
  },
  {
    id: "reg_3",
    eventId: "e-hk-1",
    eventTitle: "Quantum Hack 2026",
    eventDate: "Nov 13 – 15, 2026",
    eventLocation: "Bengaluru + Online",
    userId: "usr_student_2",
    userName: "Priya Sundaram",
    userEmail: "priya.s@tech.ac.in",
    college: "BITS Pilani",
    phone: "+91 98111 22334",
    degree: "M.Sc AI & Robotics",
    yearOfStudy: "2nd Year",
    registeredAt: "2026-10-11T10:00:00Z",
    status: "confirmed",
    ticketCode: "IGN-QNT-9021",
    seatNumber: "HACK-B05",
  },
  {
    id: "reg_4",
    eventId: "e-ws-1",
    eventTitle: "Designing Systems That Scale",
    eventDate: "Oct 24, 2026",
    eventLocation: "Live on Enginow Interactive Stage",
    userId: "usr_student_3",
    userName: "Rohan Varma",
    userEmail: "rohan.varma@iiit.ac.in",
    college: "IIIT Hyderabad",
    phone: "+91 97234 56789",
    degree: "B.Tech Computer Science",
    yearOfStudy: "4th Year",
    registeredAt: "2026-10-14T11:20:00Z",
    status: "confirmed",
    ticketCode: "IGN-SYS-3419",
    seatNumber: "SYS-A12",
  },
  {
    id: "reg_5",
    eventId: "e-ws-1",
    eventTitle: "Designing Systems That Scale",
    eventDate: "Oct 24, 2026",
    eventLocation: "Live on Enginow Interactive Stage",
    userId: "usr_student_4",
    userName: "Neha Iyer",
    userEmail: "neha.iyer@stanford.edu",
    college: "Stanford University",
    phone: "+1 650 498 1234",
    degree: "M.S. Software Systems",
    yearOfStudy: "1st Year",
    registeredAt: "2026-10-15T16:45:00Z",
    status: "confirmed",
    ticketCode: "IGN-SYS-7721",
    seatNumber: "SYS-A14",
  },
];

const defaultCategoriesSeed: CategoryItem[] = [
  { id: "c1", name: "Hackathon", description: "Multi-day building competitions & prize challenges", active: true },
  { id: "c2", name: "Workshop", description: "Hands-on practical sessions guided by domain experts", active: true },
  { id: "c3", name: "Webinar", description: "Interactive live masterclasses and industry panels", active: true },
  { id: "c4", name: "Bootcamp", description: "Intensive multi-week skill acceleration cohorts", active: true },
  { id: "c5", name: "Conference", description: "Keynotes, showcases, and networking summits", active: true },
  { id: "c6", name: "Meetup", description: "Local and regional community gatherings", active: true },
];

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

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformStoreProvider({ children }: { children: ReactNode }) {
  const { user, updateUserProfile } = useAuth();

  const [events, setEvents] = useState<PlatformEvent[]>(() => {
    if (typeof window === "undefined") return defaultEventsSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_EVENTS);
      return stored ? JSON.parse(stored) : defaultEventsSeed;
    } catch {
      return defaultEventsSeed;
    }
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    if (typeof window === "undefined") return defaultRegistrationsSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
      return stored ? JSON.parse(stored) : defaultRegistrationsSeed;
    } catch {
      return defaultRegistrationsSeed;
    }
  });

  const [organizers, setOrganizers] = useState<OrganizerRecord[]>(() => {
    if (typeof window === "undefined") return defaultOrganizersSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_ORGANIZERS);
      return stored ? JSON.parse(stored) : defaultOrganizersSeed;
    } catch {
      return defaultOrganizersSeed;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["e1", "e3"];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_FAVORITES);
      return stored ? JSON.parse(stored) : ["e1", "e3"];
    } catch {
      return ["e1", "e3"];
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (typeof window === "undefined") return defaultCategoriesSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return stored ? JSON.parse(stored) : defaultCategoriesSeed;
    } catch {
      return defaultCategoriesSeed;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (typeof window === "undefined") return defaultAnnouncementsSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      return stored ? JSON.parse(stored) : defaultAnnouncementsSeed;
    } catch {
      return defaultAnnouncementsSeed;
    }
  });

  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unpack = (res: any) => {
      if (!res) return null;
      if (Array.isArray(res)) return res;
      if (res && typeof res === "object") {
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.events)) return res.events;
      }
      return null;
    };

    const fetchFast = (url: string) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      return fetch(url, { credentials: "include", signal: controller.signal })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
        .finally(() => clearTimeout(id));
    };

    Promise.allSettled([
      fetchFast("/api/events?limit=100"),
      fetchFast("/api/registrations/me"),
      fetchFast("/api/organizers"),
      fetchFast("/api/categories"),
      fetchFast("/api/announcements"),
    ])
      .then(([evRes, regRes, orgRes, catRes, annRes]) => {
        if (cancelled) return;
        const evData = evRes.status === "fulfilled" ? unpack(evRes.value) : null;
        const regData = regRes.status === "fulfilled" ? unpack(regRes.value) : null;
        const orgData = orgRes.status === "fulfilled" ? unpack(orgRes.value) : null;
        const catData = catRes.status === "fulfilled" ? unpack(catRes.value) : null;
        const annData = annRes.status === "fulfilled" ? unpack(annRes.value) : null;

        if (evData && evData.length > 0) setEvents(evData);
        if (regData && regData.length > 0) setRegistrations(regData);
        if (orgData && orgData.length > 0) setOrganizers(orgData);
        if (catData && catData.length > 0) setCategories(catData);
        if (annData && annData.length > 0) setAnnouncements(annData);
      })
      .finally(() => {
        if (!cancelled) setBackendReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync to local storage & backend
  useEffect(() => {
    if (!backendReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch {}
    fetch("/api/events", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(events),
    }).catch(() => undefined);
  }, [events, backendReady]);

  useEffect(() => {
    if (!backendReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(registrations));
    } catch {}
    fetch("/api/registrations", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(registrations),
    }).catch(() => undefined);
  }, [registrations, backendReady]);

  useEffect(() => {
    if (!backendReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_ORGANIZERS, JSON.stringify(organizers));
    } catch {}
    fetch("/api/organizers", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(organizers),
    }).catch(() => undefined);
  }, [organizers, backendReady]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    if (!backendReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {}
    fetch("/api/categories", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(categories),
    }).catch(() => undefined);
  }, [categories, backendReady]);

  useEffect(() => {
    if (!backendReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {}
    fetch("/api/announcements", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(announcements),
    }).catch(() => undefined);
  }, [announcements, backendReady]);

  // STUDENT ACTIONS
  const registerForEvent = useCallback(
    (
      eventId: string,
      studentInfo?: Partial<Registration> & { name?: string; email?: string }
    ): Promise<Registration> => {
      const ev = events.find((e) => e.id === eventId || e.slug === eventId);
      if (!ev) throw new Error("Event not found");

      const createLocalRegistration = (): Registration => {
        const regId = `reg_${Date.now()}`;
        const ticketCode = `IGN-${ev.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const seatLetter = String.fromCharCode(65 + Math.floor(Math.random() * 8));
        const seatNum = String(Math.floor(1 + Math.random() * 40)).padStart(2, "0");
        const fallbackReg: Registration = {
          id: regId,
          eventId: ev.id,
          eventTitle: ev.title,
          eventDate: ev.dateLabel,
          eventLocation: ev.location,
          userId: user?.id || `usr_guest_${Date.now()}`,
          userName: studentInfo?.userName || studentInfo?.name || user?.name || "Participant",
          userEmail: studentInfo?.userEmail || studentInfo?.email || user?.email || "participant@campus.edu",
          college: studentInfo?.college || user?.college || "Indian Institute of Technology",
          phone: studentInfo?.phone || "+91 98765 43210",
          degree: studentInfo?.degree || "B.Tech Computer Science",
          yearOfStudy: studentInfo?.yearOfStudy || "3rd Year",
          rollNumber: studentInfo?.rollNumber || "ID-2026-ENG",
          githubUrl: studentInfo?.githubUrl || user?.github,
          linkedinUrl: studentInfo?.linkedinUrl || user?.linkedin,
          experienceLevel: studentInfo?.experienceLevel || "Intermediate",
          skills: studentInfo?.skills || ["React", "TypeScript", "Node.js"],
          participationType: studentInfo?.participationType || "solo",
          teamName: studentInfo?.teamName,
          teamSize: studentInfo?.teamSize,
          teamRole: studentInfo?.teamRole,
          reasonForAttending: studentInfo?.reasonForAttending || "Looking forward to learning and collaborating with peers.",
          tshirtSize: studentInfo?.tshirtSize || "L",
          dietaryPreference: studentInfo?.dietaryPreference || "Vegetarian",
          registeredAt: new Date().toISOString(),
          status: "confirmed",
          ticketCode,
          seatNumber: `${seatLetter}-${seatNum}`,
        };
        setRegistrations((prev) => [fallbackReg, ...prev.filter((r) => r.id !== fallbackReg.id)]);
        setEvents((prev) =>
          prev.map((item) =>
            item.id === ev.id ? { ...item, registered: item.registered + 1 } : item
          )
        );
        return fallbackReg;
      };

      return fetch("/api/registrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId: ev.id, ...studentInfo }),
      })
        .then(async (response) => {
          const payload = (await response.json().catch(() => ({}))) as Registration & { error?: string };
          if (!response.ok) throw new Error(payload.error || "Registration failed");

          const savedRegistration = payload as Registration;
          setRegistrations((prev) => [savedRegistration, ...prev.filter((item) => item.id !== savedRegistration.id)]);
          setEvents((prev) =>
            prev.map((item) => (item.id === ev.id ? { ...item, registered: Math.max(item.registered, ev.registered + 1) } : item))
          );
          return savedRegistration;
        })
        .catch(() => {
          return createLocalRegistration();
        });
    },
    [events, user]
  );

  const cancelRegistration = useCallback(
    (registrationId: string) => {
      setRegistrations((prev) => {
        const target = prev.find((r) => r.id === registrationId);
        if (target) {
          setEvents((evs) =>
            evs.map((e) => (e.id === target.eventId ? { ...e, registered: Math.max(0, e.registered - 1) } : e))
          );
        }
        return prev.filter((r) => r.id !== registrationId);
      });
    },
    []
  );

  const isRegistered = useCallback(
    (eventId: string, userId?: string) => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return false;
      const ev = events.find((e) => e.id === eventId || e.slug === eventId);
      const targetEventId = ev ? ev.id : eventId;
      return registrations.some(
        (r) => (r.eventId === targetEventId || (ev && r.eventId === ev.slug)) && r.userId === targetUserId && r.status !== "cancelled"
      );
    },
    [registrations, user, events]
  );

  const getRegistration = useCallback(
    (eventId: string, userId?: string) => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return undefined;
      const ev = events.find((e) => e.id === eventId || e.slug === eventId);
      const targetEventId = ev ? ev.id : eventId;
      return registrations.find(
        (r) => (r.eventId === targetEventId || (ev && r.eventId === ev.slug)) && r.userId === targetUserId && r.status !== "cancelled"
      );
    },
    [registrations, user, events]
  );

  const toggleFavorite = useCallback((eventId: string) => {
    setFavorites((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  }, []);

  const isFavorite = useCallback(
    (eventId: string) => {
      return favorites.includes(eventId);
    },
    [favorites]
  );

  // ORGANIZER ACTIONS
  const createEvent = useCallback(
    (eventData: Partial<PlatformEvent>) => {
      const id = `ev_${Date.now()}`;
      const slug = (eventData.title || "new-event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newEv: PlatformEvent = {
        id,
        slug,
        title: eventData.title || "Untitled Event",
        tagline: eventData.tagline || "An exciting technical experience.",
        category: eventData.category || "Hackathon",
        mode: eventData.mode || "Online",
        location: eventData.location || "Virtual",
        dateISO: eventData.dateISO || new Date().toISOString().split("T")[0],
        dateLabel: eventData.dateLabel || "Upcoming 2026",
        durationLabel: eventData.durationLabel || "24 hours",
        price: eventData.price || "Free",
        prize: eventData.prize,
        seats: eventData.seats || 250,
        registered: 0,
        cover: eventData.cover || initialEventsSeed[0].cover,
        status: "upcoming",
        approvalStatus: "pending_approval",
        organizerId: user?.id || "usr_org_1",
        organizerName: user?.orgName || user?.name || "Organizer",
        isFeatured: false,
        registrationsOpen: true,
        about: eventData.about || "Details coming soon.",
        agenda: eventData.agenda || [{ time: "Day 1 · 10:00", title: "Kickoff", description: "Opening session" }],
        perks: eventData.perks || ["Verified Certificate", "Community Access"],
      };

      setEvents((prev) => [newEv, ...prev]);
      return newEv;
    },
    [user]
  );

  const updateEvent = useCallback((eventId: string, updates: Partial<PlatformEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  const submitEventForApproval = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, approvalStatus: "pending_approval" as const } : e))
    );
  }, []);

  const publishEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, approvalStatus: "published" as const, status: "live" as const } : e))
    );
  }, []);

  const toggleRegistrations = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registrationsOpen: !e.registrationsOpen } : e))
    );
  }, []);

  const markAttendance = useCallback((registrationId: string, attended: boolean) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId ? { ...r, status: attended ? "attended" : "confirmed" } : r
      )
    );
  }, []);

  const submitVerification = useCallback(
    (documentsNote: string) => {
      const orgId = user?.id || "usr_org_1";
      setOrganizers((prev) => {
        const existing = prev.find((o) => o.userId === orgId);
        if (existing) {
          return prev.map((o) =>
            o.userId === orgId
              ? { ...o, verificationStatus: "pending", documentsSubmitted: documentsNote }
              : o
          );
        }
        return [
          {
            id: `org_${Date.now()}`,
            userId: orgId,
            name: user?.name || "Organizer",
            email: user?.email || "org@example.com",
            orgName: user?.orgName || user?.name || "Organization",
            website: user?.orgWebsite || "https://example.org",
            verificationStatus: "pending",
            documentsSubmitted: documentsNote,
            eventsCount: 1,
            joinedAt: new Date().toISOString().split("T")[0],
          },
          ...prev,
        ];
      });
      updateUserProfile({ verificationStatus: "pending" });
    },
    [user, updateUserProfile]
  );

  const getEventRegistrations = useCallback(
    (eventId: string) => {
      return registrations.filter((r) => r.eventId === eventId);
    },
    [registrations]
  );

  // ADMIN ACTIONS
  const approveOrganizer = useCallback(
    (orgId: string) => {
      setOrganizers((prev) =>
        prev.map((o) =>
          o.id === orgId || o.userId === orgId
            ? { ...o, verificationStatus: "verified" as const, rejectionReason: undefined }
            : o
        )
      );
      const targetOrg = organizers.find((o) => o.id === orgId || o.userId === orgId);
      if (user && targetOrg && (user.id === targetOrg.userId || user.id === orgId)) {
        updateUserProfile({ verificationStatus: "verified" });
      }
    },
    [organizers, user, updateUserProfile]
  );

  const rejectOrganizer = useCallback(
    (orgId: string, reason = "Incomplete verification documents.") => {
      setOrganizers((prev) =>
        prev.map((o) =>
          o.id === orgId || o.userId === orgId
            ? { ...o, verificationStatus: "rejected" as const, rejectionReason: reason }
            : o
        )
      );
      const targetOrg = organizers.find((o) => o.id === orgId || o.userId === orgId);
      if (user && targetOrg && (user.id === targetOrg.userId || user.id === orgId)) {
        updateUserProfile({ verificationStatus: "rejected" });
      }
    },
    [organizers, user, updateUserProfile]
  );

  const suspendOrganizer = useCallback((orgId: string) => {
    setOrganizers((prev) =>
      prev.map((o) => (o.id === orgId || o.userId === orgId ? { ...o, verificationStatus: "suspended" as const } : o))
    );
  }, []);

  const approveEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, approvalStatus: "published" as const, status: "live" as const }
          : e
      )
    );
  }, []);

  const rejectEvent = useCallback((eventId: string, reason: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, approvalStatus: "rejected" as const, rejectionReason: reason }
          : e
      )
    );
  }, []);

  const toggleFeatureEvent = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isFeatured: !e.isFeatured } : e))
    );
  }, []);

  const removeInappropriateEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  const addCategory = useCallback((name: string, description: string) => {
    const newCat: CategoryItem = {
      id: `c_${Date.now()}`,
      name,
      description,
      active: true,
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const toggleCategory = useCallback((catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, active: !c.active } : c))
    );
  }, []);

  const deleteCategory = useCallback((catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  }, []);

  const createAnnouncement = useCallback((title: string, message: string, type: "info" | "success" | "warning") => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      message,
      type,
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const cancelRegistrationAdmin = useCallback((registrationId: string) => {
    setRegistrations((prev) => {
      const target = prev.find((r) => r.id === registrationId);
      if (target) {
        setEvents((evs) =>
          evs.map((e) => (e.id === target.eventId ? { ...e, registered: Math.max(0, e.registered - 1) } : e))
        );
      }
      return prev.filter((r) => r.id !== registrationId);
    });
  }, []);

  return (
    <PlatformContext.Provider
      value={{
        events,
        registrations,
        organizers,
        favorites,
        categories,
        announcements,
        registerForEvent,
        cancelRegistration,
        isRegistered,
        getRegistration,
        toggleFavorite,
        isFavorite,
        createEvent,
        updateEvent,
        deleteEvent,
        submitEventForApproval,
        publishEvent,
        toggleRegistrations,
        markAttendance,
        submitVerification,
        getEventRegistrations,
        approveOrganizer,
        rejectOrganizer,
        suspendOrganizer,
        approveEvent,
        rejectEvent,
        toggleFeatureEvent,
        removeInappropriateEvent,
        addCategory,
        toggleCategory,
        deleteCategory,
        createAnnouncement,
        deleteAnnouncement,
        cancelRegistrationAdmin,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatformStore() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatformStore must be used within a PlatformStoreProvider");
  }
  return context;
}
