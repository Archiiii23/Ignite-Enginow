import { useState, useEffect, useMemo } from "react";
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
  FileSpreadsheet,
  Download,
  UserCog,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  Layers,
  ArrowUpRight,
  Ticket,
  Building2,
  Phone,
  Mail,
  QrCode,
  Award,
  CheckSquare,
  Copy,
  ExternalLink,
} from "lucide-react";
import { usePlatformStore } from "@/lib/platform-store";
import type { PlatformEvent, Registration } from "@/lib/platform-store";
import { toast } from "sonner";

type Tab =
  | "users"
  | "participants"
  | "organizers"
  | "events"
  | "analytics"
  | "reports"
  | "categories"
  | "role-requests"
  | "announcements";

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
    markAttendance,
  } = usePlatformStore();

  const [tab, setTab] = useState<Tab>("users");
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

  // Participant & Attendee State
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantEventFilter, setParticipantEventFilter] = useState("all");
  const [participantStatusFilter, setParticipantStatusFilter] = useState<"all" | "attended" | "confirmed" | "cancelled">("all");
  const [participantTypeFilter, setParticipantTypeFilter] = useState<"all" | "solo" | "team">("all");
  const [inspectingParticipant, setInspectingParticipant] = useState<Registration | null>(null);

  // User Management State
  const [platformUsers, setPlatformUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "student" | "organizer" | "admin" | "suspended">("all");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<"student" | "organizer" | "admin">("student");

  // Filter States
  const [orgFilter, setOrgFilter] = useState<"all" | "pending" | "verified" | "suspended" | "rejected">("pending");
  const [eventFilter, setEventFilter] = useState<"all" | "pending" | "published" | "rejected">("pending");
  const [inspectingEvent, setInspectingEvent] = useState<PlatformEvent | null>(null);

  // Reports & Audit State
  const [reportTableTab, setReportTableTab] = useState<"registrations" | "organizers" | "events" | "audit">("registrations");
  const [reportSearch, setReportSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setPlatformUsers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-log", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.data || []);
      }
    } catch {}
  };

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
    fetchUsers();
    fetchRoleRequests();
    fetchAuditLogs();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: "student" | "organizer" | "admin") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Role update failed");
      toast.success(`User role updated to ${newRole === "student" ? "Participant" : newRole}`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleToggleSuspendUser = async (userId: string, currentSuspended: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isSuspended: !currentSuspended }),
      });
      if (!res.ok) throw new Error("Status update failed");
      toast.info(currentSuspended ? "User account unsuspended" : "User account suspended");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User account deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleApproveRole = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/role-requests/${userId}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Approval failed");
      toast.success("Role change approved!");
      fetchRoleRequests();
      fetchUsers();
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
      fetchUsers();
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

  const exportRegistrationsCsv = () => {
    const headers = ["Ticket Code", "Student Name", "Email", "College", "Event Title", "Date", "Status"];
    const rows = registrations.map((r) => [
      r.ticketCode || "",
      `"${(r.userName || "").replace(/"/g, '""')}"`,
      r.userEmail || "",
      `"${(r.college || "").replace(/"/g, '""')}"`,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      `"${r.eventDate || ""}"`,
      r.status,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-registrations-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Registrations CSV report downloaded!");
  };

  const exportOrganizersCsv = () => {
    const headers = ["Org Name", "Email", "Website", "Status", "Events Count", "Joined Date"];
    const rows = organizers.map((o) => [
      `"${(o.orgName || o.name).replace(/"/g, '""')}"`,
      o.email || "",
      o.website || "",
      o.verificationStatus,
      o.eventsCount || 0,
      o.joinedAt || "",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-organizers-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Organizers audit CSV report downloaded!");
  };

  const exportEventsCsv = () => {
    const headers = ["Title", "Organizer", "Category", "Mode", "Price", "Seats", "Registered", "Status", "Approval"];
    const rows = events.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.organizerName.replace(/"/g, '""')}"`,
      e.category,
      e.mode,
      e.price,
      e.seats,
      e.registered,
      e.status,
      e.approvalStatus,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-events-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Events report CSV downloaded!");
  };

  const exportAuditLogCsv = () => {
    const headers = ["ID", "Action", "Target", "Admin", "Timestamp", "Details"];
    const rows = auditLogs.map((l) => [
      l.id,
      l.action,
      `"${(l.target || "").replace(/"/g, '""')}"`,
      `"${(l.admin || "").replace(/"/g, '""')}"`,
      l.timestamp,
      `"${(l.details || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("System audit log CSV downloaded!");
  };

  // Participant filtering & stats
  const filteredParticipants = useMemo(() => {
    return registrations.filter((r) => {
      if (participantEventFilter !== "all" && r.eventId !== participantEventFilter) {
        return false;
      }
      if (participantStatusFilter !== "all" && r.status !== participantStatusFilter) {
        return false;
      }
      if (participantTypeFilter !== "all") {
        const isTeam = r.participationType === "team" || Boolean(r.teamName);
        if (participantTypeFilter === "team" && !isTeam) return false;
        if (participantTypeFilter === "solo" && isTeam) return false;
      }
      const q = participantSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (r.userName && r.userName.toLowerCase().includes(q)) ||
        (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
        (r.college && r.college.toLowerCase().includes(q)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
        (r.ticketCode && r.ticketCode.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.eventTitle && r.eventTitle.toLowerCase().includes(q)) ||
        (r.teamName && r.teamName.toLowerCase().includes(q))
      );
    });
  }, [registrations, participantEventFilter, participantStatusFilter, participantTypeFilter, participantSearch]);

  const participantAttendedCount = registrations.filter((r) => r.status === "attended").length;
  const participantConfirmedCount = registrations.filter((r) => r.status === "confirmed").length;
  const participantCancelledCount = registrations.filter((r) => r.status === "cancelled").length;
  const participantAttendanceRate =
    registrations.length > 0 ? Math.round((participantAttendedCount / registrations.length) * 100) : 0;

  const exportParticipantsCsv = () => {
    const headers = [
      "Ticket Code",
      "Participant Name",
      "Email",
      "Phone",
      "College / Institution",
      "Roll Number",
      "Degree & Year",
      "Event Title",
      "Event Date",
      "Participation Format",
      "Team Name",
      "Seat Number",
      "Participation Status",
      "Registered At",
    ];
    const rows = filteredParticipants.map((r) => [
      r.ticketCode || "",
      `"${(r.userName || "").replace(/"/g, '""')}"`,
      r.userEmail || "",
      r.phone || "",
      `"${(r.college || "").replace(/"/g, '""')}"`,
      r.rollNumber || "",
      `"${[r.degree, r.yearOfStudy].filter(Boolean).join(" - ").replace(/"/g, '""')}"`,
      `"${(r.eventTitle || "").replace(/"/g, '""')}"`,
      `"${r.eventDate || ""}"`,
      r.participationType || (r.teamName ? "team" : "solo"),
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      r.seatNumber || "",
      r.status,
      r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-participants-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Participants CSV report downloaded!");
  };

  const exportParticipantsExcel = () => {
    const headers = [
      "Ticket Code",
      "Participant Name",
      "Email",
      "Phone",
      "College / Institution",
      "Roll Number",
      "Degree",
      "Year",
      "Event Title",
      "Event Date",
      "Participation Format",
      "Team Name",
      "Seat Number",
      "Participation Status",
      "Registered At",
    ];
    const rows = filteredParticipants.map((r) => [
      r.ticketCode || "",
      r.userName || "",
      r.userEmail || "",
      r.phone || "",
      r.college || "",
      r.rollNumber || "",
      r.degree || "",
      r.yearOfStudy || "",
      r.eventTitle || "",
      r.eventDate || "",
      r.participationType || (r.teamName ? "team" : "solo"),
      r.teamName || "",
      r.seatNumber || "",
      r.status,
      r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "",
    ]);
    const content = headers.join("\t") + "\n" + rows.map((row) => row.join("\t")).join("\n");
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ignite-participants-roster-${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Participants Excel report downloaded!");
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

      {/* Platform Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        {[
          { tabId: "users", label: "👥 Active Users", value: "1,420", sub: "Students & Builders", icon: Users, color: "text-violet-500" },
          { tabId: "organizers", label: "🛡️ Active Organizers", value: organizers.filter((o) => o.verificationStatus === "verified").length, sub: "Verified Partners", icon: Globe, color: "text-emerald-500" },
          { tabId: "events", label: "🚀 Total Events", value: events.length, sub: `${publishedEvents.length} live now`, icon: BarChart2, color: "text-primary" },
          { tabId: "organizers", label: "⏳ Pending Approvals", value: pendingOrgs.length + pendingEvents.length + roleRequests.length, sub: "Requires review", icon: Clock, color: "text-amber-500" },
          { tabId: "participants", label: "🎟️ Registrations", value: totalRegistrations.toLocaleString(), sub: `${participantAttendedCount} attended`, icon: CheckCircle2, color: "text-blue-500" },
          { tabId: "analytics", label: "📈 Monthly Growth", value: "+24.8%", sub: "MoM trajectory", icon: TrendingUp, color: "text-emerald-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={() => setTab(stat.tabId as Tab)}
            className="cursor-pointer bg-card border border-border hover:border-primary/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">{stat.label}</span>
              <stat.icon className={`size-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="text-2xl font-bold font-display text-foreground">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1 truncate">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roleRequests.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-xs">
            <RefreshCw className="size-3" /> 👑 {roleRequests.length} role change request{roleRequests.length !== 1 ? "s" : ""} pending
          </span>
        )}
        {pendingOrgs.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <Clock className="size-3" /> 🛡️ {pendingOrgs.length} organizer verification{pendingOrgs.length !== 1 ? "s" : ""} pending
          </span>
        )}
        {pendingEvents.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
            <Eye className="size-3" /> 🎟️ {pendingEvents.length} event{pendingEvents.length !== 1 ? "s" : ""} awaiting review
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-secondary/80 rounded-2xl mb-8 border border-border backdrop-blur-xs">
        {([
          ["users", "👥 User Accounts", Users],
          ["participants", `👥 Participants (${registrations.length})`, UserCheck],
          ["organizers", `🛡️ Organizer Approval${pendingOrgs.length > 0 ? ` (${pendingOrgs.length})` : ""}`, ShieldCheck],
          ["events", `🎟️ Event Approval${pendingEvents.length > 0 ? ` (${pendingEvents.length})` : ""}`, Eye],
          ["analytics", "📊 Analytics", BarChart2],
          ["reports", "📑 Reports & Audits", FileSpreadsheet],
          ["categories", "🏷️ Category Management", Tag],
          ["role-requests", `👑 Role Requests${roleRequests.length > 0 ? ` (${roleRequests.length})` : ""}`, UserCheck],
          ["announcements", "📢 Announcements", Megaphone],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm border border-border scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Icon className="size-4" />
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

          {/* Organizer Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Organizers", count: organizers.length },
              { id: "pending", label: "Pending Review", count: pendingOrgs.length },
              { id: "verified", label: "Verified Partners", count: organizers.filter((o) => o.verificationStatus === "verified").length },
              { id: "suspended", label: "Suspended", count: organizers.filter((o) => o.verificationStatus === "suspended").length },
              { id: "rejected", label: "Rejected", count: organizers.filter((o) => o.verificationStatus === "rejected").length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOrgFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  orgFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  orgFilter === f.id ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {organizers.filter((o) => orgFilter === "all" || o.verificationStatus === orgFilter).length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-2xl">
              No organizers found in this filter category.
            </div>
          )}

          {organizers.filter((o) => orgFilter === "all" || o.verificationStatus === orgFilter).map((org) => {
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
              <strong>Event Moderation & Publishing Governance:</strong> Review organizer-submitted events. Approving an event transitions it to <strong>Public</strong>, enabling student discovery and registrations.
            </span>
            <span className="font-semibold text-foreground shrink-0 ml-3">
              {pendingEvents.length} pending review
            </span>
          </div>

          {/* Event Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Listings", count: events.length },
              { id: "pending", label: "Pending Approval", count: pendingEvents.length },
              { id: "published", label: "Published & Live", count: publishedEvents.length },
              { id: "rejected", label: "Rejected", count: events.filter((e) => e.approvalStatus === "rejected").length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  eventFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  eventFilter === f.id ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {(() => {
            const displayEvents = events.filter((e) => {
              if (eventFilter === "all") return true;
              if (eventFilter === "pending") return e.approvalStatus === "pending_approval";
              return e.approvalStatus === eventFilter;
            });

            if (displayEvents.length === 0) {
              return (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No events found in this filter.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {displayEvents.map((ev) => {
                  const isRejecting = rejectingEventId === ev.id;
                  const isPending = ev.approvalStatus === "pending_approval";
                  const isPub = ev.approvalStatus === "published";
                  const isRej = ev.approvalStatus === "rejected";

                  return (
                    <div
                      key={ev.id}
                      className={`bg-card border rounded-2xl p-5 transition-all ${
                        isPending
                          ? "border-amber-500/30 bg-amber-500/[0.02]"
                          : isRej
                          ? "border-red-500/20 opacity-80"
                          : "border-border"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {ev.cover && (
                          <img
                            src={ev.cover}
                            alt=""
                            className="size-20 rounded-xl object-cover shrink-0 border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-foreground text-base">{ev.title}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isPending
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : isPub
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              }`}
                            >
                              {isPending ? "Pending Review" : isPub ? "Published" : "Rejected"}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {ev.category}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ev.tagline}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>By <strong className="text-foreground">{ev.organizerName}</strong></span>
                            <span>·</span>
                            <span>{ev.mode}</span>
                            <span>·</span>
                            <span>{ev.dateLabel}</span>
                            <span>·</span>
                            <span>{ev.seats} seats ({ev.registered} registered)</span>
                            <span>·</span>
                            <span className="font-semibold text-primary">{ev.price}</span>
                          </div>

                          {ev.rejectionReason && (
                            <div className="mt-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                              Rejection feedback: "{ev.rejectionReason}"
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-start gap-2 shrink-0">
                          <button
                            onClick={() => setInspectingEvent(ev)}
                            className="h-9 px-3 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>Inspect</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  approveEvent(ev.id);
                                  toast.success(`Event "${ev.title}" approved! It is now live.`);
                                }}
                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="size-3.5" />
                                <span>Approve & Publish</span>
                              </button>
                              <button
                                onClick={() => setRejectingEventId(ev.id)}
                                className="h-9 px-3 rounded-xl border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-xs font-semibold text-muted-foreground transition-colors"
                              >
                                <XCircle className="size-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isPub && (
                            <>
                              <button
                                onClick={() => toggleFeatureEvent(ev.id)}
                                className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${
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
                                className="h-9 px-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                                title="Takedown / Remove"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rejection input */}
                      {isRejecting && (
                        <div className="mt-4 pt-3 border-t border-border/80 space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={2}
                            placeholder="State reason for rejection (shown to organizer for revisions)..."
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectEvent(ev.id)}
                              disabled={!rejectReason.trim()}
                              className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              onClick={() => {
                                setRejectingEventId(null);
                                setRejectReason("");
                              }}
                              className="h-8 px-3 rounded-lg border border-border text-xs hover:bg-secondary transition-colors"
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
            );
          })()}

          {/* Event Inspection Modal */}
          {inspectingEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div
                className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {inspectingEvent.category} · {inspectingEvent.mode}
                    </span>
                    <h2 className="text-xl font-bold font-display mt-0.5">{inspectingEvent.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Organized by <strong className="text-foreground">{inspectingEvent.organizerName}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectingEvent(null)}
                    className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {inspectingEvent.cover && (
                  <img
                    src={inspectingEvent.cover}
                    alt=""
                    className="w-full h-48 rounded-2xl object-cover border border-border"
                  />
                )}

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Schedule</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">{inspectingEvent.dateLabel}</div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Seats & Regs</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">
                      {inspectingEvent.registered} / {inspectingEvent.seats}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Ticket Fee</div>
                    <div className="text-xs font-bold text-primary mt-0.5">{inspectingEvent.price}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Overview</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {inspectingEvent.about || inspectingEvent.tagline}
                  </p>
                </div>

                {inspectingEvent.tags && inspectingEvent.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectingEvent.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-foreground font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => setInspectingEvent(null)}
                    className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary"
                  >
                    Close Preview
                  </button>
                  {inspectingEvent.approvalStatus === "pending_approval" && (
                    <button
                      onClick={() => {
                        approveEvent(inspectingEvent.id);
                        setInspectingEvent(null);
                        toast.success(`Event "${inspectingEvent.title}" approved!`);
                      }}
                      className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Approve & Publish Now</span>
                    </button>
                  )}
                </div>
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
        <div className="space-y-4">
          {/* Header Controls: Search & Filter Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, email, college, or org..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full h-11 bg-card border border-border rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="h-11 px-4 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <RefreshCw className={`size-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
              <span>Refresh Users</span>
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Users", count: platformUsers.length },
              { id: "student", label: "Participants", count: platformUsers.filter((u) => u.role === "student").length },
              { id: "organizer", label: "Organizers", count: platformUsers.filter((u) => u.role === "organizer").length },
              { id: "admin", label: "Admins", count: platformUsers.filter((u) => u.role === "admin").length },
              { id: "suspended", label: "Suspended", count: platformUsers.filter((u) => u.isSuspended).length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setUserRoleFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  userRoleFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  userRoleFilter === f.id ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Role Change Requests Alert Banner */}
          {roleRequests.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {roleRequests.length} User Role Change Request{roleRequests.length !== 1 ? "s" : ""} Pending Review
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Participants waiting for approval to become verified event organizers.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTab("role-requests")}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shrink-0"
              >
                Review Requests
              </button>
            </div>
          )}

          {/* Users Table / Grid */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] p-4 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30">
              <span>User</span>
              <span>Email / Affiliation</span>
              <span>Role</span>
              <span>Platform Activity</span>
              <span className="text-right">Governance Actions</span>
            </div>

            {loadingUsers && (
              <div className="py-16 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                <span>Loading users from database...</span>
              </div>
            )}

            {!loadingUsers && (() => {
              const filtered = platformUsers.filter((u) => {
                const matchesSearch =
                  searchUser === "" ||
                  u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                  (u.college && u.college.toLowerCase().includes(searchUser.toLowerCase())) ||
                  (u.orgName && u.orgName.toLowerCase().includes(searchUser.toLowerCase()));

                if (!matchesSearch) return false;
                if (userRoleFilter === "all") return true;
                if (userRoleFilter === "suspended") return !!u.isSuspended;
                return u.role === userRoleFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    No users matching criteria.
                  </div>
                );
              }

              return filtered.map((u) => {
                const isStudent = u.role === "student";
                const isOrg = u.role === "organizer";
                const isAdmin = u.role === "admin";
                const isSuspended = !!u.isSuspended;

                return (
                  <div
                    key={u.id}
                    className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] items-center p-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors ${
                      isSuspended ? "bg-red-500/[0.03]" : ""
                    }`}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="relative shrink-0">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                          }
                          alt=""
                          className="size-9 rounded-full object-cover border border-border"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${
                            isSuspended ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSuspended && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-1 rounded">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Joined {u.joinedAt || "Aug 2026"}</div>
                      </div>
                    </div>

                    {/* Email / College */}
                    <div className="min-w-0 pr-2">
                      <div className="text-xs text-foreground truncate">{u.email}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {u.orgName ? `Org: ${u.orgName}` : u.college ? u.college : "Independent Member"}
                      </div>
                    </div>

                    {/* Role badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isAdmin
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : isOrg
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-violet-500/10 text-violet-500 border-violet-500/20"
                        }`}
                      >
                        {isAdmin && <ShieldCheck className="size-3" />}
                        {isOrg && <Globe className="size-3" />}
                        {isStudent && <Users className="size-3" />}
                        <span>{isAdmin ? "Admin" : isOrg ? "Organizer" : "Participant"}</span>
                      </span>
                    </div>

                    {/* Activity stats */}
                    <div className="text-xs space-y-0.5">
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">{u.registrationsCount || 0}</strong> registered passes
                      </div>
                      {isOrg && (
                        <div className="text-muted-foreground">
                          <strong className="text-foreground">{u.eventsCount || 0}</strong> events hosted
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setSelectedNewRole(u.role);
                        }}
                        className="h-8 px-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary flex items-center gap-1 transition-colors"
                        title="Change role"
                      >
                        <UserCog className="size-3.5 text-muted-foreground" />
                        <span>Role</span>
                      </button>

                      <button
                        onClick={() => handleToggleSuspendUser(u.id, isSuspended)}
                        className={`h-8 px-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                          isSuspended
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                            : "border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/20"
                        }`}
                        title={isSuspended ? "Unsuspend account" : "Suspend account"}
                      >
                        <Ban className="size-3" />
                        <span>{isSuspended ? "Unsuspend" : "Suspend"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="h-8 px-2 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Role Change Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div
                className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCog className="size-5 text-primary" />
                    <h3 className="font-bold text-base">Change User Role</h3>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="p-3 bg-secondary/50 rounded-2xl border border-border text-xs space-y-1">
                  <div className="font-semibold text-foreground text-sm">{editingUser.name}</div>
                  <div className="text-muted-foreground">{editingUser.email}</div>
                  <div className="text-muted-foreground">
                    Current active role: <strong className="capitalize">{editingUser.role}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Select New Assigned Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: "student", label: "Participant", icon: Users, color: "text-violet-500" },
                      { role: "organizer", label: "Organizer", icon: Globe, color: "text-amber-500" },
                      { role: "admin", label: "Admin", icon: ShieldCheck, color: "text-rose-500" },
                    ].map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedNewRole(r.role as any)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                          selectedNewRole === r.role
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <r.icon className={`size-4 ${r.color}`} />
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 h-10 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateRole(editingUser.id, selectedNewRole)}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Save Role Change
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participants Tab */}
      {tab === "participants" && (
        <div className="space-y-6">
          {/* Header Banner & Exports */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <Users className="size-3.5" /> Central Participant & Attendee Roster
              </div>
              <h2 className="text-xl font-bold font-display text-foreground">Who Has Participated</h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Real-time governance of student registrations, attendance check-ins, ticket validation, and team participation records across all events.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportParticipantsCsv}
                className="h-10 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="size-3.5 text-primary" /> Export CSV
              </button>
              <button
                onClick={exportParticipantsExcel}
                className="h-10 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="size-3.5 text-emerald-500" /> Export Excel (.xls)
              </button>
            </div>
          </div>

          {/* Participant Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
                <Users className="size-4 text-primary" />
              </div>
              <div className="text-2xl font-bold font-display text-foreground">{registrations.length}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">All event registrations</p>
            </div>

            <div className="bg-card border border-emerald-500/25 bg-emerald-500/[0.02] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider">Participated / Attended</span>
                <CheckCircle2 className="size-4" />
              </div>
              <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">{participantAttendedCount}</div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                {participantAttendanceRate}% attendance completion rate
              </p>
            </div>

            <div className="bg-card border border-blue-500/25 bg-blue-500/[0.02] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider">Confirmed (Upcoming)</span>
                <Ticket className="size-4" />
              </div>
              <div className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">{participantConfirmedCount}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting event check-in</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider">Cancelled</span>
                <XCircle className="size-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold font-display text-muted-foreground">{participantCancelledCount}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cancelled or revoked passes</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3 bg-card border border-border rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search participants by name, email, college, roll number, ticket code, team..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-xl pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={participantEventFilter}
                  onChange={(e) => setParticipantEventFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-primary max-w-[220px] truncate"
                >
                  <option value="all">All Events ({registrations.length})</option>
                  {events.map((ev) => {
                    const count = registrations.filter((r) => r.eventId === ev.id).length;
                    return (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({count})
                      </option>
                    );
                  })}
                </select>

                <select
                  value={participantTypeFilter}
                  onChange={(e) => setParticipantTypeFilter(e.target.value as any)}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-primary"
                >
                  <option value="all">All Participation Types</option>
                  <option value="solo">Solo Entries</option>
                  <option value="team">Team Entries</option>
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
              {[
                { id: "all", label: "All Records", count: registrations.length },
                { id: "attended", label: "✅ Participated / Attended", count: participantAttendedCount, color: "text-emerald-600 dark:text-emerald-400" },
                { id: "confirmed", label: "🎫 Confirmed Passes", count: participantConfirmedCount, color: "text-blue-600 dark:text-blue-400" },
                { id: "cancelled", label: "❌ Cancelled", count: participantCancelledCount, color: "text-muted-foreground" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setParticipantStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    participantStatusFilter === f.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      participantStatusFilter === f.id
                        ? "bg-white/20 text-white"
                        : "bg-background/80 text-muted-foreground font-mono"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Verified Participant Directory</h3>
                <p className="text-[11px] text-muted-foreground">
                  Showing {filteredParticipants.length} attendee record{filteredParticipants.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Live Check-in Rate:{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {participantAttendanceRate}%
                </span>
              </div>
            </div>

            {filteredParticipants.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Users className="size-10 mx-auto mb-2 opacity-30" />
                <div className="text-sm font-semibold text-foreground">No participant records found</div>
                <div className="text-xs mt-1">Try clearing search filters or selecting another event.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20 text-muted-foreground uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Participant Details</th>
                      <th className="py-3 px-4">Institution & Credentials</th>
                      <th className="py-3 px-4">Event & Schedule</th>
                      <th className="py-3 px-4">Ticket & Seat</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Participation Status</th>
                      <th className="py-3 px-4 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredParticipants.map((r) => {
                      const isAttended = r.status === "attended";
                      const isCancelled = r.status === "cancelled";
                      const isTeam = r.participationType === "team" || Boolean(r.teamName);

                      return (
                        <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                          {/* Participant Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-primary font-bold grid place-items-center shrink-0">
                                {r.userName ? r.userName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                  <span>{r.userName}</span>
                                  {isAttended && (
                                    <span title="Verified Attended" className="inline-flex">
                                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted-foreground font-mono text-[11px] truncate">{r.userEmail}</div>
                                {r.phone && (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Phone className="size-3" /> {r.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Academic Affiliation */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-foreground">
                              {r.college || "Independent Participant"}
                            </div>
                            {(r.degree || r.yearOfStudy) && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {[r.degree, r.yearOfStudy].filter(Boolean).join(" · ")}
                              </div>
                            )}
                            {r.rollNumber && (
                              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                ID: {r.rollNumber}
                              </div>
                            )}
                          </td>

                          {/* Event & Schedule */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="font-semibold text-foreground truncate" title={r.eventTitle}>
                              {r.eventTitle}
                            </div>
                            {r.eventDate && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">{r.eventDate}</div>
                            )}
                            {r.eventLocation && (
                              <div className="text-[10px] text-muted-foreground/80 truncate">{r.eventLocation}</div>
                            )}
                          </td>

                          {/* Ticket & Seat */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                {r.ticketCode || "IGN-TKT"}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(r.ticketCode || r.id);
                                  toast.success("Ticket code copied!");
                                }}
                                className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                                title="Copy Ticket Code"
                              >
                                <Copy className="size-3" />
                              </button>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">
                              Seat: <span className="font-bold text-foreground">{r.seatNumber || "General"}</span>
                            </div>
                          </td>

                          {/* Format (Solo / Team) */}
                          <td className="py-3.5 px-4">
                            {isTeam ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                👥 {r.teamName || "Team"}
                                {r.teamRole && <span className="opacity-75">({r.teamRole})</span>}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                                👤 Solo
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isAttended ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 className="size-3" /> Attended / Participated
                              </span>
                            ) : isCancelled ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                                <XCircle className="size-3" /> Cancelled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                                <Clock className="size-3" /> Confirmed Pass
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Attendance */}
                              {!isCancelled && (
                                <button
                                  onClick={() => {
                                    markAttendance(r.id, !isAttended);
                                    toast.info(
                                      isAttended
                                        ? `Reset attendance for ${r.userName}`
                                        : `Verified & marked ${r.userName} as Attended!`
                                    );
                                  }}
                                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                    isAttended
                                      ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                      : "bg-primary text-primary-foreground border-transparent hover:opacity-90 shadow-xs"
                                  }`}
                                  title={isAttended ? "Click to reset check-in" : "Mark as checked-in participant"}
                                >
                                  {isAttended ? "Checked In ✓" : "Check In"}
                                </button>
                              )}

                              {/* Inspect Pass */}
                              <button
                                onClick={() => setInspectingParticipant(r)}
                                className="size-8 rounded-lg bg-secondary hover:bg-secondary/80 border border-border grid place-items-center text-foreground transition-colors"
                                title="Inspect Participant Pass"
                              >
                                <Eye className="size-3.5" />
                              </button>

                              {/* Cancel Pass (Admin governance) */}
                              {!isCancelled && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Cancel participant registration for ${r.userName}?`)) {
                                      cancelRegistrationAdmin(r.id);
                                      toast.success(`Registration cancelled for ${r.userName}`);
                                    }
                                  }}
                                  className="size-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 grid place-items-center transition-colors"
                                  title="Revoke / Cancel Registration"
                                >
                                  <Ban className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Participant Inspector Modal */}
          {inspectingParticipant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div
                className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="size-5 text-primary" />
                    <div>
                      <h3 className="font-bold text-base text-foreground">Participant Pass Dossier</h3>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {inspectingParticipant.ticketCode || "IGN-TKT-PASS"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingParticipant(null)}
                    className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Status Hero Card */}
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-lg grid place-items-center">
                        {inspectingParticipant.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground flex items-center gap-2">
                          <span>{inspectingParticipant.userName}</span>
                          {inspectingParticipant.status === "attended" && (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {inspectingParticipant.userEmail}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        inspectingParticipant.status === "attended"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                          : inspectingParticipant.status === "cancelled"
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25"
                      }`}
                    >
                      {inspectingParticipant.status === "attended"
                        ? "✓ Participated / Attended"
                        : inspectingParticipant.status === "cancelled"
                        ? "Cancelled"
                        : "Confirmed Pass"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span className="font-semibold text-foreground">{inspectingParticipant.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">College ID: </span>
                      <span className="font-semibold text-foreground font-mono">{inspectingParticipant.rollNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Event & Registration Data */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Registered Event</div>
                    <div className="font-bold text-sm text-foreground">{inspectingParticipant.eventTitle}</div>
                    {inspectingParticipant.eventDate && (
                      <div className="text-muted-foreground">{inspectingParticipant.eventDate}</div>
                    )}
                    {inspectingParticipant.eventLocation && (
                      <div className="text-muted-foreground">{inspectingParticipant.eventLocation}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-background border border-border">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Seat Number</div>
                      <div className="font-mono font-bold text-sm text-foreground mt-0.5">{inspectingParticipant.seatNumber || "General"}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Format</div>
                      <div className="font-bold text-sm text-foreground mt-0.5">
                        {inspectingParticipant.participationType === "team" || inspectingParticipant.teamName
                          ? `Team (${inspectingParticipant.teamName || "Squad"})`
                          : "Solo Entry"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Academic Institution</div>
                    <div className="font-medium text-foreground">{inspectingParticipant.college || "Independent"}</div>
                    {(inspectingParticipant.degree || inspectingParticipant.yearOfStudy) && (
                      <div className="text-muted-foreground">
                        {[inspectingParticipant.degree, inspectingParticipant.yearOfStudy].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>

                  {/* QR / Barcode Visualizer */}
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex flex-col items-center justify-center text-center">
                    <div className="size-20 rounded-xl bg-white p-1.5 shadow-sm grid place-items-center mb-2">
                      <QrCode className="size-16 text-black" />
                    </div>
                    <div className="font-mono font-bold text-xs tracking-wider text-foreground">
                      {inspectingParticipant.ticketCode || "IGN-PASS"}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Scan at venue check-in terminal or verify via ticket code
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      const newStatus = inspectingParticipant.status !== "attended";
                      markAttendance(inspectingParticipant.id, newStatus);
                      setInspectingParticipant({
                        ...inspectingParticipant,
                        status: newStatus ? "attended" : "confirmed",
                      });
                      toast.success(
                        newStatus
                          ? `Marked ${inspectingParticipant.userName} as Attended!`
                          : `Reset attendance for ${inspectingParticipant.userName}`
                      );
                    }}
                    className={`flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      inspectingParticipant.status === "attended"
                        ? "border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    {inspectingParticipant.status === "attended" ? "Checked In ✓ (Click to Reset)" : "Verify & Mark Attended"}
                  </button>
                  <button
                    onClick={() => setInspectingParticipant(null)}
                    className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>
              <strong>Category & Taxonomy Governance:</strong> Manage technical event tracks. Events are filtered and indexed by these categories across the discovery catalog.
            </span>
            <span className="font-semibold text-foreground shrink-0 ml-3">
              {categories.length} categories active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Category Card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 h-fit">
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-primary" />
                <h3 className="font-bold text-base">Add New Category</h3>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robotics & Hardware"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe technical scope and attendee expectations..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <Plus className="size-4" /> Create Category
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Category Name & Description</span>
                  <span>Status & Actions</span>
                </div>
                <div className="divide-y divide-border">
                  {categories.map((cat) => {
                    const eventCount = events.filter((e) => e.category === cat.name).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${!cat.active ? "opacity-50 line-through" : "text-foreground"}`}>
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {eventCount} event{eventCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {cat.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleCategory(cat.id)}
                            className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                              cat.active
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {cat.active ? "Active" : "Disabled"}
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="h-8 px-2.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>
              <strong>Platform Reports & Compliance Exports:</strong> Generate auditable CSV data ledgers for participant admissions, organizer verifications, and event fill metrics.
            </span>
            <span className="text-foreground font-semibold shrink-0">
              Live Database Active
            </span>
          </div>

          {/* 4 CSV Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Registrations Report Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                  <Users className="size-5" />
                </div>
                <h3 className="font-semibold text-sm">Registrations Ledger</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Roster of {registrations.length} student registrations with ticket codes, colleges, and attendance status.
                </p>
              </div>
              <button
                onClick={exportRegistrationsCsv}
                className="mt-5 w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity shadow-sm"
              >
                <Download className="size-3.5" /> Download CSV
              </button>
            </div>

            {/* Organizers Report Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center mb-3">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-sm">Organizer Audit Ledger</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Directory of {organizers.length} organizer entities, verification credentials, and approval states.
                </p>
              </div>
              <button
                onClick={exportOrganizersCsv}
                className="mt-5 w-full h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/25 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="size-3.5" /> Download CSV
              </button>
            </div>

            {/* Events Performance Report Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-3">
                  <BarChart2 className="size-5" />
                </div>
                <h3 className="font-semibold text-sm">Event Performance</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Metric report of all {events.length} listings, capacity fill rates, pricing tiers, and public visibility states.
                </p>
              </div>
              <button
                onClick={exportEventsCsv}
                className="mt-5 w-full h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/25 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="size-3.5" /> Download CSV
              </button>
            </div>

            {/* System Audit Trail Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="size-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 grid place-items-center mb-3">
                  <Layers className="size-5" />
                </div>
                <h3 className="font-semibold text-sm">System Audit Trail</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Log of {auditLogs.length} administrator actions, role transitions, approvals, and security checks.
                </p>
              </div>
              <button
                onClick={exportAuditLogCsv}
                className="mt-5 w-full h-9 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-xs font-semibold hover:bg-violet-500/25 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="size-3.5" /> Download CSV
              </button>
            </div>
          </div>

          {/* Interactive Live Data Explorer */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-foreground">Interactive Data Explorer</h3>
                <p className="text-xs text-muted-foreground">Inspect live platform records directly on screen</p>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl">
                {[
                  { id: "registrations", label: "Registrations" },
                  { id: "organizers", label: "Organizers" },
                  { id: "events", label: "Events" },
                  { id: "audit", label: "Audit Trail" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setReportTableTab(st.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      reportTableTab === st.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter explorer records..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full h-10 bg-background border border-border rounded-xl pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Tabular View */}
            <div className="border border-border rounded-2xl overflow-x-auto max-h-96">
              {reportTableTab === "registrations" && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">College</th>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {registrations
                      .filter((r) =>
                        reportSearch === "" ||
                        r.userName?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        r.userEmail?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        r.eventTitle?.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-primary">{r.ticketCode || r.id}</td>
                          <td className="p-3 font-medium text-foreground">{r.userName}</td>
                          <td className="p-3 text-muted-foreground">{r.userEmail}</td>
                          <td className="p-3 text-muted-foreground">{r.college || "—"}</td>
                          <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{r.eventTitle}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === "attended"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                                : r.status === "confirmed"
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                                : "bg-secondary text-muted-foreground"
                            }`}>
                              {r.status === "attended" ? "✓ Attended" : r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {reportTableTab === "organizers" && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Representative</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Events Count</th>
                      <th className="p-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {organizers
                      .filter((o) =>
                        reportSearch === "" ||
                        o.orgName?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        o.name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        o.email?.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-bold text-foreground">{o.orgName || o.name}</td>
                          <td className="p-3 text-foreground">{o.name}</td>
                          <td className="p-3 text-muted-foreground">{o.email}</td>
                          <td className="p-3">
                            <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                              {o.verificationStatus}
                            </span>
                          </td>
                          <td className="p-3 text-foreground font-bold">{o.eventsCount}</td>
                          <td className="p-3 text-muted-foreground">{o.joinedAt}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {reportTableTab === "events" && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Organizer</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Seats / Regs</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {events
                      .filter((e) =>
                        reportSearch === "" ||
                        e.title?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        e.organizerName?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        e.category?.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((e) => (
                        <tr key={e.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-bold text-foreground max-w-[200px] truncate">{e.title}</td>
                          <td className="p-3 text-foreground">{e.organizerName}</td>
                          <td className="p-3 text-muted-foreground">{e.category}</td>
                          <td className="p-3 text-muted-foreground font-mono">{e.registered} / {e.seats}</td>
                          <td className="p-3 text-primary font-semibold">{e.price}</td>
                          <td className="p-3">
                            <span className="capitalize font-bold text-xs">
                              {e.approvalStatus === "published" ? "Published" : e.approvalStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {reportTableTab === "audit" && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Admin</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs
                      .filter((l) =>
                        reportSearch === "" ||
                        l.action?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        l.target?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        l.details?.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((l) => (
                        <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3 text-muted-foreground font-mono">{l.timestamp.slice(0, 16).replace("T", " ")}</td>
                          <td className="p-3 font-bold text-primary">{l.action}</td>
                          <td className="p-3 font-medium text-foreground">{l.target}</td>
                          <td className="p-3 text-muted-foreground">{l.admin}</td>
                          <td className="p-3 text-muted-foreground">{l.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
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
      {tab === "analytics" && (() => {
        const verifiedOrgsCount = organizers.filter((o) => o.verificationStatus === "verified").length;
        const totalPendingApprovals = pendingOrgs.length + pendingEvents.length + roleRequests.length;
        const onlineCount = events.filter((e) => e.mode === "Online").length;
        const inPersonCount = events.filter((e) => e.mode === "In-person").length;
        const hybridCount = events.filter((e) => e.mode === "Hybrid").length;
        const freeCount = events.filter((e) => e.price.toLowerCase() === "free").length;
        const paidCount = events.length - freeCount;

        // Group events by category
        const categoryCounts = events.reduce((acc, ev) => {
          acc[ev.category] = (acc[ev.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

        return (
          <div className="space-y-8">
            {/* 1. Core Analytics KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Active Users */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-violet-500/10 text-violet-500 grid place-items-center mx-auto mb-2">
                  <Users className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-foreground">1,420</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Active Users</div>
              </div>

              {/* Active Organizers */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto mb-2">
                  <Globe className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-foreground">{verifiedOrgsCount}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Active Organizers</div>
              </div>

              {/* Total Events */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto mb-2">
                  <BarChart2 className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-foreground">{events.length}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Total Events</div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-card border border-amber-500/20 bg-amber-500/[0.02] rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center mx-auto mb-2">
                  <Clock className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
                  {totalPendingApprovals}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Pending Approvals</div>
              </div>

              {/* Total Registrations */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center mx-auto mb-2">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-foreground">
                  {totalRegistrations.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Total Registrations</div>
              </div>

              {/* Monthly Growth */}
              <div className="bg-card border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 shadow-sm text-center">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto mb-2">
                  <TrendingUp className="size-4" />
                </div>
                <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  +24.8%
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Monthly Growth</div>
              </div>
            </div>

            {/* 2. Platform Statistics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Breakdown */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold font-display text-foreground mb-1">
                  Category Distribution
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Events distribution across the 14 technical categories
                </p>
                <div className="space-y-3">
                  {sortedCategories.slice(0, 6).map(([cat, count]) => {
                    const pct = Math.round((count / events.length) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-foreground">{cat}</span>
                          <span className="text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Formats / Modes */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold font-display text-foreground mb-1">
                  Format & Delivery Mode
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Online vs In-person vs Hybrid event split
                </p>
                <div className="space-y-4">
                  {[
                    { label: "Online Events", count: onlineCount, color: "bg-blue-500" },
                    { label: "In-person (Offline)", count: inPersonCount, color: "bg-emerald-500" },
                    { label: "Hybrid Formats", count: hybridCount, color: "bg-purple-500" },
                  ].map((mode) => {
                    const pct = events.length > 0 ? Math.round((mode.count / events.length) * 100) : 0;
                    return (
                      <div key={mode.label} className="p-3 bg-secondary/40 rounded-xl border border-border">
                        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                          <span className="text-foreground font-semibold">{mode.label}</span>
                          <span className="font-mono">{mode.count} events ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${mode.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Capacity Health */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold font-display text-foreground mb-1">
                  Pricing & Seat Health
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Free vs Paid listings & seat fill benchmarks
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                        {freeCount}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Free Access</div>
                    </div>
                    <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-2xl">
                      <div className="text-2xl font-bold font-display text-primary">{paidCount}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Paid Passes</div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/40 rounded-2xl border border-border">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Overall Platform Fill Rate</span>
                      <span className="font-bold text-foreground font-mono">{avgFillRate}%</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                        style={{ width: `${avgFillRate}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground text-center">
                      Average enrollment ratio across all published listings
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Event Performance Table */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold font-display text-foreground mb-1">
                Events by Attendance Rate
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Detailed fill rate and seats status for all published platform events
              </p>
              <div className="space-y-3">
                {publishedEvents
                  .slice()
                  .sort((a, b) => b.registered / b.seats - a.registered / a.seats)
                  .map((ev) => {
                    const pct = Math.round((ev.registered / ev.seats) * 100);
                    return (
                      <div key={ev.id} className="bg-secondary/30 border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 text-sm">
                          <span className="font-semibold text-foreground truncate mr-3">{ev.title}</span>
                          <span className="text-muted-foreground text-xs shrink-0 font-mono">
                            {ev.registered} / {ev.seats} registered ({pct}%)
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
          </div>
        );
      })()}
    </div>
  );
}
