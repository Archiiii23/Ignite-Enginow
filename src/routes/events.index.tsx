import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { breadcrumbLd, eventListLd, ldScript } from "@/lib/jsonld";
import { events as staticEvents, categories, categoryMeta, eventTypes } from "@/data/events";
import { usePlatformStore, type PlatformEvent } from "@/lib/platform-store";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowUpRight, Calendar, MapPin, Users, Heart, Search,
  SlidersHorizontal, X, ChevronDown, CheckCircle2, Clock,
  Sparkles, GraduationCap, Building, Tag,
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
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) setQ(params.get("q")!);
    if (params.get("category")) setSelectedCategory(params.get("category")!);
    if (params.get("type")) setSelectedEventType(params.get("type")!);
    if (params.get("mode")) setSelectedMode(params.get("mode")!);
    if (params.get("price")) setSelectedPrice(params.get("price")!);
    if (params.get("date")) setSelectedDate(params.get("date")!);
    if (params.get("city")) setSelectedCity(params.get("city")!);
    if (params.get("college")) setSelectedCollege(params.get("college")!);
    if (params.get("sort")) setSortBy(params.get("sort")!);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedEventType) params.set("type", selectedEventType);
    if (selectedMode) params.set("mode", selectedMode);
    if (selectedPrice) params.set("price", selectedPrice);
    if (selectedDate) params.set("date", selectedDate);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedCollege) params.set("college", selectedCollege);
    if (sortBy && sortBy !== "latest") params.set("sort", sortBy);
    const search = params.toString();
    const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [q, selectedCategory, selectedEventType, selectedMode, selectedPrice, selectedDate, selectedCity, selectedCollege, sortBy]);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Merge static + store events
  const allEvents: PlatformEvent[] = useMemo(() => {
    const published = storeEvents.filter((e) => e.approvalStatus === "published");
    if (published.length > 0) return published;
    return staticEvents.map((e) => ({
      ...e,
      approvalStatus: "published" as const,
      organizerId: "seed",
      organizerName: e.host.name,
      registrationsOpen: e.status !== "closing",
    }));
  }, [storeEvents]);

  // Unique cities from events
  const cities = useMemo(() => {
    return Array.from(new Set(allEvents.map((e) => e.city ?? e.location.split(",")[0].trim()).filter(Boolean))).sort();
  }, [allEvents]);

  // Unique colleges from events
  const colleges = useMemo(() => {
    return Array.from(new Set(allEvents.map((e) => e.college).filter(Boolean))) as string[];
  }, [allEvents]);

  const activeFilterCount = [
    selectedCategory,
    selectedEventType,
    selectedMode,
    selectedPrice,
    selectedDate,
    selectedCity,
    selectedCollege,
    q,
  ].filter(Boolean).length;

  const clearAll = () => {
    setQ("");
    setSelectedCategory("");
    setSelectedEventType("");
    setSelectedMode("");
    setSelectedPrice("");
    setSelectedDate("");
    setSelectedCity("");
    setSelectedCollege("");
    setSortBy("latest");
  };

  const filtered = useMemo(() => {
    let list = [...allEvents];

    // 1. Search using: Event Name, Organizer, Category, Tags
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(lower);
        const taglineMatch = e.tagline.toLowerCase().includes(lower);
        const aboutMatch = e.about?.toLowerCase().includes(lower);
        const organizerMatch =
          e.organizerName?.toLowerCase().includes(lower) ||
          e.host?.name.toLowerCase().includes(lower);
        const categoryMatch = e.category.toLowerCase().includes(lower);
        const eventTypeMatch = e.eventType?.toLowerCase().includes(lower);
        const collegeMatch = e.college?.toLowerCase().includes(lower);
        const tagsMatch = (e.tags ?? []).some((t: string) => t.toLowerCase().includes(lower));

        return (
          titleMatch ||
          taglineMatch ||
          aboutMatch ||
          organizerMatch ||
          categoryMatch ||
          eventTypeMatch ||
          collegeMatch ||
          tagsMatch
        );
      });
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== "All") {
      const selNorm = selectedCategory.toLowerCase().replace(/s$/, "");
      list = list.filter((e) => {
        const catNorm = e.category.toLowerCase().replace(/s$/, "");
        return (
          e.category.toLowerCase() === selectedCategory.toLowerCase() ||
          catNorm === selNorm
        );
      });
    }

    // 3. Event Type Filter (Workshop, Hackathon, Webinar, etc.)
    if (selectedEventType) {
      list = list.filter(
        (e) =>
          e.eventType?.toLowerCase() === selectedEventType.toLowerCase() ||
          e.category.toLowerCase() === selectedEventType.toLowerCase()
      );
    }

    // 4. Online / Offline Filter
    if (selectedMode) {
      list = list.filter((e) => {
        if (selectedMode === "online") return e.mode === "Online";
        if (selectedMode === "offline") return e.mode === "In-person";
        if (selectedMode === "hybrid") return e.mode === "Hybrid";
        return true;
      });
    }

    // 5. Free / Paid Filter
    if (selectedPrice) {
      list = list.filter((e) => {
        if (selectedPrice === "free") return e.price.toLowerCase() === "free";
        if (selectedPrice === "paid") return e.price.toLowerCase() !== "free";
        return true;
      });
    }

    // 6. Date Filter
    if (selectedDate) {
      const now = new Date();
      list = list.filter((e) => {
        const evDate = new Date(e.dateISO);
        if (selectedDate === "today") {
          return evDate.toDateString() === now.toDateString();
        }
        if (selectedDate === "weekend") {
          const day = evDate.getDay();
          return day === 0 || day === 6; // Saturday or Sunday
        }
        if (selectedDate === "month") {
          return (
            evDate.getMonth() === now.getMonth() &&
            evDate.getFullYear() === now.getFullYear()
          );
        }
        if (selectedDate === "upcoming") {
          return evDate.getTime() >= now.getTime();
        }
        return true;
      });
    }

    // 7. City Filter
    if (selectedCity) {
      list = list.filter(
        (e) =>
          (e.city ?? "").toLowerCase() === selectedCity.toLowerCase() ||
          e.location.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // 8. College Filter
    if (selectedCollege) {
      list = list.filter(
        (e) => (e.college ?? "").toLowerCase() === selectedCollege.toLowerCase()
      );
    }

    // 9. Sort: Latest, Popular, Upcoming, Registration Closing Soon
    if (sortBy === "popular") {
      list.sort((a, b) => b.registered - a.registered);
    } else if (sortBy === "upcoming") {
      list.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    } else if (sortBy === "closing") {
      list.sort((a, b) => {
        const timeA = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : 9999999999999;
        const timeB = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : 9999999999999;
        return timeA - timeB;
      });
    } else {
      // latest
      list.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    }

    return list;
  }, [
    allEvents,
    q,
    selectedCategory,
    selectedEventType,
    selectedMode,
    selectedPrice,
    selectedDate,
    selectedCity,
    selectedCollege,
    sortBy,
  ]);

  return (
    <PageShell>
      {/* Header */}
      <section className="pt-36 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-eyebrow text-muted-foreground mb-3">Explore & Register</p>
              <h1 className="text-section-title max-w-2xl">
                Every event, engineered to accelerate your tech journey.
              </h1>
            </div>
            <p className="text-lead max-w-md text-sm sm:text-base">
              Search by name, organizer, category, college, or tags. Instant registration & verified ticket passes.
            </p>
          </div>

          {/* Search + Controls Row */}
          <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 h-12 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by event name, organizer, category, college, tags..."
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-2 h-12 px-5 rounded-2xl border text-sm font-semibold transition-all shadow-sm ${
                filterOpen || activeFilterCount > 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              }`}
            >
              <SlidersHorizontal className="size-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="size-5 rounded-full bg-primary-foreground text-primary text-xs font-bold grid place-items-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 pl-4 pr-10 rounded-2xl border border-border bg-card text-sm font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-sm text-foreground"
              >
                <option value="latest">Sort: Latest</option>
                <option value="popular">Sort: Popular</option>
                <option value="upcoming">Sort: Upcoming</option>
                <option value="closing">Sort: Registration Closing Soon</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-4 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Categories Horizontal Scrolling Filter Chips */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const meta = categoryMeta[cat];
              const isSelected =
                (cat === "All" && !selectedCategory) || selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {meta?.icon && <span>{meta.icon}</span>}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Expanded Filter Panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-6 bg-card border border-border rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shadow-lg">
                  {/* Category Dropdown */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">All Categories (14)</option>
                      {categories
                        .filter((c) => c !== "All")
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Mode: Online / Offline */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Format / Mode
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        ["", "All"],
                        ["online", "Online"],
                        ["offline", "Offline"],
                        ["hybrid", "Hybrid"],
                      ].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setSelectedMode(val)}
                          className={`flex-1 h-10 rounded-xl border text-xs font-medium transition-all ${
                            selectedMode === val
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-background hover:bg-secondary text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fee: Free / Paid */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Registration Fee
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        ["", "All"],
                        ["free", "Free"],
                        ["paid", "Paid"],
                      ].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setSelectedPrice(val)}
                          className={`flex-1 h-10 rounded-xl border text-xs font-medium transition-all ${
                            selectedPrice === val
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-background hover:bg-secondary text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Event Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">Any Date</option>
                      <option value="today">Today</option>
                      <option value="weekend">This Weekend</option>
                      <option value="month">This Month</option>
                      <option value="upcoming">Upcoming Dates</option>
                    </select>
                  </div>

                  {/* City Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">All Cities</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* College Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      College / Institution
                    </label>
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">All Colleges</option>
                      {colleges.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Event Type
                    </label>
                    <select
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">All Event Types</option>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Button */}
                  <div className="flex items-end">
                    <button
                      onClick={clearAll}
                      className="w-full h-10 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter Pills */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  &ldquo;{q}&rdquo; <X className="size-3" />
                </button>
              )}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Category: {selectedCategory} <X className="size-3" />
                </button>
              )}
              {selectedEventType && (
                <button
                  onClick={() => setSelectedEventType("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Type: {selectedEventType} <X className="size-3" />
                </button>
              )}
              {selectedMode && (
                <button
                  onClick={() => setSelectedMode("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Mode: {selectedMode} <X className="size-3" />
                </button>
              )}
              {selectedPrice && (
                <button
                  onClick={() => setSelectedPrice("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Price: {selectedPrice} <X className="size-3" />
                </button>
              )}
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  Date: {selectedDate} <X className="size-3" />
                </button>
              )}
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  City: {selectedCity} <X className="size-3" />
                </button>
              )}
              {selectedCollege && (
                <button
                  onClick={() => setSelectedCollege("")}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                >
                  College: {selectedCollege} <X className="size-3" />
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground ml-1 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-border rounded-3xl p-14 text-center bg-card shadow-sm">
              <Search className="size-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold font-display text-foreground">
                No events match your selected filters
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                We couldn't find any events matching your query. Try resetting filters or searching with different keywords.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground font-medium">
                  Showing <span className="text-foreground font-bold">{filtered.length}</span> event
                  {filtered.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((e, i) => {
                  const favorited = isAuthenticated ? isFavorite(e.id) : false;
                  const alreadyReg = isAuthenticated && user ? isRegistered(e.id, user.id) : false;
                  const fillPct = Math.min(100, Math.round((e.registered / e.seats) * 100));

                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.04 }}
                    >
                      <div className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: e.slug }}
                          className="block flex-1 flex flex-col"
                        >
                          {/* 1. Cover Image & Badges */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                            <img
                              src={e.cover}
                              alt={e.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-black/20" />

                            {/* Top badges */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              {/* Category Badge */}
                              <span className="text-micro bg-background/90 backdrop-blur px-2.5 py-1 rounded-lg border border-border/80 font-semibold text-foreground">
                                {e.category}
                              </span>
                              {/* Event Type Badge */}
                              {e.eventType && (
                                <span className="text-micro bg-primary/90 text-primary-foreground font-semibold px-2.5 py-1 rounded-lg shadow-sm">
                                  {e.eventType}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                              {/* Online / Offline badge */}
                              <span
                                className={`text-micro font-semibold px-2.5 py-1 rounded-lg backdrop-blur shadow-sm ${
                                  e.mode === "Online"
                                    ? "bg-blue-500/90 text-white"
                                    : e.mode === "In-person"
                                    ? "bg-emerald-600/90 text-white"
                                    : "bg-purple-600/90 text-white"
                                }`}
                              >
                                {e.mode}
                              </span>

                              {alreadyReg && (
                                <span className="text-micro bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                  <CheckCircle2 className="size-2.5" /> Registered
                                </span>
                              )}
                            </div>

                            {/* Bottom Cover Info: Deadline pill */}
                            {e.registrationDeadline && (
                              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur border border-border text-amber-600 dark:text-amber-400">
                                <Clock className="size-3" />
                                <span>Deadline: {e.registrationDeadline}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Organizer Name & Logo Avatar */}
                              <div className="flex items-center gap-2 mb-2.5">
                                <div className="size-6 rounded-full bg-primary/20 text-primary font-bold text-[10px] grid place-items-center shrink-0">
                                  {e.host?.avatar ? (
                                    <img
                                      src={e.host.avatar}
                                      alt={e.host.name}
                                      className="size-full rounded-full object-cover"
                                    />
                                  ) : (
                                    e.host?.name ? e.host.name[0] : "O"
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground font-medium truncate">
                                  {e.host?.name || e.organizerName}
                                </span>
                                {e.college && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground truncate border border-border/60">
                                    🎓 {e.college}
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-base tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                                  {e.title}
                                </h3>
                                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                              </div>

                              {/* Description / Tagline */}
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                {e.tagline || e.about}
                              </p>

                              {/* Tags */}
                              {e.tags && e.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {e.tags.slice(0, 3).map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/80"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Date, Location, Fee, Capacity */}
                            <div className="mt-5 pt-4 border-t border-border/80 space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="size-3.5 text-primary" /> {e.dateLabel}
                                </span>
                                <span className="font-bold font-display text-sm text-foreground">
                                  {e.price === "Free" ? "Free" : e.price}
                                </span>
                              </div>

                              {/* Capacity Bar */}
                              <div>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                                  <span className="flex items-center gap-1">
                                    <Users className="size-3" />
                                    <span>
                                      {e.registered} / {e.seats} registered
                                    </span>
                                  </span>
                                  <span className="font-mono font-medium">{fillPct}%</span>
                                </div>
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      fillPct >= 90
                                        ? "bg-red-500"
                                        : fillPct >= 70
                                        ? "bg-amber-500"
                                        : "bg-primary"
                                    }`}
                                    style={{ width: `${fillPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>

                        {/* Student Favorite Button */}
                        {isAuthenticated && user?.role === "student" && (
                          <button
                            onClick={(ev) => {
                              ev.preventDefault();
                              toggleFavorite(e.id);
                            }}
                            className={`absolute top-3 right-16 p-2 rounded-xl border backdrop-blur transition-all ${
                              favorited
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-background/80 border-border text-muted-foreground hover:text-primary"
                            }`}
                            title={favorited ? "Remove from favorites" : "Save event"}
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
