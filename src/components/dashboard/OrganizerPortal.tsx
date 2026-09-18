import { useState } from "react";
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
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import type { PlatformEvent } from "@/lib/platform-store";
import { UserAvatar } from "@/components/ui/UserAvatar";

type Tab = "events" | "verification" | "analytics";

const BLANK_EVENT: Partial<PlatformEvent> = {
  title: "",
  tagline: "",
  category: "Hackathon",
  mode: "Online",
  location: "Virtual",
  dateLabel: "",
  dateISO: new Date().toISOString().slice(0, 10),
  durationLabel: "",
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

  const [tab, setTab] = useState<Tab>("events");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlatformEvent | null>(null);
  const [form, setForm] = useState<Partial<PlatformEvent>>(BLANK_EVENT);
  const [expandedRosters, setExpandedRosters] = useState<Set<string>>(new Set());
  const [verifyNote, setVerifyNote] = useState("");
  const [verifySubmitted, setVerifySubmitted] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "draft">("all");

  const myEvents = events.filter((e) => e.organizerId === user?.id);
  const myOrg = organizers.find((o) => o.userId === user?.id);

  const totalEventsCount = myEvents.length;
  const pendingEventsCount = myEvents.filter((e) => e.approvalStatus === "pending_approval").length;
  const approvedEventsCount = myEvents.filter(
    (e) => e.approvalStatus === "published" || e.approvalStatus === "approved"
  ).length;
  const totalRegistrationsCount = myEvents.reduce(
    (sum, ev) => sum + getEventRegistrations(ev.id).length,
    0
  );

  const filteredEvents = myEvents.filter((e) => {
    if (statusFilter === "pending") return e.approvalStatus === "pending_approval";
    if (statusFilter === "approved")
      return e.approvalStatus === "published" || e.approvalStatus === "approved";
    if (statusFilter === "draft") return e.approvalStatus === "draft";
    return true;
  });

  const approvalColors = {
    draft: "text-muted-foreground bg-secondary border-border",
    pending_approval: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    approved: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    rejected: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
    published: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      updateEvent(editingEvent.id, form);
    } else {
      createEvent({
        ...form,
        organizerId: user?.id ?? "usr_org_1",
        organizerName: user?.name ?? "Organizer",
      });
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

  const toggleRoster = (eventId: string) => {
    setExpandedRosters((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const exportCSV = (eventId: string) => {
    const regs = getEventRegistrations(eventId);
    const header = "Name,Email,Phone,College,Degree,Year,Roll Number,GitHub,LinkedIn,Skills,Participation,Team Name,Team Role,T-Shirt,Seat,Status,Registered At\n";
    const rows = regs
      .map(
        (r) =>
          `"${r.userName}","${r.userEmail}","${r.phone ?? ""}","${r.college ?? ""}","${r.degree ?? ""}","${r.yearOfStudy ?? ""}","${r.rollNumber ?? ""}","${r.githubUrl ?? ""}","${r.linkedinUrl ?? ""}","${(r.skills || []).join("; ")}","${r.participationType ?? "solo"}","${r.teamName ?? ""}","${r.teamRole ?? ""}","${r.tshirtSize ?? ""}","${r.seatNumber}","${r.status}","${r.registeredAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = (eventId: string) => {
    const regs = getEventRegistrations(eventId);
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
    a.download = `participants-${eventId}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerificationSubmit = () => {
    if (!verifyNote.trim()) return;
    submitVerification(verifyNote);
    setVerifySubmitted(true);
  };

  const verificationStatus = myOrg?.verificationStatus ?? user?.verificationStatus ?? "not_submitted";

  const verificationConfig = {
    not_submitted: { label: "Not Submitted", icon: AlertCircle, cls: "text-muted-foreground" },
    pending: { label: "Under Review", icon: Clock, cls: "text-amber-500" },
    verified: { label: "Verified ✓", icon: CheckCircle2, cls: "text-emerald-500" },
    rejected: { label: "Rejected", icon: XCircle, cls: "text-red-500" },
    suspended: { label: "Suspended", icon: XCircle, cls: "text-red-500" },
  };

  const vc = verificationConfig[verificationStatus as keyof typeof verificationConfig];

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
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  verificationStatus === "verified"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                <vc.icon className="size-3" /> {vc.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.headline}</p>
          </div>
        </div>
        {verificationStatus === "verified" ? (
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
        ) : (
          <button
            onClick={() => setTab("verification")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-semibold hover:bg-amber-500/15 transition-colors"
            title="Account must be verified by admin before creating listings"
          >
            <Clock className="size-4" />
            {verificationStatus === "pending" ? "Pending Approval (Step 5 of 7)" : "Complete Verification to Create Listings"}
          </button>
        )}
      </div>

      {/* Organizer Flow Status Banner */}
      {verificationStatus === "pending" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-foreground text-sm">
                Organizer Approval in Progress (Step 5 of 7: Admin Review)
              </strong>
              Your organization profile has been submitted and is currently under review by platform administrators. Once approved in Step 6, you will unlock Step 7 to create and publish event listings for students.
            </div>
          </div>
          <button
            onClick={() => setTab("verification")}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-medium transition-colors"
          >
            View Verification Status →
          </button>
        </div>
      )}

      {verificationStatus === "rejected" && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-foreground text-sm">
                Organizer Verification Rejected (Step 6)
              </strong>
              {myOrg?.rejectionReason ? `Reason: ${myOrg.rejectionReason}` : "Your submitted details were not approved by administrators."} Please update your verification documents in the Verification tab to resubmit.
            </div>
          </div>
          <button
            onClick={() => setTab("verification")}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-medium transition-colors"
          >
            Update Documents →
          </button>
        </div>
      )}

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Calendar className="size-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-display text-foreground">{totalEventsCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Managed event listings</p>
        </div>

        <div className="bg-card border border-amber-500/20 bg-amber-500/[0.02] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Events
            </span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
            {pendingEventsCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-card border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Approved Events
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {approvedEventsCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Live & public for registration</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-display text-primary">{totalRegistrationsCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Total enrolled students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-8 w-fit">
        {([
          ["events", "My Events", BarChart2],
          ["verification", "Verification", ShieldCheck],
          ["analytics", "Analytics", BarChart2],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {tab === "events" && (
        <div className="space-y-4">
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="inline-flex p-1 bg-secondary/80 rounded-xl border border-border">
              {[
                ["all", `All (${totalEventsCount})`],
                ["pending", `Pending Review (${pendingEventsCount})`],
                ["approved", `Approved (${approvedEventsCount})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Plus className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "No events yet. Create your first event listing!"
                  : `No ${statusFilter} events found.`}
              </p>
            </div>
          )}
          {filteredEvents.map((ev) => {
            const regs = getEventRegistrations(ev.id);
            const rosterOpen = expandedRosters.has(ev.id);
            const fillPct = Math.round((ev.registered / ev.seats) * 100);

            return (
              <div
                key={ev.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
              >
                <div className="p-5 flex flex-col sm:flex-row gap-4">
                  {ev.cover && (
                    <img
                      src={ev.cover}
                      alt={ev.title}
                      className="size-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{ev.title}</span>
                      <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        approvalColors[ev.approvalStatus]
                      }`}
                    >
                      {ev.approvalStatus === "pending_approval"
                        ? "⏳ Pending Admin Review"
                        : ev.approvalStatus === "published"
                        ? "✓ Public & Live"
                        : ev.approvalStatus.replace("_", " ")}
                    </span>
                  </div>

                  {ev.approvalStatus === "pending_approval" && (
                    <div className="mt-2 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Clock className="size-3.5 shrink-0" />
                      <span>
                        <strong>Event Approval Workflow:</strong> This event is in Pending Review. It will become public and open for student registrations as soon as an administrator approves it.
                      </span>
                    </div>
                  )}
                    <p className="text-xs text-muted-foreground line-clamp-1">{ev.tagline}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>{ev.dateLabel}</span>
                      <span>{ev.mode}</span>
                      <span>{ev.registered}/{ev.seats} registered ({fillPct}%)</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden max-w-xs">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {ev.approvalStatus === "draft" && (
                      <>
                        <button
                          onClick={() => handleEditEvent(ev)}
                          className="h-9 px-3 rounded-lg border border-border text-xs flex items-center gap-1 hover:bg-secondary"
                        >
                          <Edit3 className="size-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => submitEventForApproval(ev.id)}
                          className="h-9 px-3 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs flex items-center gap-1 hover:bg-amber-500/25"
                        >
                          <Send className="size-3.5" /> Submit
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                    {ev.approvalStatus === "approved" && (
                      <button
                        onClick={() => publishEvent(ev.id)}
                        className="h-9 px-4 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-500/25"
                      >
                        <FileCheck className="size-3.5" /> Publish Now
                      </button>
                    )}
                    {(ev.approvalStatus === "published") && (
                      <button
                        onClick={() => toggleRegistrations(ev.id)}
                        className={`h-9 px-3 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                          ev.registrationsOpen
                            ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                        title={ev.registrationsOpen ? "Close registrations" : "Open registrations"}
                      >
                        {ev.registrationsOpen ? (
                          <ToggleRight className="size-4" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                        {ev.registrationsOpen ? "Regs Open" : "Regs Closed"}
                      </button>
                    )}
                    <button
                      onClick={() => toggleRoster(ev.id)}
                      className="h-9 px-3 rounded-lg border border-border text-xs flex items-center gap-1 hover:bg-secondary"
                    >
                      <Users className="size-3.5" /> {regs.length} Participants
                      {rosterOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </button>
                  </div>
                </div>

                {/* Rejection note */}
                {ev.approvalStatus === "rejected" && ev.rejectionReason && (
                  <div className="px-5 pb-4">
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <strong>Rejection reason:</strong> {ev.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Participant Roster */}
                {rosterOpen && (
                  <div className="border-t border-border">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30">
                      <div>
                        <span className="text-sm font-semibold text-foreground">Participant Roster</span>
                        <span className="text-xs text-muted-foreground ml-2">({regs.length} registered students)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportCSV(ev.id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors shadow-sm"
                        >
                          <Download className="size-3.5 text-primary" /> Export CSV
                        </button>
                        <button
                          onClick={() => exportExcel(ev.id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors shadow-sm"
                        >
                          <FileSpreadsheet className="size-3.5 text-emerald-500" /> Export Excel
                        </button>
                      </div>
                    </div>
                    {regs.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-4 pb-4 pt-2">No registrations yet.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {regs.map((reg) => (
                          <div
                            key={reg.id}
                            className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{reg.userName}</span>
                                {reg.teamName && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                    Team: {reg.teamName}
                                  </span>
                                )}
                                {reg.experienceLevel && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                    {reg.experienceLevel}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                <span className="text-foreground/90 font-medium">{reg.userEmail}</span>
                                {reg.phone && <span>· 📞 {reg.phone}</span>}
                                <span>· 🎓 {reg.college ?? "Independent"}</span>
                                {reg.degree && <span>({reg.degree})</span>}
                                <span>· 📅 Registered {new Date(reg.registeredAt).toLocaleDateString()}</span>
                                {reg.rollNumber && <span className="font-mono">· ID: {reg.rollNumber}</span>}
                              </div>
                              {(reg.githubUrl || (reg.skills && reg.skills.length > 0)) && (
                                <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {reg.githubUrl && (
                                    <a
                                      href={reg.githubUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      GitHub Profile ↗
                                    </a>
                                  )}
                                  {reg.skills && reg.skills.length > 0 && (
                                    <span>· Skills: {reg.skills.join(", ")}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                                {reg.seatNumber}
                              </span>
                              <button
                                onClick={() => markAttendance(reg.id, reg.status !== "attended")}
                                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                  reg.status === "attended"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                                }`}
                              >
                                {reg.status === "attended" ? "✓ Attended" : "Mark Attended"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Tab */}
      {tab === "verification" && (
        <div className="max-w-3xl space-y-6">
          {/* Visual 7-Step Pipeline Card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-primary mb-3">
              Organizer Approval Flow Progress
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                { step: "Step 1", title: "User Logs In", status: "completed", desc: "Authenticated session active" },
                { step: "Step 2", title: "Selects Organizer", status: "completed", desc: "Role chosen as Organizer" },
                { step: "Step 3", title: "Fills Organizer Details", status: "completed", desc: "Org name, website, and documents entered" },
                { step: "Step 4", title: "Organizer Submits Profile", status: "completed", desc: "Profile submitted for verification" },
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
              ].map((item, idx) => (
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

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className={`size-8 ${vc.cls}`} />
              <div>
                <h2 className="text-lg font-semibold">Verification Credentials</h2>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className={`font-semibold ${vc.cls}`}>{vc.label}</span>
                </p>
              </div>
            </div>

            {verificationStatus === "verified" && (
              <div className="text-center py-6">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Your organization is fully verified!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You can now create listings. When you create an event, it will enter Pending Review for quick admin approval before going live to students.
                </p>
                {myOrg?.documentsSubmitted && (
                  <div className="mt-4 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                    Documents on file: {myOrg.documentsSubmitted}
                  </div>
                )}
              </div>
            )}

            {verificationStatus === "pending" && (
              <div className="text-center py-6">
                <Clock className="size-12 text-amber-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Verification Under Review (Step 5 of 7)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our administrator team is reviewing your organization profile and credentials.
                </p>
                {myOrg?.documentsSubmitted && (
                  <div className="mt-4 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                    Submitted proof: {myOrg.documentsSubmitted}
                  </div>
                )}
              </div>
            )}

            {(verificationStatus === "not_submitted" || verificationStatus === "rejected") && (
              <div>
                {verificationStatus === "rejected" && myOrg?.rejectionReason && (
                  <div className="mb-4 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    Previous rejection: {myOrg.rejectionReason}
                  </div>
                )}
                {verifySubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-semibold">Verification documents submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our team will review within 2–3 business days.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Submit your organization documents for verification. Verified organizers can
                      directly publish events and access all platform features.
                    </p>
                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Document details / notes for reviewer
                      </span>
                      <textarea
                        value={verifyNote}
                        onChange={(e) => setVerifyNote(e.target.value)}
                        rows={4}
                        placeholder="e.g. Certificate of Incorporation #ABC123, Gov-issued ID of authorized representative, Organization website domain verification..."
                        className="mt-1.5 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </label>
                    <button
                      onClick={handleVerificationSubmit}
                      disabled={!verifyNote.trim()}
                      className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Submit for Verification
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
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

        // 7-Day Registration Trend Data
        const trendDays = [
          { day: "Mon", count: Math.round(totalAnalyticsRegs * 0.08), heightPct: 35 },
          { day: "Tue", count: Math.round(totalAnalyticsRegs * 0.12), heightPct: 52 },
          { day: "Wed", count: Math.round(totalAnalyticsRegs * 0.15), heightPct: 65 },
          { day: "Thu", count: Math.round(totalAnalyticsRegs * 0.18), heightPct: 78 },
          { day: "Fri", count: Math.round(totalAnalyticsRegs * 0.22), heightPct: 92 },
          { day: "Sat", count: Math.round(totalAnalyticsRegs * 0.14), heightPct: 60 },
          { day: "Sun", count: Math.round(totalAnalyticsRegs * 0.11), heightPct: 48 },
        ];

        // Top Events ranked by registered count
        const topRankedEvents = [...analyticsEvents]
          .sort((a, b) => b.registered - a.registered)
          .slice(0, 5);

        return (
          <div className="space-y-8">
            {/* Primary KPI Metrics: Registrations, Views, Clicks, Conversion Rate */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Registrations */}
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

              {/* 2. Total Views */}
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

              {/* 3. Event Clicks */}
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

              {/* 4. Conversion Rate */}
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
                    <TrendingUp className="size-4 text-primary" /> Registration Trend
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily student registration trajectory over the past 7 days
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-xs text-foreground font-semibold">
                  <span>Weekly Pace:</span>
                  <span className="text-primary font-bold font-mono">
                    +{Math.round(totalAnalyticsRegs * 0.45)} registrations
                  </span>
                </div>
              </div>

              {/* Trend Visualization Bars */}
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

            {/* Top Events Performance Leaderboard */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold font-display text-foreground">Top Events</h3>
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

      {/* Create / Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold font-display">
                {editingEvent ? "Edit Event" : "Create New Event"}
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
                  <strong>Event Approval Workflow:</strong> Upon submission, your event will enter <strong>Pending Review</strong>. An administrator will review and approve it before it becomes <strong>Public</strong> for student registrations.
                </span>
              </div>
            )}

            <div className="space-y-4">
              {([
                ["title", "Event Title", "text", "e.g. Quantum Hack 2027"],
                ["tagline", "Tagline", "text", "One-liner description"],
                ["dateLabel", "Date Label", "text", "e.g. Jan 15–17, 2027"],
                ["dateISO", "Date (ISO)", "date", ""],
                ["durationLabel", "Duration", "text", "e.g. 48 Hours"],
                ["location", "Location / Venue", "text", "e.g. Virtual · Zoom"],
                ["price", "Price", "text", "Free or ₹499"],
                ["prize", "Prize Pool (optional)", "text", "e.g. ₹5,00,000"],
              ] as const).map(([field, label, type, placeholder]) => (
                <label key={field} className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                  </span>
                  <input
                    type={type}
                    value={(form[field as keyof typeof form] as string) ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </label>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Mode
                  </span>
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
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Seats
                  </span>
                  <input
                    type="number"
                    value={form.seats ?? 100}
                    onChange={(e) => setForm((f) => ({ ...f, seats: parseInt(e.target.value) || 100 }))}
                    className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  About / Description
                </span>
                <textarea
                  value={form.about ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
                  rows={4}
                  placeholder="Describe your event..."
                  className="mt-1.5 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
                className="flex-1 h-11 border border-border rounded-xl text-sm hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_-4px_var(--primary-glow)] flex items-center justify-center gap-2"
              >
                {editingEvent ? (
                  <>
                    <Save className="size-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Event for Admin Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
