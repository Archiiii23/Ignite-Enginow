import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { breadcrumbLd, eventListLd, ldScript } from "@/lib/jsonld";
import { events as staticEvents, categories } from "@/data/events";
import { usePlatformStore, type PlatformEvent } from "@/lib/platform-store";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowUpRight, Calendar, MapPin, Users, Heart, Search,
  SlidersHorizontal, X, ChevronDown, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: pageMeta({
      title: "Events",
      description: "Browse hackathons, workshops, webinars, bootcamps and meetups happening on Enginow Ignite.",
      socialDescription: "Discover premium hackathons, workshops, webinars, bootcamps and meetups on Enginow Ignite.",
      path: "/events",
    }),
    links: canonical("/events"),
    scripts: [
      ldScript(eventListLd(staticEvents)),
      ldScript(breadcrumbLd([{ name: "Home", path: "/" }, { name: "Events", path: "/events" }])),
    ],
  }),
  component: EventsPage,
});

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-secondary" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-secondary rounded-lg w-3/4" />
        <div className="h-3 bg-secondary rounded-lg w-full" />
        <div className="h-3 bg-secondary rounded-lg w-2/3" />
        <div className="mt-5 flex gap-4">
          <div className="h-3 bg-secondary rounded w-20" />
          <div className="h-3 bg-secondary rounded w-16" />
          <div className="h-3 bg-secondary rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  const navigate = useNavigate();
  const { events: storeEvents, toggleFavorite, isFavorite, isRegistered } = usePlatformStore();
  const { user, isAuthenticated } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Local filter state
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCity, setSelectedCity] = useState("");

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) setQ(params.get("q")!);
    if (params.get("category")) setSelectedCategory(params.get("category")!);
    if (params.get("mode")) setSelectedMode(params.get("mode")!);
    if (params.get("price")) setSelectedPrice(params.get("price")!);
    if (params.get("sort")) setSortBy(params.get("sort")!);
    if (params.get("city")) setSelectedCity(params.get("city")!);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedMode) params.set("mode", selectedMode);
    if (selectedPrice) params.set("price", selectedPrice);
    if (sortBy && sortBy !== "latest") params.set("sort", sortBy);
    if (selectedCity) params.set("city", selectedCity);
    const search = params.toString();
    const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [q, selectedCategory, selectedMode, selectedPrice, sortBy, selectedCity]);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Merge static + store events (published from store, fall back to static)
  const allEvents: PlatformEvent[] = useMemo(() => {
    const published = storeEvents.filter((e) => e.approvalStatus === "published");
    if (published.length > 0) return published;
    // Cast static events as PlatformEvent for display
    return staticEvents.map((e) => ({
      ...e,
      approvalStatus: "published" as const,
      organizerId: "seed",
      organizerName: e.host.name,
      registrationsOpen: e.status !== "closing",
    }));
  }, [storeEvents]);

  const activeFilterCount = [selectedCategory, selectedMode, selectedPrice, selectedCity, q]
    .filter(Boolean).length;

  // Unique cities from events
  const cities = [...new Set(allEvents.map((e) => e.city ?? e.location.split(",")[0].trim()).filter(Boolean))];

  const clearAll = () => {
    setQ(""); setSelectedCategory(""); setSelectedMode("");
    setSelectedPrice(""); setSortBy("latest"); setSelectedCity("");
  };

  const filtered = useMemo(() => {
    let list = [...allEvents];

    // Text search
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.tagline.toLowerCase().includes(lower) ||
          e.location.toLowerCase().includes(lower) ||
          e.category.toLowerCase().includes(lower) ||
          e.organizerName?.toLowerCase().includes(lower) ||
          (e.tags ?? []).some((t: string) => t.toLowerCase().includes(lower))
      );
    }

    // Category
    if (selectedCategory) {
      list = list.filter((e) => e.category === selectedCategory);
    }

    // Mode
    if (selectedMode) {
      list = list.filter((e) => {
        if (selectedMode === "online") return e.mode === "Online";
        if (selectedMode === "offline") return e.mode === "In-person";
        if (selectedMode === "hybrid") return e.mode === "Hybrid";
        return true;
      });
    }

    // Price
    if (selectedPrice) {
      list = list.filter((e) => {
        if (selectedPrice === "free") return e.price === "Free";
        if (selectedPrice === "paid") return e.price !== "Free";
        return true;
      });
    }

    // City
    if (selectedCity) {
      list = list.filter(
        (e) =>
          (e.city ?? "").toLowerCase().includes(selectedCity.toLowerCase()) ||
          e.location.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "popular") {
      list.sort((a, b) => b.registered - a.registered);
    } else if (sortBy === "upcoming") {
      list.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    } else if (sortBy === "closing") {
      const statusOrder: Record<string, number> = { closing: 0, live: 1, upcoming: 2, ended: 3 };
      list.sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
    } else {
      list.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    }

    return list;
  }, [allEvents, q, selectedCategory, selectedMode, selectedPrice, selectedCity, sortBy]);

  return (
    <PageShell>
      {/* Header */}
      <section className="pt-36 pb-10 px-4 md:px-6">
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

          {/* Search + Controls row */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 h-11 focus-within:border-primary transition-colors">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, organizers, topics, tags..."
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-colors ${filterOpen ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 size-5 rounded-full bg-primary-foreground text-primary text-[11px] font-bold grid place-items-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 pl-3 pr-8 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="upcoming">Upcoming First</option>
                <option value="closing">Closing Soon</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-3.5 size-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 bg-card border border-border rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">All</option>
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Mode</label>
                    <div className="flex gap-2 flex-wrap">
                      {[["", "All"], ["online", "Online"], ["offline", "Offline"], ["hybrid", "Hybrid"]].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setSelectedMode(val)}
                          className={`flex-1 min-w-fit h-9 px-2 rounded-lg border text-xs font-medium transition-colors ${selectedMode === val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Price</label>
                    <div className="flex gap-2">
                      {[["", "All"], ["free", "Free"], ["paid", "Paid"]].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setSelectedPrice(val)}
                          className={`flex-1 h-9 rounded-lg border text-xs font-medium transition-colors ${selectedPrice === val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Any city</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {q && (
                <button onClick={() => setQ("")} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  &ldquo;{q}&rdquo; <X className="size-3" />
                </button>
              )}
              {selectedCategory && (
                <button onClick={() => setSelectedCategory("")} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  {selectedCategory} <X className="size-3" />
                </button>
              )}
              {selectedMode && (
                <button onClick={() => setSelectedMode("")} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  {selectedMode} <X className="size-3" />
                </button>
              )}
              {selectedPrice && (
                <button onClick={() => setSelectedPrice("")} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  {selectedPrice} <X className="size-3" />
                </button>
              )}
              {selectedCity && (
                <button onClick={() => setSelectedCity("")} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  {selectedCity} <X className="size-3" />
                </button>
              )}
              <button onClick={clearAll} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-border rounded-2xl p-14 text-center bg-surface">
              <Search className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-lead">No events match those filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or removing some filters.</p>
              <button
                onClick={clearAll}
                className="mt-6 text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((e, i) => {
                  const favorited = isAuthenticated ? isFavorite(e.id) : false;
                  const alreadyReg = isAuthenticated && user ? isRegistered(e.id, user.id) : false;
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.04 }}
                    >
                      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/25 transition-colors">
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: e.slug }}
                          className="block"
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
                                  ● Live
                                </span>
                              )}
                              {e.status === "closing" && (
                                <span className="text-micro bg-[color:var(--closing)]/15 text-[color:var(--closing)] px-2 py-1 rounded-md border border-[color:var(--closing)]/25">
                                  Closing
                                </span>
                              )}
                            </div>
                            {alreadyReg && (
                              <div className="absolute top-3 right-3">
                                <span className="text-micro bg-emerald-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1">
                                  <CheckCircle2 className="size-2.5" /> Registered
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-semibold text-base tracking-tight leading-snug">{e.title}</h3>
                              <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{e.tagline}</p>

                            {/* Tags */}
                            {e.tags && e.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {e.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex gap-3 text-caption">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" /> {e.dateLabel.split(",")[0]}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3" /> {e.mode}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="size-3" /> {e.registered}/{e.seats}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-foreground">{e.price}</span>
                            </div>
                          </div>
                        </Link>

                        {/* Favorite button */}
                        {isAuthenticated && user?.role === "student" && (
                          <button
                            onClick={(ev) => { ev.preventDefault(); toggleFavorite(e.id); }}
                            className={`absolute bottom-4 right-4 p-2 rounded-xl border transition-all ${favorited ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                            title={favorited ? "Remove from saved" : "Save event"}
                          >
                            <Heart className={`size-3.5 ${favorited ? "fill-current" : ""}`} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
