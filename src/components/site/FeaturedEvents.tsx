import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Users, Star, Calendar, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePlatformStore } from "@/lib/platform-store";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function FeaturedEvents() {
  const { events } = usePlatformStore();
  const [view, setView] = useState<"featured" | "upcoming">("featured");

  const published = events.filter((e) => e.approvalStatus === "published");
  const featured = published.filter((e) => e.isFeatured);
  const featuredList = featured.length >= 3 ? featured.slice(0, 6) : published.slice(0, 6);

  const upcomingList = [...published]
    .filter((e) => e.status !== "ended")
    .sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""))
    .slice(0, 6);

  const displayEvents = view === "featured" ? featuredList : upcomingList;

  const statusClass = {
    live: "bg-background/85 backdrop-blur text-[color:var(--live)] ring-1 ring-[color:var(--live)]/40",
    closing: "bg-background/85 backdrop-blur text-[color:var(--closing)] ring-1 ring-[color:var(--closing)]/40",
    upcoming: "bg-background/85 backdrop-blur text-foreground ring-1 ring-foreground/15",
    ended: "bg-background/85 backdrop-blur text-muted-foreground ring-1 ring-foreground/15",
  };

  const statusLabel = {
    live: "● Live now",
    closing: "Closing soon",
    upcoming: "Upcoming",
    ended: "Ended",
  };

  return (
    <section id="events" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-eyebrow text-primary font-semibold">
                — Scene 2: Explore
              </span>
              <h2 className="mt-3 text-section-title">
                {view === "featured" ? "Featured Events" : "Upcoming Events"}
              </h2>
              <p className="mt-4 text-lead max-w-[52ch]">
                {view === "featured"
                  ? "The most anticipated gatherings across the global ecosystem — hand-picked by the Ignite team."
                  : "Upcoming hackathons, workshops, and meetups scheduled across campuses and online."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Switcher */}
              <div className="inline-flex p-1 bg-secondary rounded-xl border border-border">
                <button
                  onClick={() => setView("featured")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    view === "featured"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="size-3.5 text-amber-500" />
                  Featured ({featuredList.length})
                </button>
                <button
                  onClick={() => setView("upcoming")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    view === "upcoming"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="size-3.5 text-primary" />
                  Upcoming ({upcomingList.length})
                </button>
              </div>

              <Link
                to="/events"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-glow transition-colors ml-2"
              >
                View all <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {displayEvents.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Star className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No featured events yet.</p>
            <Link to="/events" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
              Browse all events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayEvents.map((event, i) => (
              <ScrollReveal key={event.id} delay={i * 0.06} direction="up">
                <motion.article
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-sm dark:hover:shadow-[0_12px_36px_-10px_rgba(168,85,247,0.18)]"
                >
                  <Link to="/events/$eventId" params={{ eventId: event.slug }} className="block">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.cover}
                        alt={event.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                      <span
                        className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-micro ${statusClass[event.status] ?? statusClass.upcoming}`}
                      >
                        {statusLabel[event.status] ?? event.status}
                      </span>
                      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-micro bg-background/70 backdrop-blur border border-border">
                        {event.category}
                      </span>
                      {event.isFeatured && (
                        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 text-micro bg-primary/90 text-primary-foreground px-2 py-1 rounded-md">
                          <Star className="size-2.5 fill-current" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-lg font-medium tracking-[-0.015em] group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground shrink-0 mt-1">
                          {event.dateLabel.split(",")[0]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.tagline}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-caption">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> {event.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5" /> {event.registered.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{event.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
