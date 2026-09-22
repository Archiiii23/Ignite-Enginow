import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, GraduationCap, Briefcase, ShieldCheck, LogOut,
  ChevronDown, LayoutDashboard, Bell, CheckCircle2, Info, AlertTriangle, XCircle,
  Lock, RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "@/lib/router";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useNotifications, type NotificationType } from "@/lib/notifications";
import { RequestRoleChangeModal } from "@/components/auth/RequestRoleChangeModal";
import { UserAvatar } from "@/components/ui/UserAvatar";

const links = [
  { label: "Events", to: "/events" as const },
  { label: "Resources", to: "/resources" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

const roleConfig = {
  student: { label: "Achiever", icon: GraduationCap, cls: "text-violet-500" },
  organizer: { label: "Igniter", icon: Briefcase, cls: "text-amber-500" },
  admin: { label: "Admin", icon: ShieldCheck, cls: "text-rose-500" },
};

const notifIcons: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};
const notifColors: Record<NotificationType, string> = {
  success: "text-emerald-500",
  info: "text-blue-500",
  warning: "text-amber-500",
  error: "text-red-500",
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function FloatingNav({ overDark = false }: { overDark?: boolean }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "registrations" | "approvals" | "reminders">("all");
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = (n: (typeof notifications)[0]) => {
    markAllRead();
    setNotifOpen(false);
    if (n.category === "registration_success" || n.category === "event_reminder" || n.category === "registration_closing") {
      navigate({ to: "/dashboard" });
    } else if (n.category === "approval_status" || n.category === "event_published") {
      navigate({ to: user?.role === "admin" ? "/admin" : "/organizer" });
    } else if (n.category === "event_rejected") {
      navigate({ to: "/organizer" });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const rc = user ? roleConfig[user.role] : null;

  const handleNotifOpen = () => {
    setNotifOpen((v) => {
      if (!v) { setTimeout(() => markAllRead(), 1000); }
      return !v;
    });
    setProfileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl px-1"
    >
      <div
        className={`rounded-2xl border border-foreground/10 px-3 py-2 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
            : "bg-background/50 backdrop-blur-md"
        }`}
      >
        <Link to="/" className="flex items-center gap-2 pl-1">
          <img src={logo} alt="Enginow Ignite" width={28} height={28} className="size-7 drop-shadow-sm" />
          <span className="font-display text-[0.9375rem] font-semibold tracking-[-0.015em]">
            Enginow <span className="text-primary-glow font-bold">Ignite</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/5"
              activeProps={{ className: "text-foreground font-medium bg-foreground/5" }}
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 ml-1"
              activeProps={{ className: "bg-rose-500/20 text-rose-500 font-bold" }}
            >
              <ShieldCheck className="size-3.5" />
              Admin
            </Link>
          )}
          {(user?.role === "organizer" || user?.role === "admin") && (
            <Link
              to="/organizer"
              className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 ml-1"
              activeProps={{ className: "bg-amber-500/20 text-amber-500 font-bold" }}
            >
              <Briefcase className="size-3.5" />
              Organizer
            </Link>
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              {/* Bell */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={handleNotifOpen}
                  className="relative p-2 rounded-xl hover:bg-foreground/5 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-sm font-semibold text-foreground">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification Category Filter Tabs */}
                      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-secondary/30 overflow-x-auto text-[11px] font-medium scrollbar-none">
                        {[
                          ["all", "All"],
                          ["registrations", "Registrations"],
                          ["approvals", "Approvals"],
                          ["reminders", "Reminders"],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setNotifFilter(key as any)}
                            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                              notifFilter === key
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-border">
                        {(() => {
                          const filteredNotifs = notifications.filter((n) => {
                            if (notifFilter === "registrations") return n.category === "registration_success";
                            if (notifFilter === "approvals")
                              return (
                                n.category === "approval_status" ||
                                n.category === "event_published" ||
                                n.category === "event_rejected"
                              );
                            if (notifFilter === "reminders")
                              return (
                                n.category === "registration_closing" ||
                                n.category === "event_reminder"
                              );
                            return true;
                          });

                          if (filteredNotifs.length === 0) {
                            return (
                              <div className="py-10 text-center">
                                <Bell className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-muted-foreground">No notifications in this tab</p>
                              </div>
                            );
                          }

                          const categoryBadgeLabels: Record<string, { label: string; cls: string }> = {
                            registration_success: { label: "Registration", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                            approval_status: { label: "Approval", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                            event_published: { label: "Published", cls: "bg-primary/10 text-primary border-primary/20" },
                            event_rejected: { label: "Rejected", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
                            registration_closing: { label: "Closing Soon", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                            event_reminder: { label: "Reminder", cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
                          };

                          return filteredNotifs.map((n) => {
                            const Icon = notifIcons[n.type];
                            const badge = n.category ? categoryBadgeLabels[n.category] : null;

                            return (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex items-start gap-3 p-3.5 hover:bg-secondary/60 transition-colors cursor-pointer group ${
                                  !n.read ? "bg-primary/5" : ""
                                }`}
                              >
                                <Icon className={`size-4 shrink-0 mt-0.5 ${notifColors[n.type]}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <div className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                                      {n.title}
                                    </div>
                                    {badge && (
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.cls}`}
                                      >
                                        {badge.label}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {n.message}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 font-medium flex items-center justify-between">
                                    <span>{timeAgo(n.createdAt)}</span>
                                    <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                      View details →
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(n.id);
                                  }}
                                  className="shrink-0 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  title="Dismiss"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-xl border border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5 transition-all"
                >
                  <UserAvatar name={user.name} email={user.email} className="size-7 rounded-lg text-xs" />
                  <div className="text-left">
                    <div className="text-xs font-semibold leading-tight max-w-[90px] truncate">{user.name.split(" ")[0]}</div>
                    {rc && (
                      <div className={`text-[10px] font-medium leading-tight flex items-center gap-0.5 ${rc.cls}`}>
                        <rc.icon className="size-2.5" />{rc.label}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <div className="text-sm font-semibold truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="size-4 text-muted-foreground" />Dashboard
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors font-medium border-t border-border/40"
                        >
                          <ShieldCheck className="size-4 text-rose-500" />Admin Control Panel
                        </Link>
                      )}
                      {(user.role === "organizer" || user.role === "admin") && (
                        <Link
                          to="/organizer"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors font-medium border-t border-border/40"
                        >
                          <Briefcase className="size-4 text-amber-500" />Organizer Portal
                        </Link>
                      )}
                      <div className="px-3 py-2.5 border-t border-border/80 bg-secondary/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Role</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <Lock className="size-2.5 text-primary" /> Locked
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-card p-2 rounded-xl border border-border">
                          <div className="flex items-center gap-2">
                            {rc && <rc.icon className={`size-3.5 ${rc.cls}`} />}
                            <span className="text-xs font-semibold capitalize text-foreground">
                              {user.role === "student" ? "Participant" : user.role}
                            </span>
                          </div>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => {
                                setRoleChangeModalOpen(true);
                                setProfileOpen(false);
                              }}
                              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <RefreshCw className="size-3" /> Change
                            </button>
                          )}
                        </div>
                        {user.roleChangeRequest?.status === "PENDING" && (
                          <div className="mt-2 text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg flex items-center gap-1">
                            <span>Change to <strong>{user.roleChangeRequest.requestedRole === "student" ? "Participant" : user.roleChangeRequest.requestedRole}</strong> pending review</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-border">
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <LogOut className="size-4" />Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors">Login</Link>
              <Link
                to="/auth"
                className="text-sm font-medium bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--primary-glow)] px-4 py-2 rounded-lg hover:opacity-95 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="md:hidden flex items-center gap-1.5">
          <ThemeToggle />
          {isAuthenticated && (
            <button onClick={handleNotifOpen} className="relative p-2 rounded-lg hover:bg-foreground/5">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold grid place-items-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-foreground/5 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur-2xl p-3 flex flex-col gap-1 shadow-xl"
        >
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-foreground/5">
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-border my-1" />
          {isAuthenticated && user ? (
            <>
              <div className="px-3 py-2 flex items-center gap-3">
                <UserAvatar name={user.name} email={user.email} className="size-8 rounded-lg text-sm" />
                <div>
                  <div className="text-sm font-semibold">{user.name}</div>
                  {rc && <div className={`text-xs font-medium ${rc.cls}`}>{rc.label}</div>}
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm px-3 py-2 rounded-lg hover:bg-foreground/5 flex items-center gap-2">
                <LayoutDashboard className="size-4 text-muted-foreground" />Dashboard
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setOpen(false)} className="text-sm px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-rose-500" />Admin Control Panel
                </Link>
              )}
              {(user.role === "organizer" || user.role === "admin") && (
                <Link to="/organizer" onClick={() => setOpen(false)} className="text-sm px-3 py-2 rounded-lg hover:bg-amber-500/10 text-amber-500 flex items-center gap-2 font-medium">
                  <Briefcase className="size-4 text-amber-500" />Organizer Portal
                </Link>
              )}
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="text-sm text-left px-3 py-2 rounded-lg hover:bg-foreground/5 text-muted-foreground flex items-center gap-2"
              >
                <LogOut className="size-4" />Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm text-left px-3 py-2 rounded-lg hover:bg-foreground/5">Login</Link>
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-medium bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--primary-glow)] px-3 py-2 rounded-lg text-center">
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      )}

      {/* Admin-Governed Role Change Request Modal */}
      <RequestRoleChangeModal
        isOpen={roleChangeModalOpen}
        onClose={() => setRoleChangeModalOpen(false)}
      />
    </motion.nav>
  );
}
