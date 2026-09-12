import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Heart,
  QrCode,
  Ticket,
  XCircle,
  CheckCircle2,
  Clock,
  User,
  Github,
  Linkedin,
  BookOpen,
  Star,
  ArrowUpRight,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { TicketModal } from "@/components/events/TicketModal";
import type { Registration } from "@/lib/platform-store";
import { cardHoverVariants, tableRowVariants } from "@/animations/motionVariants";

type Tab = "events" | "favorites" | "profile";

export function StudentPortal() {
  const { user, updateUserProfile } = useAuth();
  const { registrations, events, favorites, cancelRegistration, toggleFavorite } =
    usePlatformStore();

  const [tab, setTab] = useState<Tab>("events");
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: user?.name ?? "",
    college: user?.college ?? "",
    bio: user?.bio ?? "",
    headline: user?.headline ?? "",
    github: user?.github ?? "",
    linkedin: user?.linkedin ?? "",
    skills: user?.skills?.join(", ") ?? "",
  });

  const myRegistrations = registrations.filter((r) => r.userId === user?.id);
  const favoriteEvents = events.filter((e) => favorites.includes(e.id));

  const statusConfig = {
    confirmed: {
      label: "Confirmed",
      cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    attended: {
      label: "Attended ✓",
      cls: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    cancelled: {
      label: "Cancelled",
      cls: "text-muted-foreground bg-secondary border-border",
    },
  };

  const openTicket = (reg: Registration) => {
    setSelectedTicket(reg);
    setTicketOpen(true);
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      name: profileDraft.name,
      college: profileDraft.college,
      bio: profileDraft.bio,
      headline: profileDraft.headline,
      github: profileDraft.github,
      linkedin: profileDraft.linkedin,
      skills: profileDraft.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setEditingProfile(false);
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="size-16 rounded-2xl object-cover border-2 border-primary/30 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
              Achiever
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">{user?.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.headline}</p>
            {user?.college && (
              <p className="text-xs text-primary font-medium mt-0.5">{user.college}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
          >
            <Star className="size-3.5 text-primary" /> Browse Events
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-8 w-fit">
        {([
          ["events", "My Events", Ticket],
          ["favorites", "Saved", Heart],
          ["profile", "Profile", User],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* My Events Tab */}
        {tab === "events" && (
          <motion.div
            key="events-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {myRegistrations.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-2xl">
                <Ticket className="size-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No registrations yet.</p>
                <Link
                  to="/events"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
                >
                  Explore events <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map((reg, i) => {
                  const ev = events.find((e) => e.id === reg.eventId);
                  const s = statusConfig[reg.status];
                  return (
                    <motion.div
                      key={reg.id}
                      custom={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="show"
                      whileHover={{ scale: 1.005 }}
                      className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-all shadow-sm"
                    >
                      {ev?.cover && (
                        <img
                          src={ev.cover}
                          alt=""
                          className="size-16 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {reg.eventTitle}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> {reg.eventDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <QrCode className="size-3" /> {reg.ticketCode}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}
                        >
                          {s.label}
                        </span>
                        {reg.status === "confirmed" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => openTicket(reg)}
                              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                            >
                              <Ticket className="size-3.5" /> View Ticket
                            </motion.button>
                            <button
                              onClick={() => cancelRegistration(reg.id)}
                              className="h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                              title="Cancel registration"
                            >
                              <XCircle className="size-4" />
                            </button>
                          </>
                        )}
                        {reg.status === "attended" && (
                          <button
                            onClick={() => openTicket(reg)}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs hover:bg-secondary transition-colors"
                          >
                            <BookOpen className="size-3.5" /> View Pass
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Favorites Tab */}
        {tab === "favorites" && (
          <motion.div
            key="favorites-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {favoriteEvents.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-2xl">
                <Heart className="size-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No saved events yet.</p>
                <Link
                  to="/events"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
                >
                  Browse events <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="relative aspect-[16/7] overflow-hidden">
                      <img
                        src={ev.cover}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleFavorite(ev.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur text-primary hover:scale-110 transition-transform"
                        title="Remove from saved"
                      >
                        <Heart className="size-4 fill-current" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-medium text-primary mb-1">{ev.category}</div>
                      <div className="font-semibold">{ev.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="size-3" /> {ev.dateLabel}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{ev.price}</span>
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: ev.slug }}
                          className="text-xs text-primary underline underline-offset-4 hover:opacity-80"
                        >
                          View event →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6"
          >
            {/* Profile card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center h-fit">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="size-20 rounded-2xl object-cover mx-auto border-2 border-primary/30"
              />
              <div className="mt-3 font-bold text-lg font-display">{user?.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{user?.email}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="size-3" /> Achiever (Student)
              </div>
              {user?.skills && user.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-secondary border border-border font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center gap-2">
                {user?.github && (
                  <a
                    href={`https://${user.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Github className="size-4" />
                  </a>
                )}
                {user?.linkedin && (
                  <a
                    href={`https://${user.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Linkedin className="size-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Profile editor */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Your Profile</h2>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    <Edit3 className="size-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm hover:bg-secondary"
                    >
                      <X className="size-3.5" /> Discard
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                    >
                      <Save className="size-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {(
                  [
                    ["name", "Full Name", "text", "Ada Lovelace"],
                    ["headline", "Headline / Role", "text", "CS Undergraduate · Hackathon Enthusiast"],
                    ["college", "College / Organization", "text", "IIT Bombay"],
                    ["bio", "Bio", "textarea", "Tell the community about yourself..."],
                    ["github", "GitHub URL", "text", "github.com/username"],
                    ["linkedin", "LinkedIn URL", "text", "linkedin.com/in/username"],
                    ["skills", "Skills (comma-separated)", "text", "Python, React, TypeScript"],
                  ] as const
                ).map(([field, label, type, placeholder]) => (
                  <label key={field} className="block">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    {type === "textarea" ? (
                      <textarea
                        disabled={!editingProfile}
                        value={profileDraft[field as keyof typeof profileDraft]}
                        onChange={(e) =>
                          setProfileDraft((d) => ({ ...d, [field]: e.target.value }))
                        }
                        rows={3}
                        placeholder={placeholder}
                        className="mt-1.5 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60 resize-none"
                      />
                    ) : (
                      <input
                        type={type}
                        disabled={!editingProfile}
                        value={profileDraft[field as keyof typeof profileDraft]}
                        onChange={(e) =>
                          setProfileDraft((d) => ({ ...d, [field]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className="mt-1.5 w-full h-10 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      <TicketModal
        registration={selectedTicket}
        isOpen={ticketOpen}
        onClose={() => setTicketOpen(false)}
      />
    </div>
  );
}
