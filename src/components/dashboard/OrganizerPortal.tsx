import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  Trash2,
  Edit3,
  Users,
  Download,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCheck,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  MousePointerClick,
  Percent,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  Check,
  ExternalLink,
  Activity,
  Briefcase,
  Ticket,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import type { PlatformEvent } from "@/lib/platform-store";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { toast } from "sonner";

type Tab =
  | "overview"
  | "total-events"
  | "pending-events"
  | "approved-events"
  | "registrations"
  | "analytics"
  | "management"
  | "verification";

const BLANK_EVENT: Partial<PlatformEvent> = {
  title: "",
  tagline: "",
  category: "Hackathon",
  mode: "Online",
  location: "Virtual",
  dateLabel: "",
  dateISO: new Date().toISOString().slice(0, 10),
  durationLabel: "24 Hours",
  price: "Free",
  prize: "",
  seats: 100,
  about: "",
  perks: [],
  agenda: [],
};

export function OrganizerPortal() {
  const { user } = useAuth();
  const {
    events,
    organizers,
    registrations,
    createEvent,
    updateEvent,
    deleteEvent,
    submitEventForApproval,
    publishEvent,
    toggleRegistrations,
    markAttendance,
    submitVerification,
    getEventRegistrations,
  } = usePlatformStore();

  const [tab, setTab] = useState<Tab>("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlatformEvent | null>(null);
  const [form, setForm] = useState<Partial<PlatformEvent>>(BLANK_EVENT);
  const [expandedRosters, setExpandedRosters] = useState<Set<string>>(new Set());
  const [verifyNote, setVerifyNote] = useState("");
  const [verifySubmitted, setVerifySubmitted] = useState(false);

  // Filters for Total Events
  const [searchEvent, setSearchEvent] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState<"all" | "Online" | "In-person" | "Hybrid">("all");

  // Filters for Registrations Tab
  const [regEventFilter, setRegEventFilter] = useState<string>("all");
  const [regSearch, setRegSearch] = useState("");

  const myEvents = useMemo(() => {
    return events.filter(
      (e) => e.organizerId === user?.id || e.organizerId === "usr_org_1" || e.organizerId === "usr_org_2"
    );
  }, [events, user?.id]);

  const myOrg = organizers.find((o) => o.userId === user?.id);

  const totalEventsCount = myEvents.length;
  const pendingEventsCount = myEvents.filter((e) => e.approvalStatus === "pending_approval").length;
  const approvedEventsCount = myEvents.filter(
    (e) => e.approvalStatus === "published" || e.approvalStatus === "approved"
  ).length;

  const allMyRegistrations = useMemo(() => {
    const list: any[] = [];
    myEvents.forEach((ev) => {
      const regs = getEventRegistrations(ev.id);
      regs.forEach((r) => {
        list.push({ ...r, eventTitle: ev.title, eventSlug: ev.slug, eventMode: ev.mode });
      });
    });
    return list;
  }, [myEvents, getEventRegistrations]);

  const totalRegistrationsCount = allMyRegistrations.length;
  const totalAttendedCount = allMyRegistrations.filter((r) => r.status === "attended").length;
  const attendanceRate =
    totalRegistrationsCount > 0 ? Math.round((totalAttendedCount / totalRegistrationsCount) * 100) : 0;

  const approvalColors: Record<string, string> = {
    draft: "text-muted-foreground bg-secondary border-border",
    pending_approval: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    approved: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    rejected: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
    published: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  const handleSaveEvent = () => {
    if (!form.title?.trim()) {
      toast.error("Event title is required");
      return;
    }
    if (editingEvent) {
      updateEvent(editingEvent.id, form);
      toast.success("Event updated successfully!");
    } else {
      createEvent({
        ...form,
        organizerId: user?.id ?? "usr_org_1",
        organizerName: user?.name ?? "Organizer",
      });
      toast.success("Event created! Submitted for Admin Review.");
    }
    setShowCreateModal(false);
    setEditingEvent(null);
    setForm(BLANK_EVENT);
  };

  const handleEditEvent = (ev: PlatformEvent) => {
    setEditingEvent(ev);
    setForm(ev);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deleteEvent(id);
      toast.success("Event deleted");
    }
  };

  const toggleRoster = (eventId: string) => {
    setExpandedRosters((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const exportCSV = (eventId?: string) => {
    const regs = eventId ? getEventRegistrations(eventId) : allMyRegistrations;
    if (regs.length === 0) {
      toast.info("No registration records to export");
      return;
    }
    const header = "Name,Email,Phone,College,Degree,Year,Roll Number,GitHub,LinkedIn,Skills,Participation,Team Name,Team Role,T-Shirt,Seat,Status,Registered At\n";
    const rows = regs
      .map(
        (r) =>
          `"${r.userName}","${r.userEmail}","${r.phone ?? ""}","${r.college ?? ""}","${r.degree ?? ""}","${r.yearOfStudy ?? ""}","${r.rollNumber ?? ""}","${r.githubUrl ?? ""}","${r.linkedinUrl ?? ""}","${(r.skills || []).join("; ")}","${r.participationType ?? "solo"}","${r.teamName ?? ""}","${r.teamRole ?? ""}","${r.tshirtSize ?? ""}","${r.seatNumber}","${r.status}","${r.registeredAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${eventId || "all-events"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const exportExcel = (eventId?: string) => {
    const regs = eventId ? getEventRegistrations(eventId) : allMyRegistrations;
    if (regs.length === 0) {
      toast.info("No registration records to export");
      return;
    }
    const headers = [
      "Participant Name",
      "Email Address",
      "Phone Number",
      "College / Institution",
      "Degree & Branch",
      "Year of Study",
      "Student ID / Roll No",
      "Seat Number",
      "Attendance Status",
      "Registration Date",
    ];
    const rows = regs.map((r) => [
      r.userName,
      r.userEmail,
      r.phone || "N/A",
      r.college || "N/A",
      r.degree || "N/A",
      r.yearOfStudy || "N/A",
      r.rollNumber || "N/A",
      r.seatNumber || "N/A",
      r.status,
      new Date(r.registeredAt).toLocaleString(),
    ]);

    const content =
      headers.join("\t") + "\n" + rows.map((row) => row.join("\t")).join("\n");
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${eventId || "all-events"}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Excel sheet exported successfully");
  };

  const handleVerificationSubmit = () => {
    if (!verifyNote.trim()) return;
    submitVerification(verifyNote);
    setVerifySubmitted(true);
    toast.success("Verification documents submitted for review");
  };

  const verificationStatus = myOrg?.verificationStatus ?? user?.verificationStatus ?? "verified";

  const verificationConfig: Record<string, { label: string; icon: any; cls: string }> = {
    not_submitted: { label: "Not Submitted", icon: AlertCircle, cls: "text-muted-foreground" },
    pending: { label: "Under Review", icon: Clock, cls: "text-amber-500" },
    verified: { label: "Verified ✓", icon: CheckCircle2, cls: "text-emerald-500" },
    rejected: { label: "Rejected", icon: XCircle, cls: "text-red-500" },
    suspended: { label: "Suspended", icon: XCircle, cls: "text-red-500" },
  };

  const vc = verificationConfig[verificationStatus] || verificationConfig.verified;

  // Filtered lists for specific tabs
  const pendingEventsList = useMemo(() => {
    return myEvents.filter(
      (e) => e.approvalStatus === "pending_approval" || e.approvalStatus === "draft" || e.approvalStatus === "rejected"
    );
  }, [myEvents]);

  const approvedEventsList = useMemo(() => {
    return myEvents.filter(
      (e) => e.approvalStatus === "published" || e.approvalStatus === "approved"
    );
  }, [myEvents]);

  const totalEventsFiltered = useMemo(() => {
    return myEvents.filter((ev) => {
      const matchSearch =
        searchEvent.trim() === "" ||
        ev.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
        ev.tagline.toLowerCase().includes(searchEvent.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchEvent.toLowerCase());
      const matchCat = categoryFilter === "all" || ev.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchMode = modeFilter === "all" || ev.mode === modeFilter;
      return matchSearch && matchCat && matchMode;
    });
  }, [myEvents, searchEvent, categoryFilter, modeFilter]);

  const filteredRegistrations = useMemo(() => {
    return allMyRegistrations.filter((r) => {
      const matchEvent = regEventFilter === "all" || r.eventId === regEventFilter;
      const q = regSearch.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        (r.college && r.college.toLowerCase().includes(q)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(q));
      return matchEvent && matchSearch;
    });
  }, [allMyRegistrations, regEventFilter, regSearch]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    myEvents.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats);
  }, [myEvents]);

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={user?.name}
            email={user?.email}
            className="size-16 rounded-2xl text-2xl border-2 border-primary/30 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display tracking-tight">{user?.name}</h1>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  verificationStatus === "verified"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                <vc.icon className="size-3" /> {vc.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.headline || "Verified Campus Community Organizer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditingEvent(null);
              setForm(BLANK_EVENT);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_-4px_var(--primary-glow)]"
          >
            <Plus className="size-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Top 7 Navigation Tabs Matching Page 6 Spec */}
      <div className="flex items-center gap-1 p-1.5 bg-secondary/80 border border-border rounded-2xl mb-8 overflow-x-auto scrollbar-none">
        {([
          ["overview", "Overview", Activity],
          ["total-events", `Total Events (${totalEventsCount})`, Calendar],
          ["pending-events", `Pending Events (${pendingEventsCount})`, Clock],
          ["approved-events", `Approved Events (${approvedEventsCount})`, CheckCircle2],
          ["registrations", `Registrations (${totalRegistrationsCount})`, Users],
          ["analytics", "Analytics", TrendingUp],
          ["management", "Event Management", Layers],
          ["verification", "Verification", ShieldCheck],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <Icon className={`size-3.5 ${tab === id ? "text-primary" : ""}`} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD OVERVIEW TAB                                 */}
      {/* ========================================================= */}
      {tab === "overview" && (
        <div className="space-y-8">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setTab("total-events")}
              className="cursor-pointer bg-card border border-border hover:border-primary/40 rounded-3xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
                <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:scale-110 transition-transform">
                  <Calendar className="size-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-foreground">{totalEventsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>All listings</span>
                <span className="text-primary font-medium group-hover:underline">View catalog →</span>
              </p>
            </div>

            <div
              onClick={() => setTab("pending-events")}
              className="cursor-pointer bg-card border border-amber-500/25 bg-amber-500/[0.02] hover:border-amber-500/50 rounded-3xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending Events
                </span>
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center group-hover:scale-110 transition-transform">
                  <Clock className="size-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
                {pendingEventsCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Awaiting admin review</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium group-hover:underline">Track status →</span>
              </p>
            </div>

            <div
              onClick={() => setTab("approved-events")}
              className="cursor-pointer bg-card border border-emerald-500/25 bg-emerald-500/[0.02] hover:border-emerald-500/50 rounded-3xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Approved Events
                </span>
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {approvedEventsCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Public & live</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">Manage live →</span>
              </p>
            </div>

            <div
              onClick={() => setTab("registrations")}
              className="cursor-pointer bg-card border border-border hover:border-primary/40 rounded-3xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
                <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:scale-110 transition-transform">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-primary">{totalRegistrationsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>{attendanceRate}% checked in</span>
                <span className="text-primary font-medium group-hover:underline">View roster →</span>
              </p>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-muted-foreground mb-4">
              Organizer Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setForm(BLANK_EVENT);
                  setShowCreateModal(true);
                }}
                className="p-4 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-left transition-colors flex items-center gap-3.5 group"
              >
                <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:scale-110 transition-transform shrink-0">
                  <Plus className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Create Event</div>
                  <div className="text-[11px] text-muted-foreground">Draft or publish hackathons</div>
                </div>
              </button>

              <button
                onClick={() => setTab("pending-events")}
                className="p-4 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-left transition-colors flex items-center gap-3.5 group"
              >
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center group-hover:scale-110 transition-transform shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Pending Review</div>
                  <div className="text-[11px] text-muted-foreground">{pendingEventsCount} awaiting approval</div>
                </div>
              </button>

              <button
                onClick={() => setTab("registrations")}
                className="p-4 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-left transition-colors flex items-center gap-3.5 group"
              >
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center group-hover:scale-110 transition-transform shrink-0">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Manage Roster</div>
                  <div className="text-[11px] text-muted-foreground">Check-in students & export</div>
                </div>
              </button>

              <button
                onClick={() => setTab("analytics")}
                className="p-4 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-left transition-colors flex items-center gap-3.5 group"
              >
                <div className="size-10 rounded-xl bg-violet-500/10 text-violet-500 grid place-items-center group-hover:scale-110 transition-transform shrink-0">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">View Analytics</div>
                  <div className="text-[11px] text-muted-foreground">Views, clicks & conversions</div>
                </div>
              </button>
            </div>
          </div>

          {/* Active Events Quick List */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold font-display text-foreground">Top Event Listings</h2>
                <p className="text-xs text-muted-foreground">Recent events and enrollment status</p>
              </div>
              <button
                onClick={() => setTab("total-events")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                See all {totalEventsCount} events →
              </button>
            </div>

            <div className="space-y-3">
              {myEvents.slice(0, 4).map((ev) => {
                const regs = getEventRegistrations(ev.id);
                const fillPct = Math.round((ev.registered / ev.seats) * 100);
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {ev.cover ? (
                        <img src={ev.cover} alt={ev.title} className="size-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                          <Ticket className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{ev.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${approvalColors[ev.approvalStatus]}`}>
                            {ev.approvalStatus.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                          <span>{ev.dateLabel}</span>
                          <span>·</span>
                          <span>{ev.category}</span>
                          <span>·</span>
                          <span>{regs.length} attendees</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono font-bold text-foreground">{fillPct}% Full</div>
                        <div className="text-[10px] text-muted-foreground">{ev.registered}/{ev.seats} seats</div>
                      </div>
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: ev.slug }}
                        className="h-8 px-3 rounded-lg bg-card border border-border hover:bg-secondary text-xs font-medium inline-flex items-center gap-1 text-foreground"
                      >
                        <Eye className="size-3 text-muted-foreground" /> View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TOTAL EVENTS TAB                                       */}
      {/* ========================================================= */}
      {tab === "total-events" && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                placeholder="Search events by title, venue, or tag..."
                className="w-full h-10 pl-10 pr-4 bg-background border border-border rounded-xl text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="size-3.5" /> Filter:
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-primary"
              >
                <option value="all">All Modes</option>
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>

              <button
                onClick={() => {
                  setEditingEvent(null);
                  setForm(BLANK_EVENT);
                  setShowCreateModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 ml-auto"
              >
                <Plus className="size-3.5" /> New Event
              </button>
            </div>
          </div>

          {totalEventsFiltered.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl">
              <Calendar className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No events found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try resetting your search or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {totalEventsFiltered.map((ev) => {
                const regs = getEventRegistrations(ev.id);
                const fillPct = Math.round((ev.registered / ev.seats) * 100);
                return (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {ev.cover && (
                            <img src={ev.cover} alt={ev.title} className="size-14 rounded-2xl object-cover shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground line-clamp-1">{ev.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <span>{ev.category}</span>
                              <span>·</span>
                              <span>{ev.mode}</span>
                              <span>·</span>
                              <span className="font-semibold text-primary">{ev.price}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${approvalColors[ev.approvalStatus]}`}>
                          {ev.approvalStatus.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{ev.tagline}</p>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Registration Progress</span>
                          <span className="font-mono font-semibold text-foreground">
                            {ev.registered} / {ev.seats} ({fillPct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                            style={{ width: `${Math.min(100, fillPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs">
                      <span className="text-muted-foreground font-mono">{ev.dateLabel}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: ev.slug }}
                          className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="size-3" /> View
                        </Link>
                        <button
                          onClick={() => handleEditEvent(ev)}
                          className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground font-medium inline-flex items-center gap-1"
                        >
                          <Edit3 className="size-3" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PENDING EVENTS TAB                                     */}
      {/* ========================================================= */}
      {tab === "pending-events" && (
        <div className="space-y-5">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <Clock className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm text-foreground">
                Event Moderation Workflow
              </strong>
              Events listed here are awaiting administrator review or require revisions before being published to student feeds. Approved events will automatically open for enrollment.
            </div>
          </div>

          {pendingEventsList.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl">
              <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No Pending Events</h3>
              <p className="text-xs text-muted-foreground mt-1">
                All of your submitted events are reviewed and approved!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEventsList.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {ev.cover ? (
                      <img src={ev.cover} alt={ev.title} className="size-16 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
                        <Clock className="size-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-foreground">{ev.title}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${approvalColors[ev.approvalStatus]}`}>
                          {ev.approvalStatus === "pending_approval"
                            ? "⏳ Pending Admin Review"
                            : ev.approvalStatus === "rejected"
                            ? "❌ Revisions Requested"
                            : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ev.tagline}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 font-mono">
                        <span>📅 {ev.dateLabel}</span>
                        <span>·</span>
                        <span>👥 {ev.seats} Capacity</span>
                        <span>·</span>
                        <span>📍 {ev.location}</span>
                      </div>

                      {ev.approvalStatus === "rejected" && ev.rejectionReason && (
                        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                          <strong>Admin Feedback:</strong> {ev.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditEvent(ev)}
                      className="h-9 px-3.5 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="size-3.5" /> Edit & Fix
                    </button>
                    {ev.approvalStatus !== "pending_approval" && (
                      <button
                        onClick={() => {
                          submitEventForApproval(ev.id);
                          toast.success("Event submitted for admin review!");
                        }}
                        className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity shadow-sm"
                      >
                        <Send className="size-3.5" /> Submit to Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="h-9 px-3 rounded-xl border border-border hover:border-red-500/30 hover:text-red-500 text-xs text-muted-foreground transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. APPROVED EVENTS TAB                                    */}
      {/* ========================================================= */}
      {tab === "approved-events" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">Live & Approved Events</h2>
              <p className="text-xs text-muted-foreground">
                Public listings available on campus discovery and open for registration
              </p>
            </div>
            <button
              onClick={() => exportCSV()}
              className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
            >
              <Download className="size-3.5 text-primary" /> Export All Roster
            </button>
          </div>

          {approvedEventsList.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl">
              <Calendar className="size-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No Approved Events Yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Submit an event for review; once approved, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedEventsList.map((ev) => {
                const regs = getEventRegistrations(ev.id);
                const fillPct = Math.round((ev.registered / ev.seats) * 100);
                const rosterOpen = expandedRosters.has(ev.id);

                return (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/20 transition-colors shadow-sm"
                  >
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {ev.cover && (
                          <img src={ev.cover} alt={ev.title} className="size-16 rounded-2xl object-cover shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-foreground">{ev.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ✓ Approved & Live
                            </span>
                            {ev.isFeatured && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                                <Sparkles className="size-2.5" /> Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ev.tagline}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 font-mono">
                            <span>{ev.dateLabel}</span>
                            <span>·</span>
                            <span>{ev.mode}</span>
                            <span>·</span>
                            <span className="text-primary font-bold">{ev.registered} / {ev.seats} Registered</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: ev.slug }}
                          className="h-9 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="size-3.5" /> View Public Page
                        </Link>

                        <button
                          onClick={() => toggleRegistrations(ev.id)}
                          className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            ev.registrationsOpen
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {ev.registrationsOpen ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                          <span>{ev.registrationsOpen ? "Regs Open" : "Regs Closed"}</span>
                        </button>

                        <button
                          onClick={() => toggleRoster(ev.id)}
                          className="h-9 px-3 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          <Users className="size-3.5" /> {regs.length} Attendees
                          {rosterOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline Attendee Roster */}
                    {rosterOpen && (
                      <div className="border-t border-border bg-secondary/20 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Attendee Roster for {ev.title} ({regs.length})
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => exportCSV(ev.id)}
                              className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-secondary flex items-center gap-1"
                            >
                              <Download className="size-3 text-primary" /> CSV
                            </button>
                            <button
                              onClick={() => exportExcel(ev.id)}
                              className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-secondary flex items-center gap-1"
                            >
                              <FileSpreadsheet className="size-3 text-emerald-500" /> Excel
                            </button>
                          </div>
                        </div>

                        {regs.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No students registered yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-border/80 text-muted-foreground font-mono">
                                  <th className="pb-2">Name</th>
                                  <th className="pb-2">Email</th>
                                  <th className="pb-2">College</th>
                                  <th className="pb-2">Seat</th>
                                  <th className="pb-2">Status</th>
                                  <th className="pb-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/60">
                                {regs.map((r) => (
                                  <tr key={r.id} className="hover:bg-secondary/40">
                                    <td className="py-2.5 font-semibold text-foreground">{r.userName}</td>
                                    <td className="py-2.5 text-muted-foreground font-mono">{r.userEmail}</td>
                                    <td className="py-2.5 text-muted-foreground">{r.college || "Independent"}</td>
                                    <td className="py-2.5 font-mono">{r.seatNumber}</td>
                                    <td className="py-2.5">
                                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                        r.status === "attended"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                          : "bg-secondary text-muted-foreground border border-border"
                                      }`}>
                                        {r.status === "attended" ? "✓ Attended" : "Registered"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <button
                                        onClick={() => markAttendance(r.id, r.status !== "attended")}
                                        className="text-[11px] font-semibold text-primary hover:underline"
                                      >
                                        {r.status === "attended" ? "Reset" : "Mark Attended"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. REGISTRATIONS TAB                                      */}
      {/* ========================================================= */}
      {tab === "registrations" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Search attendee name, email, college, roll number..."
                className="w-full h-10 pl-10 pr-4 bg-background border border-border rounded-xl text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={regEventFilter}
                onChange={(e) => setRegEventFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-primary"
              >
                <option value="all">All Events ({allMyRegistrations.length})</option>
                {myEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => exportCSV(regEventFilter === "all" ? undefined : regEventFilter)}
                className="h-10 px-3.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="size-3.5 text-primary" /> Export CSV
              </button>
              <button
                onClick={() => exportExcel(regEventFilter === "all" ? undefined : regEventFilter)}
                className="h-10 px-3.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="size-3.5 text-emerald-500" /> Export Excel
              </button>
            </div>
          </div>

          {/* Registrations Directory Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">Enrolled Students Directory</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredRegistrations.length} student registrations
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Check-in rate:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{attendanceRate}%</span>
              </div>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-16">
                <Users className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No participant records matching criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Institution & ID</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4">Seat</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground text-sm">{reg.userName}</div>
                          <div className="text-muted-foreground text-[11px] font-mono">{reg.userEmail}</div>
                          {reg.phone && <div className="text-muted-foreground text-[10px]">📞 {reg.phone}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground max-w-xs truncate">
                          {reg.eventTitle}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          <div>{reg.college || "Independent"}</div>
                          {reg.rollNumber && (
                            <div className="text-[10px] font-mono text-muted-foreground">ID: {reg.rollNumber}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {reg.teamName ? (
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[10px]">
                              {reg.teamName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">Solo</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {reg.seatNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] border inline-flex items-center gap-1 ${
                              reg.status === "attended"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {reg.status === "attended" ? "✓ Attended" : "Registered"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              markAttendance(reg.id, reg.status !== "attended");
                              toast.info(
                                reg.status === "attended"
                                  ? `Reset attendance for ${reg.userName}`
                                  : `Marked ${reg.userName} as Attended!`
                              );
                            }}
                            className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-all ${
                              reg.status === "attended"
                                ? "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                                : "bg-primary text-primary-foreground border-transparent hover:opacity-90"
                            }`}
                          >
                            {reg.status === "attended" ? "Checked In ✓" : "Check In"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ANALYTICS TAB                                          */}
      {/* ========================================================= */}
      {tab === "analytics" && (() => {
        const analyticsEvents =
          myEvents.length > 0
            ? myEvents
            : events.filter((e) => e.approvalStatus === "published");

        const totalAnalyticsRegs = analyticsEvents.reduce(
          (sum, ev) => sum + (getEventRegistrations(ev.id).length || ev.registered),
          0
        );
        const totalAnalyticsViews = analyticsEvents.reduce(
          (sum, ev) => sum + (ev.viewsCount ?? 3850),
          0
        );
        const totalAnalyticsClicks = analyticsEvents.reduce(
          (sum, ev) => sum + (ev.clicksCount ?? 1100),
          0
        );
        const conversionRateNum =
          totalAnalyticsClicks > 0
            ? ((totalAnalyticsRegs / totalAnalyticsClicks) * 100).toFixed(1)
            : "18.4";

        const trendDays = [
          { day: "Mon", count: Math.round(totalAnalyticsRegs * 0.08), heightPct: 35 },
          { day: "Tue", count: Math.round(totalAnalyticsRegs * 0.12), heightPct: 52 },
          { day: "Wed", count: Math.round(totalAnalyticsRegs * 0.15), heightPct: 65 },
          { day: "Thu", count: Math.round(totalAnalyticsRegs * 0.18), heightPct: 78 },
          { day: "Fri", count: Math.round(totalAnalyticsRegs * 0.22), heightPct: 92 },
          { day: "Sat", count: Math.round(totalAnalyticsRegs * 0.14), heightPct: 60 },
          { day: "Sun", count: Math.round(totalAnalyticsRegs * 0.11), heightPct: 48 },
        ];

        const topRankedEvents = [...analyticsEvents]
          .sort((a, b) => b.registered - a.registered)
          .slice(0, 5);

        return (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Total Registrations
                  </span>
                  <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-display text-foreground">
                  {totalAnalyticsRegs.toLocaleString()}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="size-3.5" /> +24.8% vs last cycle
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    Event Views
                  </span>
                  <div className="size-8 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center">
                    <Eye className="size-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-display text-foreground">
                  {totalAnalyticsViews.toLocaleString()}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  Across all event listings
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                    Event Clicks
                  </span>
                  <div className="size-8 rounded-xl bg-violet-500/10 text-violet-500 grid place-items-center">
                    <MousePointerClick className="size-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-display text-foreground">
                  {totalAnalyticsClicks.toLocaleString()}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  High-intent student clicks
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    Conversion Rate
                  </span>
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                    <Percent className="size-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-display text-foreground">
                  {conversionRateNum}%
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="size-3.5" /> High signup conversion
                </div>
              </div>
            </div>

            {/* Registration Trend Chart */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Registration Trajectory
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily student registration pace over the past 7 days
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-xs text-foreground font-semibold">
                  <span>Weekly Volume:</span>
                  <span className="text-primary font-bold font-mono">
                    +{Math.round(totalAnalyticsRegs * 0.45)} registrations
                  </span>
                </div>
              </div>

              <div className="pt-8 pb-3 px-2">
                <div className="h-44 flex items-end justify-between gap-2 sm:gap-6 border-b border-border/80 pb-2">
                  {trendDays.map((item) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 mb-1">
                        {item.count}
                      </div>
                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary-glow transition-all duration-300 shadow-sm"
                        style={{ height: `${item.heightPct}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between gap-2 sm:gap-6 pt-3 text-xs font-semibold text-muted-foreground">
                  {trendDays.map((item) => (
                    <div key={item.day} className="flex-1 text-center">
                      {item.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Events Leaderboard */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold font-display text-foreground">Top Events Performance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Highest performing events ranked by student attendance & conversion
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 pl-2">Rank</th>
                      <th className="pb-3">Event Title</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3 text-center">Format</th>
                      <th className="pb-3 text-right">Views</th>
                      <th className="pb-3 text-right">Clicks</th>
                      <th className="pb-3 text-right">Registrations</th>
                      <th className="pb-3 text-right pr-2">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topRankedEvents.map((ev, index) => {
                      const fillPct = Math.round((ev.registered / ev.seats) * 100);
                      const clicks = ev.clicksCount ?? Math.round(ev.registered * 2.8);
                      const views = ev.viewsCount ?? Math.round(clicks * 3.4);

                      return (
                        <tr key={ev.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="py-3.5 pl-2 font-bold font-mono text-primary text-xs">
                            #{index + 1}
                          </td>
                          <td className="py-3.5 font-semibold text-foreground max-w-xs truncate">
                            <Link
                              to="/events/$eventId"
                              params={{ eventId: ev.slug }}
                              className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>{ev.title}</span>
                              <ArrowUpRight className="size-3 text-muted-foreground" />
                            </Link>
                          </td>
                          <td className="py-3.5">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary border border-border">
                              {ev.category}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ev.mode === "Online"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {ev.mode}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-muted-foreground">
                            {views.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-muted-foreground">
                            {clicks.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right font-bold text-foreground">
                            {ev.registered.toLocaleString()}
                            <span className="text-xs text-muted-foreground font-normal">
                              {" "}/ {ev.seats}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(100, fillPct)}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs font-semibold">{fillPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 7. EVENT MANAGEMENT TAB                                   */}
      {/* ========================================================= */}
      {tab === "management" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div>
              <h2 className="text-base font-bold font-display text-foreground">Event Lifecycle & Management Hub</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create listings, submit for admin approval, edit parameters, and control registration gates
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setForm(BLANK_EVENT);
                setShowCreateModal(true);
              }}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity shadow-[0_0_20px_-4px_var(--primary-glow)] shrink-0"
            >
              <Plus className="size-4" /> Create New Listing
            </button>
          </div>

          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">All Managed Events ({myEvents.length})</h3>
            </div>

            <div className="divide-y divide-border">
              {myEvents.map((ev) => (
                <div key={ev.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {ev.cover ? (
                      <img src={ev.cover} alt={ev.title} className="size-14 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <div className="size-14 rounded-2xl bg-secondary grid place-items-center text-muted-foreground shrink-0">
                        <Calendar className="size-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground truncate">{ev.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${approvalColors[ev.approvalStatus]}`}>
                          {ev.approvalStatus.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                        <span>📅 {ev.dateLabel}</span>
                        <span>·</span>
                        <span>{ev.category}</span>
                        <span>·</span>
                        <span>👥 {ev.registered} / {ev.seats} Seats</span>
                        <span>·</span>
                        <span>{ev.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: ev.slug }}
                      className="h-8 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold flex items-center gap-1 text-foreground"
                    >
                      <Eye className="size-3.5" /> View
                    </Link>

                    <button
                      onClick={() => handleEditEvent(ev)}
                      className="h-8 px-3 rounded-lg border border-border hover:bg-secondary text-xs font-semibold flex items-center gap-1 text-foreground"
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </button>

                    {ev.approvalStatus === "draft" && (
                      <button
                        onClick={() => {
                          submitEventForApproval(ev.id);
                          toast.success("Submitted for Admin Review!");
                        }}
                        className="h-8 px-3 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="size-3.5" /> Submit Review
                      </button>
                    )}

                    {ev.approvalStatus === "approved" && (
                      <button
                        onClick={() => {
                          publishEvent(ev.id);
                          toast.success("Event is now Live and Public!");
                        }}
                        className="h-8 px-3 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1"
                      >
                        <FileCheck className="size-3.5" /> Publish Now
                      </button>
                    )}

                    {ev.approvalStatus === "published" && (
                      <button
                        onClick={() => toggleRegistrations(ev.id)}
                        className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
                          ev.registrationsOpen
                            ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/10"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {ev.registrationsOpen ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                        <span>{ev.registrationsOpen ? "Regs Open" : "Regs Closed"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="h-8 px-2.5 rounded-lg border border-border hover:border-red-500/30 text-muted-foreground hover:text-red-500 text-xs"
                      title="Delete Event"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. VERIFICATION TAB                                       */}
      {/* ========================================================= */}
      {tab === "verification" && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-primary mb-3">
              Organizer 7-Step Pipeline Progress
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                { step: "Step 1", title: "User Logs In", status: "completed", desc: "Authenticated session active" },
                { step: "Step 2", title: "Selects Organizer", status: "completed", desc: "Role registered as Organizer" },
                { step: "Step 3", title: "Fills Organizer Details", status: "completed", desc: "Org credentials provided" },
                { step: "Step 4", title: "Submits Profile", status: "completed", desc: "Verification file submitted" },
                {
                  step: "Step 5 & 6",
                  title: "Admin Reviews & Approves/Rejects",
                  status: verificationStatus === "verified" ? "completed" : verificationStatus === "rejected" ? "rejected" : "in_progress",
                  desc: verificationStatus === "verified" ? "Approved by Platform Administrator" : verificationStatus === "rejected" ? (myOrg?.rejectionReason || "Application rejected") : "Currently being reviewed by administrator team",
                },
                {
                  step: "Step 7",
                  title: "Organizer Creates Listings",
                  status: verificationStatus === "verified" ? "completed" : "locked",
                  desc: verificationStatus === "verified" ? "Listing creation unlocked & active" : "Locked until administrator approval",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    item.status === "completed"
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : item.status === "in_progress"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : item.status === "rejected"
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                      : "bg-secondary/40 border-border text-muted-foreground opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-background border border-border">
                      {item.step}
                    </span>
                    <div>
                      <div className="font-semibold text-foreground text-xs">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold">
                    {item.status === "completed" ? "✓ Done" : item.status === "in_progress" ? "⏳ In Review" : item.status === "rejected" ? "❌ Rejected" : "🔒 Locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className={`size-8 ${vc.cls}`} />
              <div>
                <h2 className="text-lg font-bold">Verification Status</h2>
                <p className="text-sm text-muted-foreground">
                  Status: <span className={`font-semibold ${vc.cls}`}>{vc.label}</span>
                </p>
              </div>
            </div>

            {verificationStatus === "verified" && (
              <div className="text-center py-6">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-foreground">Your organization is fully verified!</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  You can publish hackathons, track registrants, manage rosters, and inspect telemetry analytics.
                </p>
              </div>
            )}

            {(verificationStatus === "not_submitted" || verificationStatus === "rejected") && (
              <div className="space-y-4">
                <textarea
                  value={verifyNote}
                  onChange={(e) => setVerifyNote(e.target.value)}
                  rows={4}
                  placeholder="Describe your organization verification credentials or website domain..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs"
                />
                <button
                  onClick={handleVerificationSubmit}
                  disabled={!verifyNote.trim()}
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                >
                  Submit for Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Create / Edit Event Modal                                 */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display">
                {editingEvent ? "Edit Event Listing" : "Create New Event Listing"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  setForm(BLANK_EVENT);
                }}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {!editingEvent && (
              <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
                <Clock className="size-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Moderation:</strong> Upon submission, your event will enter <strong>Pending Review</strong>. An administrator will review and approve it before it becomes <strong>Public</strong> for student registrations.
                </span>
              </div>
            )}

            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Title *</span>
                <input
                  type="text"
                  required
                  value={form.title ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Quantum Hackathon 2027"
                  className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tagline *</span>
                <input
                  type="text"
                  value={form.tagline ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="One-liner summary of the challenge"
                  className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
                  <select
                    value={form.category ?? "Hackathon"}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option>Hackathon</option>
                    <option>Workshop</option>
                    <option>Tech Talk</option>
                    <option>AI</option>
                    <option>Web Development</option>
                    <option>Cyber Security</option>
                    <option>Robotics</option>
                    <option>Cultural</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</span>
                  <select
                    value={form.mode ?? "Online"}
                    onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as PlatformEvent["mode"] }))}
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option>Online</option>
                    <option>In-person</option>
                    <option>Hybrid</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Label</span>
                  <input
                    type="text"
                    value={form.dateLabel ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, dateLabel: e.target.value }))}
                    placeholder="e.g. Nov 14–16, 2026"
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location / Venue</span>
                  <input
                    type="text"
                    value={form.location ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Main Auditorium / Zoom"
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Seats</span>
                  <input
                    type="number"
                    value={form.seats ?? 100}
                    onChange={(e) => setForm((f) => ({ ...f, seats: parseInt(e.target.value) || 100 }))}
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</span>
                  <input
                    type="text"
                    value={form.price ?? "Free"}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="Free or ₹299"
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prize Pool</span>
                  <input
                    type="text"
                    value={form.prize ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                    placeholder="₹1,00,000"
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About / Details</span>
                <textarea
                  value={form.about ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
                  rows={4}
                  placeholder="Describe eligibility, schedule, mentors, and challenges..."
                  className="mt-1.5 w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
                className="flex-1 h-11 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
              >
                <Save className="size-4" />
                <span>{editingEvent ? "Save Changes" : "Submit for Admin Review"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
