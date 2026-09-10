import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { breadcrumbLd, eventListLd, ldScript } from "@/lib/jsonld";
import { events, categories, type EventCategory } from "@/data/events";
import { ArrowUpRight, Calendar, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: pageMeta({
      title: "Events",
      description:
        "Browse hackathons, workshops, webinars, bootcamps and meetups happening on Enginow Ignite.",
      socialDescription:
        "Discover premium hackathons, workshops, webinars, bootcamps and meetups on Enginow Ignite.",
      path: "/events",
    }),
    links: canonical("/events"),
    scripts: [
      ldScript(eventListLd(events)),
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
        ]),
      ),
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCat = filter === "All" || e.category === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.tagline.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [filter, query]);

  return (
    <PageShell>
      {/* Header */}
      <section className="pt-36 pb-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-eyebrow text-muted-foreground mb-5">Explore events</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <h1 className="text-section-title max-w-2xl">
              Every event, engineered to be worth your time.
            </h1>
            <p className="text-lead max-w-md">
              Filter by format, search by topic or city. New events added every week.
            </p>
          </div>

          {/* Controls */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-xl px-4 h-11">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, topics, or cities"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = c === filter;
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`text-xs font-medium px-3 h-9 rounded-lg border transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="border border-border rounded-2xl p-14 text-center bg-surface">
              <p className="text-lead">No events match those filters.</p>
              <button
                onClick={() => {
                  setFilter("All");
                  setQuery("");
                }}
                className="mt-6 text-sm font-medium underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                >
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: e.slug }}
                    className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/25 transition-colors"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={e.cover}
                        alt={e.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="text-micro bg-background/90 backdrop-blur px-2 py-1 rounded-md border border-border">
                          {e.category}
                        </span>
                        {e.status === "live" && (
                          <span className="text-micro bg-[color:var(--live)]/15 text-[color:var(--live)] px-2 py-1 rounded-md border border-[color:var(--live)]/25">
                            ● Registering
                          </span>
                        )}
                        {e.status === "closing" && (
                          <span className="text-micro bg-[color:var(--closing)]/15 text-[color:var(--closing)] px-2 py-1 rounded-md border border-[color:var(--closing)]/25">
                            Closing soon
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="tracking-tight">{e.title}</h3>
                        <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.tagline}</p>
                      <div className="mt-5 grid grid-cols-3 gap-2 text-caption">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" /> {e.dateLabel.split(",")[0]}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" /> {e.mode}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5" /> {e.registered}/{e.seats}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
