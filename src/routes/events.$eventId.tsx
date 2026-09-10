import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { events, type EventItem } from "@/data/events";
import { canonical, pageMeta } from "@/lib/seo";
import { eventDescription } from "@/lib/seo-descriptions";
import { breadcrumbLd, eventLd, ldScript } from "@/lib/jsonld";
import { ArrowLeft, Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }): { event: (typeof events)[number] } => {
    const event = events.find((e) => e.slug === params.eventId);
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
          ldScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Events", path: "/events" },
              { name: loaderData.event.title, path: `/events/${params.eventId}` },
            ]),
          ),
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
        <p className="text-lead mt-4">{error.message}</p>
      </section>
    </PageShell>
  ),
  component: EventDetail,
});

function EventDetail() {
  const { event } = Route.useLoaderData() as { event: EventItem };
  const capacityPct = Math.min(100, Math.round((event.registered / event.seats) * 100));

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
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-micro bg-background/90 backdrop-blur px-2 py-1 rounded-md border border-border">
                  {event.category}
                </span>
                <span className="text-micro bg-background/90 backdrop-blur px-2 py-1 rounded-md border border-border">
                  {event.mode}
                </span>
                {event.status === "live" && (
                  <span className="text-micro bg-[color:var(--live)]/15 text-[color:var(--live)] px-2 py-1 rounded-md border border-[color:var(--live)]/25">
                    ● Registering
                  </span>
                )}
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
            <h2 className="text-section-title mb-6">About this event</h2>
            <p className="text-lead">{event.about}</p>

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

            <div className="mt-14">
              <p className="text-eyebrow text-muted-foreground mb-6">What's included</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl text-sm">
                    <span className="size-1.5 rounded-full bg-foreground" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: sticky sidebar */}
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-baseline justify-between">
                <div className="text-stat">{event.price}</div>
                {event.prize && <div className="text-caption text-[color:var(--closing)]">🏆 {event.prize}</div>}
              </div>
              <button className="mt-6 w-full bg-foreground text-background text-sm font-medium h-11 rounded-lg hover:bg-foreground/90 transition-colors">
                Register now
              </button>
              <div className="mt-6 space-y-3 text-sm">
                <Row icon={Calendar} label={event.dateLabel} />
                <Row icon={Clock} label={event.durationLabel} />
                <Row icon={MapPin} label={event.location} />
                <Row icon={Users} label={`${event.registered} / ${event.seats} registered`} />
                {event.prize && <Row icon={Trophy} label={event.prize} />}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-caption mb-2">
                  <span>Capacity</span>
                  <span>{capacityPct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-foreground" style={{ width: `${capacityPct}%` }} />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-eyebrow text-muted-foreground mb-3">Hosted by</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary grid place-items-center text-sm font-medium">
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
