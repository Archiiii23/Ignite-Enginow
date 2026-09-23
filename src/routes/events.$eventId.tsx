import { Link, useNavigate, useParams } from "@/lib/router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { events, type EventItem } from "@/data/events";
import {
  ArrowLeft, Calendar, Clock, MapPin, Trophy, Users, Heart, Ticket,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Mail, Tag, Mic,
  Building, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore, type Registration } from "@/lib/platform-store";
import { useNotifications } from "@/lib/notifications";
import { TicketModal } from "@/components/events/TicketModal";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";
import { toast } from "sonner";

function useDeadlineCountdown(deadlineISO?: string) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    if (!deadlineISO) return;
    const tick = () => {
      const diff = new Date(deadlineISO).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineISO]);
  return timeLeft;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/40 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const {
    events: platformEvents,
    approveEvent,
    registerForEvent,
    cancelRegistration,
    isRegistered,
    getRegistration,
    toggleFavorite,
    isFavorite,
  } = usePlatformStore();

  const [ticketOpen, setTicketOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const event =
    platformEvents.find((e) => e.slug === eventId || e.id === eventId) ??
    events.find((e) => e.slug === eventId || e.id === eventId);

  if (!event) {
    return (
      <PageShell>
        <section className="pt-40 pb-32 px-4 md:px-6 text-center">
          <p className="text-eyebrow text-muted-foreground mb-4">404</p>
          <h1 className="text-section-title">This event doesn't exist.</h1>
          <Link to="/events" className="mt-8 inline-flex items-center gap-2 text-sm underline underline-offset-4">
            <ArrowLeft className="size-4" /> Back to events
          </Link>
        </section>
      </PageShell>
    );
  }

  const liveEvent = platformEvents.find((e) => e.id === event.id || e.slug === event.slug) ?? event;
  const capacityPct = Math.min(100, Math.round((liveEvent.registered / liveEvent.seats) * 100));

  const isPendingApproval = "approvalStatus" in liveEvent && liveEvent.approvalStatus === "pending_approval";
  const isRejected = "approvalStatus" in liveEvent && liveEvent.approvalStatus === "rejected";

  const registered = (isAuthenticated && user ? isRegistered(event.id, user.id) : false) || !!activeRegistration;
  const registration = (isAuthenticated && user ? getRegistration(event.id, user.id) : undefined) || activeRegistration;
  const favorite = isFavorite(event.id);

  const isClosed = "registrationsOpen" in liveEvent && !liveEvent.registrationsOpen;
  const isSoldOut = liveEvent.registered >= liveEvent.seats;

  const deadline = useDeadlineCountdown(event.registrationDeadline);
  const deadlinePassed = deadline ? (deadline.d === 0 && deadline.h === 0 && deadline.m === 0 && deadline.s === 0) : false;

  const handleOpenRegisterModal = async () => {
    if (!isAuthenticated || !user) {
      try {
        await loginWithGoogle({
          role: "student",
          name: "Guest Innovator",
          email: "innovator@campus.edu",
        });
        toast.success("Attendee session active! Complete your registration below.");
      } catch {
        navigate({ to: "/auth" });
        return;
      }
    }
    setRegistrationModalOpen(true);
  };

  const handleCompleteRegistration = async (formData: Partial<Registration>) => {
    try {
      const newReg = await registerForEvent(event.id, formData);
      setActiveRegistration(newReg);
      setJustRegistered(true);
      setRegistrationModalOpen(false);
      setTicketOpen(true);
      addNotification(
        "Registration Confirmed! 🎉",
        `You're registered for "${event.title}". Your official pass has been generated.`,
        "success"
      );
    } catch {
      addNotification("Registration Failed", "Could not complete registration. Please try again.", "warning");
    }
  };

  const handleCancel = () => {
    if (registration) {
      cancelRegistration(registration.id);
      setActiveRegistration(null);
      setJustRegistered(false);
      addNotification("Registration Cancelled", `Your registration for "${event.title}" has been cancelled.`, "warning");
    }
  };

  return (
    <PageShell>
      {/* Cover */}
      <section className="pt-28 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/events" className="inline-flex items-center gap-2 text-caption hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All events
          </Link>

          {isPendingApproval && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Clock className="size-5 shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Event in Pending Review (Step 2 of Event Approval Flow)</div>
                  <div className="text-xs opacity-90 mt-0.5">
                    This event has been submitted by the organizer and is currently awaiting administrator review before becoming public.
                  </div>
                </div>
              </div>
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    approveEvent(liveEvent.id);
                    toast.success(`Event approved! It is now Public for student registration.`);
                  }}
                  className="shrink-0 h-9 px-4 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="size-3.5" /> Approve & Make Public
                </button>
              )}
            </div>
          )}

          {isRejected && (
            <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 flex items-center gap-2.5 shadow-sm">
              <XCircle className="size-5 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Event Submission Rejected</div>
                <div className="text-xs opacity-90 mt-0.5">
                  {"rejectionReason" in liveEvent && liveEvent.rejectionReason
                    ? `Reason: ${liveEvent.rejectionReason}`
                    : "This event was not approved for publication."}
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 relative aspect-[16/7] overflow-hidden rounded-3xl border border-border">
            <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              {/* Tags & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-micro bg-background/90 backdrop-blur px-2.5 py-1 rounded-md border border-border font-semibold">{event.category}</span>
                {event.eventType && (
                  <span className="text-micro bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded-md shadow-sm">{event.eventType}</span>
                )}
                <span className="text-micro bg-background/90 backdrop-blur px-2.5 py-1 rounded-md border border-border">{event.mode}</span>
                {event.college && (
                  <span className="text-micro bg-secondary backdrop-blur px-2.5 py-1 rounded-md border border-border flex items-center gap-1 font-medium">
                    🎓 {event.college}
                  </span>
                )}
                {event.status === "live" && (
                  <span className="text-micro bg-[color:var(--live)]/15 text-[color:var(--live)] px-2 py-1 rounded-md border border-[color:var(--live)]/25">● Registering</span>
                )}
                {event.tags?.map((tag) => (
                  <span key={tag} className="text-micro bg-background/70 backdrop-blur px-2 py-1 rounded-md border border-border/60 flex items-center gap-1">
                    <Tag className="size-2" /> {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-display max-w-4xl">{event.title}</h1>
              <p className="text-lead mt-4 max-w-2xl">{event.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          {/* Left */}
          <div>
            {/* About */}
            <h2 className="text-section-title mb-6">About this event</h2>
            <p className="text-lead">{event.about}</p>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="mt-14">
                <p className="text-eyebrow text-muted-foreground mb-6 flex items-center gap-2">
                  <Mic className="size-3.5" /> Speakers & Mentors
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 border border-primary/10 grid place-items-center text-lg font-bold text-primary font-display shrink-0">
                        {speaker.avatar ? (
                          <img src={speaker.avatar} alt={speaker.name} className="size-full rounded-xl object-cover" />
                        ) : (
                          speaker.name[0]
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{speaker.name}</div>
                        <div className="text-xs text-muted-foreground">{speaker.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            <div className="mt-14">
              <p className="text-eyebrow text-muted-foreground mb-6">Agenda</p>
              <ol className="space-y-4">
                {event.agenda.map((a, i) => (
                  <li key={i} className="grid grid-cols-[110px_1fr] gap-6 p-5 bg-surface border border-border rounded-xl">
                    <div className="text-caption font-medium text-foreground">{a.time}</div>
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{a.description}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* What's included */}
            <div className="mt-14">
              <p className="text-eyebrow text-muted-foreground mb-6">What's included</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl text-sm">
                    <CheckCircle2 className="size-4 text-primary shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="mt-14">
                <p className="text-eyebrow text-muted-foreground mb-6 flex items-center gap-2">
                  <Building className="size-3.5" /> Sponsors & Partners
                </p>
                <div className="flex flex-wrap gap-3">
                  {event.sponsors.map((sponsor, idx) => (
                    <div key={idx} className="px-5 py-3 bg-card border border-border rounded-xl text-sm font-semibold text-foreground">
                      {sponsor.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {event.faqs && event.faqs.length > 0 && (
              <div className="mt-14">
                <p className="text-eyebrow text-muted-foreground mb-6">Frequently Asked Questions</p>
                <div className="space-y-3">
                  {event.faqs.map((faq, idx) => (
                    <FAQItem key={idx} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {event.contactEmail && (
              <div className="mt-14 p-5 bg-card border border-border rounded-2xl flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                  <Mail className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Have questions?</div>
                  <a href={`mailto:${event.contactEmail}`} className="text-sm text-primary hover:underline">{event.contactEmail}</a>
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-baseline justify-between">
                <div className="text-stat">{event.price}</div>
                {event.prize && <div className="text-caption text-[color:var(--closing)]">🏆 {event.prize}</div>}
              </div>

              {/* Registration deadline countdown */}
              {event.registrationDeadline && deadline && !deadlinePassed && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="size-3" /> Registration closes in
                  </div>
                  <div className="flex gap-3 text-center">
                    {[["d", deadline.d], ["h", deadline.h], ["m", deadline.m], ["s", deadline.s]].map(([unit, val]) => (
                      <div key={unit as string} className="flex-1">
                        <div className="text-lg font-bold font-display text-foreground tabular-nums">{String(val).padStart(2, "0")}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {deadlinePassed && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                  <XCircle className="size-3.5" /> Registration deadline has passed
                </div>
              )}

              {/* Registration CTA */}
              <div className="mt-5 space-y-3">
                {registered ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="size-4" />
                      {justRegistered ? "You're registered! 🎉" : "Already Registered"}
                    </div>
                    {registration && (
                      <button
                        onClick={() => {
                          setActiveRegistration(registration);
                          setTicketOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 h-11 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors shadow-sm"
                      >
                        <Ticket className="size-4" /> View My Ticket Pass
                      </button>
                    )}
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center gap-2 h-10 border border-border text-sm text-muted-foreground rounded-lg hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      <XCircle className="size-4" /> Cancel Registration
                    </button>
                  </>
                ) : isPendingApproval ? (
                  <div className="space-y-2.5">
                    <div className="w-full p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
                      <Clock className="size-4" /> Pending Admin Review
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                      Student registrations will open immediately once approved by an administrator.
                    </p>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          approveEvent(liveEvent.id);
                          toast.success(`Event approved! It is now Public for student registration.`);
                        }}
                        className="w-full h-10 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="size-3.5" /> Approve & Make Public
                      </button>
                    )}
                  </div>
                ) : isRejected ? (
                  <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
                    <XCircle className="size-4" /> Not Approved
                  </div>
                ) : isClosed || deadlinePassed ? (
                  <div className="w-full h-11 flex items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg border border-border">
                    Registrations Closed
                  </div>
                ) : isSoldOut ? (
                  <div className="w-full h-11 flex items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg border border-border">
                    Sold Out
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleOpenRegisterModal}
                      className="w-full bg-primary text-primary-foreground text-sm font-semibold h-11 rounded-lg hover:opacity-90 transition-all shadow-[0_0_20px_-4px_var(--primary-glow)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Ticket className="size-4" />
                      Register Now — {event.price === "Free" ? "It's Free" : event.price}
                    </button>
                    {!isAuthenticated && (
                      <div className="text-center">
                        <Link
                          to="/auth"
                          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                        >
                          Already have an account? Sign in
                        </Link>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => toggleFavorite(event.id)}
                  className={`w-full flex items-center justify-center gap-2 h-10 border rounded-lg text-sm transition-colors cursor-pointer ${
                    favorite
                      ? "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
                  {favorite ? "Saved to Favorites" : "Save Event"}
                </button>
              </div>

              {/* Event meta */}
              <div className="mt-6 space-y-3 text-sm">
                <Row icon={Calendar} label={event.dateLabel} />
                <Row icon={Clock} label={event.durationLabel} />
                <Row icon={MapPin} label={event.location} />
                <Row icon={Users} label={`${liveEvent.registered} / ${liveEvent.seats} registered`} />
                {event.prize && <Row icon={Trophy} label={event.prize} />}
              </div>

              {/* Capacity bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-caption mb-2">
                  <span>Capacity</span>
                  <span className={capacityPct >= 90 ? "text-[color:var(--live)] font-semibold" : ""}>{capacityPct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${capacityPct >= 90 ? "bg-[color:var(--live)]" : "bg-gradient-to-r from-primary to-primary-glow"}`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>

              {/* Host */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-eyebrow text-muted-foreground mb-3">Hosted by</p>
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 border border-primary/20 overflow-hidden grid place-items-center text-sm font-bold text-primary shrink-0 shadow-sm">
                    {event.host?.avatar ? (
                      <img src={event.host.avatar} alt={event.host?.name || "Host"} className="size-full object-cover" />
                    ) : (
                      (event.host?.name || "E")[0]
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      {event.host?.name || "Enginow Host"}
                      <CheckCircle2 className="size-3 text-primary" />
                    </div>
                    <div className="text-caption text-muted-foreground">{event.host?.role || "Event Coordinator"}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <EventRegistrationModal
        event={event as EventItem}
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onSubmitRegistration={handleCompleteRegistration}
      />

      {(activeRegistration || registration) && (
        <TicketModal
          registration={activeRegistration || registration || null}
          isOpen={ticketOpen}
          onClose={() => setTicketOpen(false)}
        />
      )}
    </PageShell>
  );
}

function Row({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-3 text-foreground/85">
      <Icon className="size-4 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
}
