import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, Zap, ArrowRight, ShieldCheck, Trophy, Calendar, Users } from "lucide-react";

type Spark = { id: number; x: number; y: number; vx: number; vy: number; scale: number; color: string };

const STATUS_MESSAGES = [
  { at: 0, text: "Calibrating high-performance event engines...", tag: "SYS_INIT" },
  { at: 25, text: "Synchronizing 40+ hackathons, bootcamps & live workshops...", tag: "SYNC_EVENTS" },
  { at: 55, text: "Connecting creator ecosystem & verified attendee network...", tag: "NET_READY" },
  { at: 80, text: "Priming ignition core for real-time collaboration...", tag: "IGNITE_CORE" },
  { at: 100, text: "Ignition sequence complete • Welcome to Enginow Ignite!", tag: "LAUNCH_READY" },
];

const SPARK_COLORS = ["#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#fbbf24"];

/** Launch target date reference */
export const LAUNCH_AT = Date.UTC(2026, 7, 31, 18, 30, 0);

export function ComingSoonGate({ children }: { children: ReactNode }) {
  // Check if countdown target is in the future
  const isFutureLaunch = Date.now() < LAUNCH_AT;

  // Track whether the intro overlay is active
  const [isActive, setIsActive] = useState(true);
  const [charge, setCharge] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);
  const startTime = useRef<number | null>(null);

  // Auto-progress charge on mount (2.2 seconds duration)
  useEffect(() => {
    if (!isActive) return;

    startTime.current = Date.now();
    const duration = 2200; // 2.2s cinematic intro

    const interval = setInterval(() => {
      if (!startTime.current) return;
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setCharge((prev) => Math.max(prev, pct));

      if (pct >= 100) {
        clearInterval(interval);
        // Small delay at 100% for satisfying visual feedback before smooth exit
        setTimeout(() => {
          setIsActive(false);
        }, 350);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isActive]);

  // Lock body scroll while intro is visible
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  // Interactive tap / click anywhere on the core generates tactile sparks & accelerates charge
  const handleTapCore = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const count = 12;
    const batch: Spark[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        id: sparkId.current++,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        scale: 0.7 + Math.random() * 0.8,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      };
    });

    setSparks((s) => [...s.slice(-40), ...batch]);
    // Boost charge by 20% on tap for responsive satisfaction
    setCharge((c) => {
      const next = Math.min(100, c + 20);
      if (next >= 100) {
        setTimeout(() => setIsActive(false), 250);
      }
      return next;
    });

    setTimeout(() => {
      setSparks((s) => s.filter((sp) => !batch.some((b) => b.id === sp.id)));
    }, 800);
  }, []);

  const handleSkip = useCallback(() => {
    setIsActive(false);
  }, []);

  const currentStatus =
    [...STATUS_MESSAGES].reverse().find((m) => charge >= m.at) ?? STATUS_MESSAGES[0];

  return (
    <div className="relative min-h-screen">
      {/* Underlying app content */}
      <div
        className={`transition-all duration-700 ease-out ${
          isActive
            ? "pointer-events-none select-none blur-[10px] scale-[0.99] opacity-25 saturate-50"
            : "blur-0 scale-100 opacity-100 saturate-100"
        }`}
      >
        {children}
      </div>

      {/* Intro / Preloader Splash Gateway */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.04,
              filter: "blur(14px)",
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            }}
            className="theme-dark fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#07070a]/95 backdrop-blur-3xl px-4 py-8 select-none"
          >
            {/* Dynamic ambient energy glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/35 via-rose-500/20 to-transparent blur-[140px] animate-pulse"
              style={{ animationDuration: "4s" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-36 left-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[120px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/3 right-10 h-[22rem] w-[22rem] rounded-full bg-purple-600/15 blur-[130px]"
            />

            {/* Subtle tech background grid lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
            />

            {/* Quick Skip button in corner */}
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              type="button"
              onClick={handleSkip}
              className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Skip intro
              <ArrowRight className="size-3.5" />
            </motion.button>

            {/* Main Stage Card */}
            <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
              {/* Brand Pill Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 px-4 py-1.5 shadow-[0_0_24px_rgba(234,88,12,0.15)] backdrop-blur-xl"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-foreground/90 font-display">
                  ENGINOW IGNITE
                </span>
                <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30">
                  v2.0
                </span>
              </motion.div>

              {/* Title & Tagline */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-5 sm:mt-6"
              >
                Ignite Ideas.{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Build Communities.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans"
              >
                The premier launchpad for hackathons, engineering summits, and creator-led tech events.
              </motion.p>

              {/* Centerpiece: The Animated Ignition Reactor Core */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15, type: "spring", stiffness: 200 }}
                className="relative my-7 sm:my-8 flex items-center justify-center"
              >
                {/* Outer rotating dashed orbital ring */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full border border-dashed border-primary/25 animate-[spin_24s_linear_infinite]"
                />

                {/* Counter-rotating accent ring */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full border border-dotted border-amber-500/30 animate-[spin_16s_linear_infinite_reverse]"
                />

                {/* Pulsing energy field */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-gradient-to-tr from-amber-500/30 via-primary/30 to-rose-500/20 blur-2xl animate-pulse"
                />

                {/* Interactive Ignition Button / Reactor */}
                <button
                  type="button"
                  onClick={handleTapCore}
                  aria-label="Tap to accelerate ignition"
                  className="group relative flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-[#181822]/90 to-[#0d0d14]/90 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
                >
                  {/* Circular Fill Mask */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-primary/30 via-amber-500/25 to-transparent transition-all duration-200"
                    style={{
                      clipPath: `inset(${100 - charge}% 0 0 0)`,
                    }}
                  />

                  {/* Flame Core Glow */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <Flame className="size-8 sm:size-9 text-amber-400 animate-pulse transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
                      <Sparkles className="absolute -top-1 -right-2 size-3.5 text-amber-200 animate-bounce" />
                    </div>
                    <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                      {charge}%
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/90 font-medium">
                      {charge >= 100 ? "LAUNCHING" : "IGNITING"}
                    </span>
                  </div>

                  {/* Click burst sparks */}
                  {sparks.map((s) => (
                    <span
                      key={s.id}
                      aria-hidden="true"
                      className="pointer-events-none absolute h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] animate-fade-out"
                      style={{
                        left: s.x,
                        top: s.y,
                        backgroundColor: s.color,
                        color: s.color,
                        transform: `scale(${s.scale})`,
                      }}
                    />
                  ))}
                </button>
              </motion.div>

              {/* Progress Bar & Status Diagnostic */}
              <div className="w-full max-w-md">
                {/* Status Ticker */}
                <div className="flex items-center justify-between text-xs font-mono mb-2 px-1">
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold truncate max-w-[280px] sm:max-w-none">
                    <Zap className="size-3 shrink-0 animate-pulse" />
                    {currentStatus.text}
                  </span>
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider shrink-0">
                    {currentStatus.tag}
                  </span>
                </div>

                {/* Progress Track */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10 p-[1px] shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary transition-all duration-150 relative shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    style={{ width: `${charge}%` }}
                  >
                    {/* Glowing Leading Edge */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-white blur-[2px]" />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>TAP CORE TO BOOST</span>
                  <span>{charge < 100 ? "INITIALIZING..." : "READY TO ENTER"}</span>
                </div>
              </div>

              {/* Key Platform Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg"
              >
                {[
                  { icon: Calendar, label: "Live Events", value: "40+" },
                  { icon: Users, label: "Innovators", value: "12,000+" },
                  { icon: Trophy, label: "Prize Pools", value: "₹25L+" },
                  { icon: ShieldCheck, label: "Verified Hub", value: "100%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] py-2.5 px-2 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <stat.icon className="size-3.5 text-primary/80 mb-1" />
                    <span className="font-display text-sm font-bold text-white">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Immediate Enter Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(234,88,12,0.35)] transition-all duration-200 hover:shadow-[0_0_35px_rgba(234,88,12,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Enter Platform Now</span>
                  <ArrowRight className="size-4" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
