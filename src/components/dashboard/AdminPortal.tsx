import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Megaphone,
  Star,
  StarOff,
  Trash2,
  Tag,
  Plus,
  BarChart2,
  Globe,
  Eye,
  Ban,
  MessageSquare,
  X,
  Search,
  TrendingUp,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { usePlatformStore } from "@/lib/platform-store";
import type { PlatformEvent } from "@/lib/platform-store";
import { toast } from "sonner";

type Tab = "organizers" | "events" | "role-requests" | "users" | "categories" | "announcements" | "analytics";

export function AdminPortal() {
  const {
    events,
    organizers,
    registrations,
    categories,
    announcements,
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
  } = usePlatformStore();

  const [tab, setTab] = useState<Tab>("organizers");
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingOrgId, setRejectingOrgId] = useState<string | null>(null);
  const [orgRejectReason, setOrgRejectReason] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnMsg, setNewAnnMsg] = useState("");
  const [newAnnType, setNewAnnType] = useState<"info" | "success" | "warning">("info");
  const [searchUser, setSearchUser] = useState("");
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [loadingRoleRequests, setLoadingRoleRequests] = useState(false);
  const [rejectingRoleUserId, setRejectingRoleUserId] = useState<string | null>(null);
  const [roleRejectReason, setRoleRejectReason] = useState("");

  const fetchRoleRequests = async () => {
    setLoadingRoleRequests(true);
    try {
      const res = await fetch("/api/admin/role-requests", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setRoleRequests(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRoleRequests(false);
    }
  };

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const handleApproveRole = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/role-requests/${userId}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Approval failed");
      toast.success("Role change approved!");
      fetchRoleRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve role request");
    }
  };

  const handleRejectRole = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/role-requests/${userId}/reject`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: roleRejectReason || "Denied by administrator" }),
      });
      if (!res.ok) throw new Error("Rejection failed");
      toast.info("Role change request rejected.");
      setRejectingRoleUserId(null);
      setRoleRejectReason("");
      fetchRoleRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject role request");
    }
  };

  const pendingOrgs = organizers.filter((o) => o.verificationStatus === "pending");
  const pendingEvents = events.filter((e) => e.approvalStatus === "pending_approval");
  const publishedEvents = events.filter((e) => e.approvalStatus === "published");

  const orgStatusConfig = {
    not_submitted: { label: "Not Submitted", cls: "text-muted-foreground", icon: AlertCircle },
    pending: { label: "Pending", cls: "text-amber-500", icon: Clock },
    verified: { label: "Verified", cls: "text-emerald-500", icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "text-red-500", icon: XCircle },
    suspended: { label: "Suspended", cls: "text-orange-500", icon: Ban },
  };

  const handleRejectEvent = (eventId: string) => {
    if (!rejectReason.trim()) return;
    rejectEvent(eventId, rejectReason);
    setRejectingEventId(null);
    setRejectReason("");
    toast.info("Event has been rejected with feedback sent to organizer.");
  };

  const handleRejectOrg = (orgId: string) => {
    if (!orgRejectReason.trim()) return;
    rejectOrganizer(orgId, orgRejectReason);
    setRejectingOrgId(null);
    setOrgRejectReason("");
    toast.info("Organizer verification has been rejected with feedback.");
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName, newCatDesc);
    setNewCatName("");
    setNewCatDesc("");
  };

  const handleAddAnnouncement = () => {
    if (!newAnnTitle.trim() || !newAnnMsg.trim()) return;
    createAnnouncement(newAnnTitle, newAnnMsg, newAnnType);
    setNewAnnTitle("");
    setNewAnnMsg("");
  };

  // Aggregate students from registration data
  const allUsers = Array.from(
    new Map(
      registrations.map((r) => [
        r.userId,
        { id: r.userId, name: r.userName, email: r.userEmail, college: r.college },
      ])
    ).values()
  ).filter(
    (u) =>
      searchUser === "" ||
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const totalRegistrations = registrations.filter((r) => r.status !== "cancelled").length;
  const avgFillRate =
    publishedEvents.length > 0
      ? Math.round(
          publishedEvents.reduce((s, e) => s + (e.registered / e.seats) * 100, 0) /
            publishedEvents.length
        )
      : 0;

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center shadow-lg">
          <ShieldCheck className="size-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform governance, approvals, and management
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Events", value: events.length, icon: BarChart2 },
          { label: "Total Registrations", value: totalRegistrations, icon: Users },
          { label: "Organizers", value: organizers.length, icon: Globe },
          { label: "Avg. Fill Rate", value: `${avgFillRate}%`, icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <stat.icon className="size-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-display text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pending badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roleRequests.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <RefreshCw className="size-3" /> {roleRequests.length} role change request{roleRequests.length !== 1 ? "s" : ""} pending
          </span>
        )}
        {pendingOrgs.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" /> {pendingOrgs.length} organizer verification{pendingOrgs.length !== 1 ? "s" : ""} pending
          </span>
        )}
        {pendingEvents.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Eye className="size-3" /> {pendingEvents.length} event{pendingEvents.length !== 1 ? "s" : ""} awaiting review
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-secondary rounded-xl mb-8">
        {([
          ["organizers", "Organizers", ShieldCheck],
          ["events", "Events Queue", Eye],
          ["role-requests", `Role Requests${roleRequests.length > 0 ? ` (${roleRequests.length})` : ""}`, UserCheck],
          ["users", "Users", Users],
          ["categories", "Categories", Tag],
          ["announcements", "Announcements", Megaphone],
          ["analytics", "Analytics", BarChart2],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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

      {/* Organizers Tab */}
      {tab === "organizers" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>
              <strong>Organizer Approval Flow (Step 5 & 6):</strong> Review applicant credentials. Approving grants verified organizer status and allows them to create and manage listings.
            </span>
            <span className="font-semibold text-foreground shrink-0 ml-3">
              {pendingOrgs.length} pending
            </span>
          </div>

          {organizers.map((org) => {
            const s = orgStatusConfig[org.verificationStatus as keyof typeof orgStatusConfig];
            const isRejecting = rejectingOrgId === org.id;
            return (
              <div key={org.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{org.name}</span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${s.cls}`}>
                        <s.icon className="size-3" /> {s.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{org.email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {org.website} · {org.eventsCount} events · Joined {org.joinedAt}
                    </div>
                    {org.documentsSubmitted && (
                      <div className="mt-2 text-xs bg-secondary border border-border rounded-lg px-3 py-2">
                        📄 {org.documentsSubmitted}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-start gap-2 shrink-0">
                    {org.verificationStatus === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            approveOrganizer(org.id);
                            toast.success(`Organizer "${org.name}" approved! Listing privileges granted.`);
                          }}
                          className="h-9 px-4 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/25 flex items-center gap-1"
                        >
                          <CheckCircle2 className="size-3.5" /> Approve Organizer
                        </button>
                        <button
                          onClick={() => setRejectingOrgId(org.id)}
                          className="h-9 px-4 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/25 flex items-center gap-1"
                        >
                          <XCircle className="size-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {org.verificationStatus === "verified" && (
                      <button
                        onClick={() => suspendOrganizer(org.id)}
                        className="h-9 px-4 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-semibold hover:bg-orange-500/25 flex items-center gap-1"
                      >
                        <Ban className="size-3.5" /> Suspend
                      </button>
                    )}
                    {org.verificationStatus === "suspended" && (
                      <button
                        onClick={() => approveOrganizer(org.id)}
                        className="h-9 px-4 rounded-xl border border-border text-xs hover:bg-secondary flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3.5" /> Re-activate
                      </button>
                    )}
                  </div>
                </div>

                {isRejecting && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={orgRejectReason}
                      onChange={(e) => setOrgRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectOrg(org.id)}
                        disabled={!orgRejectReason.trim()}
                        className="h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setRejectingOrgId(null)}
                        className="h-9 px-3 rounded-lg border border-border text-xs hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Events Approval Queue Tab */}
      {tab === "events" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>
              <strong>Event Approval Workflow:</strong> Review organizer-submitted events in <strong>Pending Review</strong>. Approving an event transitions it to <strong>Public</strong>, enabling student discovery and registrations.
            </span>
            <span className="font-semibold text-foreground shrink-0 ml-3">
              {pendingEvents.length} pending review
            </span>
          </div>

          {pendingEvents.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No pending events for review.</p>
            </div>
          )}
          {pendingEvents.map((ev) => {
            const isRejecting = rejectingEventId === ev.id;
            return (
              <div key={ev.id} className="bg-card border border-amber-500/20 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {ev.cover && (
                    <img src={ev.cover} alt="" className="size-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ev.tagline}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      By {ev.organizerName} · {ev.mode} · {ev.dateLabel} · {ev.seats} seats · {ev.price}
                    </div>
                    {ev.about && (
                      <div className="mt-2 text-xs text-muted-foreground bg-secondary rounded-lg p-2.5 line-clamp-2">
                        {ev.about}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-start gap-2 shrink-0">
                    <button
                      onClick={() => {
                        approveEvent(ev.id);
                        toast.success(`Event "${ev.title}" approved! It is now Public for student registration.`);
                      }}
                      className="h-9 px-4 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/25 flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-3.5" /> Approve & Publish
                    </button>
                    <button
                      onClick={() => setRejectingEventId(ev.id)}
                      className="h-9 px-4 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/25 flex items-center gap-1"
                    >
                      <XCircle className="size-3.5" /> Reject
                    </button>
                  </div>
                </div>

                {isRejecting && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection (shown to organizer)..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectEvent(ev.id)}
                        disabled={!rejectReason.trim()}
                        className="h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setRejectingEventId(null)}
                        className="h-9 px-3 rounded-lg border border-border text-xs hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* All published events — feature toggle */}
          {publishedEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 mt-6">
                Published Events — Feature Control
              </h3>
              <div className="space-y-3">
                {publishedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-2xl px-5 py-3 flex items-center gap-4"
                  >
                    {ev.cover && (
                      <img src={ev.cover} alt="" className="size-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{ev.title}</div>
                      <div className="text-xs text-muted-foreground">{ev.organizerName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFeatureEvent(ev.id)}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                          ev.isFeatured
                            ? "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25"
                            : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                        }`}
                      >
                        {ev.isFeatured ? (
                          <Star className="size-3.5 fill-current" />
                        ) : (
                          <StarOff className="size-3.5" />
                        )}
                        {ev.isFeatured ? "Featured" : "Feature"}
                      </button>
                      <button
                        onClick={() => removeInappropriateEvent(ev.id)}
                        className="h-8 px-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                        title="Remove event"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Requests Tab */}
      {tab === "role-requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Pending Role Change Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review and approve user requests to switch roles between Participant and Organizer.
              </p>
            </div>
            <button
              onClick={fetchRoleRequests}
              className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`size-3.5 ${loadingRoleRequests ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingRoleRequests && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading role requests...
            </div>
          )}

          {!loadingRoleRequests && roleRequests.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">No Pending Role Requests</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                All participant and organizer role change requests have been processed.
              </p>
            </div>
          )}

          {!loadingRoleRequests && roleRequests.length > 0 && (
            <div className="space-y-3">
              {roleRequests.map((reqUser: any) => {
                const currentRoleLabel = reqUser.role === "student" ? "Participant" : reqUser.role;
                const requestedRoleLabel =
                  reqUser.roleChangeRequest?.requestedRole === "student"
                    ? "Participant"
                    : reqUser.roleChangeRequest?.requestedRole || "Organizer";

                const isRejecting = rejectingRoleUserId === (reqUser.id || reqUser._id);

                return (
                  <div
                    key={reqUser.id || reqUser._id}
                    className="bg-card border border-border rounded-2xl p-5 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-sm text-foreground">{reqUser.name}</h4>
                          <span className="text-xs text-muted-foreground">{reqUser.email}</span>
                        </div>

                        {/* Role transition badge */}
                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                            {currentRoleLabel}
                          </span>
                          <span className="text-muted-foreground font-bold">→</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                            {requestedRoleLabel}
                          </span>
                        </div>

                        {reqUser.roleChangeRequest?.reason && (
                          <div className="text-xs text-muted-foreground mt-2 italic bg-secondary/50 p-2.5 rounded-xl border border-border">
                            "{reqUser.roleChangeRequest.reason}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isRejecting ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveRole(reqUser.id || reqUser._id)}
                            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="size-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingRoleUserId(reqUser.id || reqUser._id)}
                            className="h-9 px-3 rounded-xl border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-xs font-semibold text-muted-foreground transition-colors"
                          >
                            <XCircle className="size-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full sm:w-80 space-y-2 pt-2 sm:pt-0">
                          <input
                            type="text"
                            placeholder="Reason for rejection..."
                            value={roleRejectReason}
                            onChange={(e) => setRoleRejectReason(e.target.value)}
                            className="w-full h-9 bg-background border border-border rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectRole(reqUser.id || reqUser._id)}
                              className="flex-1 h-8 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                setRejectingRoleUserId(null);
                                setRoleRejectReason("");
                              }}
                              className="px-3 h-8 border border-border text-xs rounded-lg hover:bg-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_auto] p-4 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Name</span>
              <span>Email / College</span>
              <span>Actions</span>
            </div>
            {allUsers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No users found.
              </div>
            )}
            {allUsers.map((u) => {
              const userRegs = registrations.filter(
                (r) => r.userId === u.id && r.status !== "cancelled"
              );
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center p-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  <div className="text-sm font-medium">{u.name}</div>
                  <div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.college ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{userRegs.length} regs</span>
                    <button
                      onClick={() => {
                        userRegs.forEach((r) => cancelRegistrationAdmin(r.id));
                      }}
                      disabled={userRegs.length === 0}
                      className="h-7 px-2.5 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-40"
                      title="Cancel all registrations"
                    >
                      Cancel All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Add New Category</h3>
            <input
              type="text"
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder="Description"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="size-4" /> Add Category
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0"
              >
                <div>
                  <span className={`text-sm font-medium ${!cat.active ? "opacity-40" : ""}`}>
                    {cat.name}
                  </span>
                  <div className="text-xs text-muted-foreground">{cat.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                      cat.active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {cat.active ? "Active" : "Disabled"}
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="h-7 px-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {tab === "announcements" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Create Announcement</h3>
            <input
              type="text"
              placeholder="Title"
              value={newAnnTitle}
              onChange={(e) => setNewAnnTitle(e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder="Message..."
              value={newAnnMsg}
              onChange={(e) => setNewAnnMsg(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3 items-center">
              <select
                value={newAnnType}
                onChange={(e) => setNewAnnType(e.target.value as "info" | "success" | "warning")}
                className="h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
              <button
                onClick={handleAddAnnouncement}
                disabled={!newAnnTitle.trim() || !newAnnMsg.trim()}
                className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Megaphone className="size-4" /> Broadcast
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No active announcements.</p>
            )}
            {announcements.map((ann) => {
              const typeColors = {
                info: "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",
                success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
                warning: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
              };
              return (
                <div
                  key={ann.id}
                  className={`rounded-2xl border p-4 flex gap-3 ${typeColors[ann.type]}`}
                >
                  <MessageSquare className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ann.title}</div>
                    <div className="text-xs mt-0.5 opacity-80">{ann.message}</div>
                    <div className="text-[11px] mt-1 opacity-60">{ann.createdAt}</div>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Events", value: events.length },
              {
                label: "Published Events",
                value: publishedEvents.length,
              },
              {
                label: "Pending Approval",
                value: pendingEvents.length,
              },
              { label: "Verified Organizers", value: organizers.filter((o) => o.verificationStatus === "verified").length },
              { label: "Total Registrations", value: totalRegistrations },
              { label: "Platform Fill Rate", value: `${avgFillRate}%` },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-5 text-center">
                <div className="text-3xl font-bold font-display text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Events by Fill Rate</h3>
          <div className="space-y-3">
            {publishedEvents
              .slice()
              .sort((a, b) => b.registered / b.seats - a.registered / a.seats)
              .map((ev) => {
                const pct = Math.round((ev.registered / ev.seats) * 100);
                return (
                  <div key={ev.id} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium truncate mr-3">{ev.title}</span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {ev.registered}/{ev.seats} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
