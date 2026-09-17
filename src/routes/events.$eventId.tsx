import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { events, type EventItem } from "@/data/events";
import { canonical, pageMeta } from "@/lib/seo";
import { eventDescription } from "@/lib/seo-descriptions";
import { breadcrumbLd, eventLd, ldScript } from "@/lib/jsonld";
import {
  ArrowLeft, Calendar, Clock, MapPin, Trophy, Users, Heart, Ticket,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Mail, Tag, Mic,
  Building, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useNotifications } from "@/lib/notifications";
import { TicketModal } from "@/components/events/TicketModal";

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }): Promise<{ event: EventItem }> => {
    const event = events.find((e) => e.slug === params.eventId);
    if (typeof window === "undefined" && event) return { event };

    try {
      const response = await fetch(`/api/events/${params.eventId}`);
      if (response.ok) return { event: (await response.json()) as EventItem };
    } catch {
      // Use the seed event when the API is unavailable during local development.
    }

    if (!event) throw notFound();
    return { event };
  },
  head: ({ params, loaderData }) => ({
    meta: loaderData
      ? pageMeta({
          title: loaderData.event.title,
          description: eventDescription(loaderData.event),
          socialDescription: loaderData.event.tagline,
          path: `/events/${params.eventId}`,
          type: "article",
        })
      : pageMeta({
          title: "Event",
          description: "This event is unavailable.",
          path: `/events/${params.eventId}`,
          noindex: true,
        }),
    links: canonical(`/events/${params.eventId}`),
    scripts: loaderData
      ? [
          ldScript(eventLd(loaderData.event)),
          ldScript(breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: loaderData.event.title, path: `/events/${params.eventId}` },
          ])),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <PageShell>
      <section className="pt-40 pb-32 px-4 md:px-6 text-center">
        <p className="text-eyebrow text-muted-foreground mb-4">404</p>
        <h1 className="text-section-title">This event doesn't exist.</h1>
        <Link to="/events" className="mt-8 inline-flex items-center gap-2 text-sm underline underline-offset-4">
          <ArrowLeft className="size-4" /> Back to events
        </Link>
      </section>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <section className="pt-40 pb-32 px-4 md:px-6 text-center">
        <h1 className="text-section-title">Something broke.</h1>
        <p className="text-lead mt-4">{(error as Error)?.message ?? "Unknown error"}</p>
      </section>
    </PageShell>
  ),
  component: EventDetail,
});

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

function EventDetail() {
  const { event } = Route.useLoaderData() as { event: EventItem };
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const {
    events: platformEvents,
    registerForEvent,
    cancelRegistration,
    isRegistered,
    getRegistration,
    toggleFavorite,
    isFavorite,
  } = usePlatformStore();

  const [ticketOpen, setTicketOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const liveEvent = platformEvents.find((e) => e.id === event.id || e.slug === event.slug) ?? event;
  const capacityPct = Math.min(100, Math.round((liveEvent.registered / liveEvent.seats) * 100));

  const registered = isAuthenticated && user ? isRegistered(event.id, user.id) : false;
  const registration = isAuthenticated && user ? getRegistration(event.id, user.id) : undefined;
  const favorite = isAuthenticated ? isFavorite(event.id) : false;

  const isClosed = "registrationsOpen" in liveEvent && !liveEvent.registrationsOpen;
  const isSoldOut = liveEvent.registered >= liveEvent.seats;

  const deadline = useDeadlineCountdown(event.registrationDeadline);
  const deadlinePassed = deadline ? (deadline.d === 0 && deadline.h === 0 && deadline.m === 0 && deadline.s === 0) : false;

  const handleRegister = () => {
    if (!isAuthenticated || !user) return;
    setRegistering(true);
    try {
      registerForEvent(event.id, { name: user.name, email: user.email, college: user.college });
      setJustRegistered(true);
      setTicketOpen(true);
      addNotification(
        "Registration Confirmed! 🎉",
        `You're registered for "${event.title}". Check your dashboard for your ticket.`,
        "success"
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = () => {
    if (registration) {
      cancelRegistration(registration.id);
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
          <div className="mt-6 relative aspect-[16/7] overflow-hidden rounded-3xl border border-border">
            <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-micro bg-background/90 backdrop-blur px-2 py-1 rounded-md border border-border">{event.category}</span>
                <span className="text-micro bg-background/90 backdrop-blur px-2 py-1 rounded-md border border-border">{event.mode}</span>
                {event.status === "live" && (
                  <span className="text-micro bg-[color:var(--live)]/15 text-[color:var(--live)] px-2 py-1 rounded-md border border-[color:var(--live)]/25">● Registering</span>
                )}
                {event.tags?.slice(0, 3).map((tag) => (
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
                {!isAuthenticated ? (
                  <Link
                    to="/auth"
                    className="block w-full bg-primary text-primary-foreground text-sm font-semibold h-11 rounded-lg hover:opacity-90 transition-all text-center leading-[2.75rem] shadow-[0_0_20px_-4px_var(--primary-glow)]"
                  >
                    Sign in to Register
                  </Link>
                ) : registered ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="size-4" />
                      {justRegistered ? "You're registered! 🎉" : "Already Registered"}
                    </div>
                    {registration?.status === "confirmed" && (
                      <button
                        onClick={() => setTicketOpen(true)}
                        className="w-full flex items-center justify-center gap-2 h-11 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
                      >
                        <Ticket className="size-4" /> View My Ticket
                      </button>
                    )}
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center gap-2 h-10 border border-border text-sm text-muted-foreground rounded-lg hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      <XCircle className="size-4" /> Cancel Registration
                    </button>
                  </>
                ) : isClosed || deadlinePassed ? (
                  <div className="w-full h-11 flex items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg border border-border">
                    Registrations Closed
                  </div>
                ) : isSoldOut ? (
                  <div className="w-full h-11 flex items-center justify-center bg-secondary text-muted-foreground text-sm rounded-lg border border-border">
                    Sold Out
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-primary text-primary-foreground text-sm font-semibold h-11 rounded-lg hover:opacity-90 transition-all disabled:opacity-60 shadow-[0_0_20px_-4px_var(--primary-glow)]"
                  >
                    {registering ? "Registering..." : "Register Now — It's Free"}
                  </button>
                )}

                {isAuthenticated && user?.role === "student" && (
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className={`w-full flex items-center justify-center gap-2 h-10 border rounded-lg text-sm transition-colors ${
                      favorite
                        ? "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
                    {favorite ? "Saved to Favorites" : "Save Event"}
                  </button>
                )}
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
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 grid place-items-center text-sm font-bold text-primary">
                    {event.host.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{event.host.name}</div>
                    <div className="text-caption">{event.host.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {registration && (
        <TicketModal registration={registration} isOpen={ticketOpen} onClose={() => setTicketOpen(false)} />
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
