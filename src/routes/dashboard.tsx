import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { events } from "@/data/events";
import { ArrowUpRight, Calendar, Plus, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: pageMeta({
      title: "Dashboard",
      description:
        "Your Enginow Ignite command center — events, attendees, and analytics.",
      socialDescription:
        "Manage events, attendees, and analytics from one premium dashboard.",
      path: "/dashboard",
      noindex: true,
    }),
    links: canonical("/dashboard"),
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Total registrations", value: "3,412", delta: "+18%", trend: "up" as const },
  { label: "Active events", value: "6", delta: "+2", trend: "up" as const },
  { label: "Revenue (MTD)", value: "₹4.28L", delta: "+34%", trend: "up" as const },
  { label: "Avg. attendance", value: "82%", delta: "+3.4%", trend: "up" as const },
];

function Dashboard() {
  const myEvents = events.slice(0, 4);

  return (
    <PageShell>
      <section className="pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-eyebrow text-muted-foreground mb-3">Igniter dashboard</p>
              <h1 className="text-section-title">Good morning, Ada.</h1>
              <p className="text-lead mt-3">Here's what's happening across your events today.</p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-border bg-background text-sm hover:bg-secondary">
                Export report
              </button>
              <button className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90">
                <Plus className="size-4" /> New event
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
                <div className="text-caption">{k.label}</div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-stat">{k.value}</div>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3.5" /> {k.delta}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content grid */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* Events table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div>
                  <h3>Your events</h3>
                  <p className="text-caption mt-1">Live, upcoming, and closing soon.</p>
                </div>
                <Link to="/events" className="text-caption inline-flex items-center gap-1 hover:text-foreground">
                  View all <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {myEvents.map((e) => (
                  <Link
                    key={e.id}
                    to="/events/$eventId"
                    params={{ eventId: e.slug }}
                    className="grid grid-cols-[64px_1fr_auto] items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <img src={e.cover} alt="" className="size-16 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium text-sm">{e.title}</div>
                      <div className="text-caption flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" /> {e.dateLabel.split(",")[0]}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3" /> {e.registered}/{e.seats}
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatusPill status={e.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-base">Next up</h3>
                <p className="text-caption mt-1">In the next 48 hours.</p>
                <div className="mt-5 space-y-4">
                  {myEvents.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-start gap-3">
                      <div className="size-9 rounded-lg bg-secondary grid place-items-center text-xs font-semibold shrink-0">
                        {e.dateLabel.split(" ")[1]?.replace(/[^0-9]/g, "") || "•"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-caption">{e.mode} · {e.durationLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-base">Achiever leaderboard</h3>
                <p className="text-caption mt-1">Top contributors this month.</p>
                <ol className="mt-5 space-y-3">
                  {["Priya S.", "Rahul K.", "Meera V.", "Arjun T."].map((n, i) => (
                    <li key={n} className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-3">
                        <span className="text-caption w-4 tabular-nums">{i + 1}</span>
                        <span>{n}</span>
                      </span>
                      <span className="text-caption tabular-nums">{(1200 - i * 130).toLocaleString()} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function StatusPill({ status }: { status: "live" | "closing" | "upcoming" }) {
  const map = {
    live: { label: "● Live", cls: "text-[color:var(--live)] border-[color:var(--live)]/25 bg-[color:var(--live)]/10" },
    closing: { label: "Closing", cls: "text-[color:var(--closing)] border-[color:var(--closing)]/25 bg-[color:var(--closing)]/10" },
    upcoming: { label: "Upcoming", cls: "text-muted-foreground border-border bg-secondary" },
  } as const;
  const s = map[status];
  return <span className={`text-micro px-2 py-1 rounded-md border ${s.cls}`}>{s.label}</span>;
}
