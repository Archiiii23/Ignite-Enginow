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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import type { PlatformEvent } from "@/lib/platform-store";

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

  const myEvents = events.filter((e) => e.organizerId === user?.id);
  const myOrg = organizers.find((o) => o.userId === user?.id);

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
    const header = "Name,Email,College,Seat,Status,Registered At\n";
    const rows = regs
      .map(
        (r) =>
          `"${r.userName}","${r.userEmail}","${r.college ?? ""}","${r.seatNumber}","${r.status}","${r.registeredAt}"`
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
          <img
            src={user?.avatar}
            alt={user?.name}
            className="size-16 rounded-2xl object-cover border-2 border-primary/30 shadow-lg"
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
          {myEvents.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Plus className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events yet. Create your first event listing!</p>
            </div>
          )}
          {myEvents.map((ev) => {
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
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          approvalColors[ev.approvalStatus]
                        }`}
                      >
                        {ev.approvalStatus.replace("_", " ")}
                      </span>
                    </div>
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
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm font-semibold">Participant Roster</span>
                      <button
                        onClick={() => exportCSV(ev.id)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs hover:bg-secondary"
                      >
                        <Download className="size-3.5" /> Export CSV
                      </button>
                    </div>
                    {regs.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-4 pb-4">No registrations yet.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {regs.map((reg) => (
                          <div
                            key={reg.id}
                            className="px-4 py-3 flex items-center justify-between text-sm"
                          >
                            <div>
                              <div className="font-medium">{reg.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {reg.userEmail} · {reg.college ?? "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">
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
        <div className="max-w-2xl">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className={`size-8 ${vc.cls}`} />
              <div>
                <h2 className="text-lg font-semibold">Organizer Verification</h2>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className={`font-semibold ${vc.cls}`}>{vc.label}</span>
                </p>
              </div>
            </div>

            {verificationStatus === "verified" && (
              <div className="text-center py-8">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Your organization is fully verified!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You can create and publish events without admin approval.
                </p>
                {myOrg?.documentsSubmitted && (
                  <div className="mt-4 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                    Documents on file: {myOrg.documentsSubmitted}
                  </div>
                )}
              </div>
            )}

            {verificationStatus === "pending" && (
              <div className="text-center py-8">
                <Clock className="size-12 text-amber-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Verification Under Review</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our team is reviewing your submitted documents. You'll be notified once verified.
                </p>
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
      {tab === "analytics" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: myEvents.length },
            {
              label: "Published",
              value: myEvents.filter((e) => e.approvalStatus === "published").length,
            },
            {
              label: "Total Registrations",
              value: myEvents.reduce(
                (sum, ev) => sum + getEventRegistrations(ev.id).length,
                0
              ),
            },
            {
              label: "Avg. Fill Rate",
              value:
                myEvents.length > 0
                  ? `${Math.round(
                      myEvents.reduce(
                        (sum, ev) => sum + (ev.registered / ev.seats) * 100,
                        0
                      ) / myEvents.length
                    )}%`
                  : "—",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold font-display text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-2 font-medium">{stat.label}</div>
            </div>
          ))}

          {/* Per-event analytics */}
          <div className="col-span-full mt-4 space-y-3">
            {myEvents.map((ev) => {
              const fillPct = Math.round((ev.registered / ev.seats) * 100);
              return (
                <div key={ev.id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{ev.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {ev.registered}/{ev.seats} ({fillPct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
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
                className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_-4px_var(--primary-glow)]"
              >
                <Save className="size-4 inline-block mr-2" />
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
