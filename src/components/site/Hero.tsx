import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "@/lib/router";
import { fadeUp } from "@/animations/motionVariants";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

const stats = [
  { value: "500k+", label: "Participants", to: "/events" as const },
  { value: "12k+", label: "Events Hosted", to: "/events" as const },
  { value: "85+", label: "Countries", to: "/about" as const },
  { value: "$2M+", label: "Prizes Distributed", to: "/events" as const },
];

const suggestions = [
  "Hackathon",
  "AI Workshop",
  "React Bootcamp",
  "DevFest",
  "UI/UX Webinar",
  "Data Science",
];

export function Hero() {
  const target = new Date(Date.now() + 12 * 86400000 + 4 * 3600000);
  const { d, h, m, s } = useCountdown(target);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const isReduced = getPrefersReducedMotion();

  // Scroll parallax for background layers
  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 800], [0, -120]);
  const orb2Y = useTransform(scrollY, [0, 800], [0, -60]);
  const contentY = useTransform(scrollY, [0, 800], [0, 80]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0.4]);

  const handleSearch = (q: string = query) => {
    if (!q.trim()) {
      navigate({ to: "/events" });
    } else {
      navigate({ to: "/events", search: { q: q.trim() } as Record<string, string> });
    }
  };

  return (
    <header ref={headerRef} className="relative pt-40 pb-28 overflow-hidden">
      {/* Parallax Glow Orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          style={{ y: isReduced ? 0 : orb1Y }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[520px] rounded-full bg-primary/20 blur-[140px]"
        />
        <motion.div
          style={{ y: isReduced ? 0 : orb2Y }}
          className="absolute bottom-0 left-1/4 size-[320px] rounded-full bg-primary-glow/15 blur-[120px]"
        />
        <div
          className="absolute top-1/2 right-1/4 size-[260px] rounded-full bg-primary/15 blur-[100px] animate-float-slow"
          style={{ animationDelay: "-7s" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        style={{ y: isReduced ? 0 : contentY, opacity: isReduced ? 1 : opacity }}
        className="relative max-w-5xl mx-auto px-6"
      >
        <div className="flex flex-col items-center text-center">
          {/* Top Live Countdown Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            whileHover={{ scale: 1.03 }}
            className="mb-8"
          >
            <Link
              to="/events"
              search={{ q: "Global AI" } as Record<string, string>}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 backdrop-blur border border-primary/25 text-eyebrow text-primary font-semibold shadow-sm hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
              title="Click to view the Global AI Hackathon"
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-primary" />
              </span>
              <span>
                Next: Global AI Hackathon · {d}d {h.toString().padStart(2, "0")}h{" "}
                {m.toString().padStart(2, "0")}m {s.toString().padStart(2, "0")}s
              </span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-display text-balance"
          >
            Ignite Ideas.{" "}
            <span className="text-muted-foreground">Build Communities.</span>{" "}
            <span className="text-gradient-brand">Create Impact.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-7 text-lead max-w-[60ch]"
          >
            The premium platform for technical communities to host hackathons, workshops, and
            high-impact conferences. Engineered for creators who value scale and speed.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 w-full max-w-2xl"
          >
            <div
              className={`relative flex items-center bg-card border rounded-2xl shadow-lg transition-all duration-300 ${
                focused
                  ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                  : "border-border"
              }`}
            >
              <Search className="size-5 text-muted-foreground ml-5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search hackathons, workshops, cities..."
                className="flex-1 bg-transparent text-base px-4 py-4 focus:outline-none placeholder:text-muted-foreground"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSearch()}
                className="mr-2 h-10 px-5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_16px_-4px_var(--primary-glow)]"
              >
                Search
              </motion.button>
            </div>

            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* CTA Action Buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-8 flex flex-col sm:flex-row gap-3.5"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/auth"
                className="group inline-flex items-center justify-center gap-2 bg-secondary text-foreground border border-border px-6 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-all shadow-sm text-sm"
              >
                Join Community
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-[0_0_30px_-6px_var(--primary-glow)] px-6 py-3 rounded-xl font-medium hover:opacity-95 transition-all text-sm"
              >
                Explore Events
              </Link>
            </motion.div>
          </motion.div>

          {/* Key Stats Bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border pt-10 w-full"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={stat.to}
                  className="group flex flex-col gap-1 items-start cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-stat group-hover:text-primary transition-colors">{stat.value}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
                  <span className="text-eyebrow text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
