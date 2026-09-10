import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Spark = { id: number; x: number; y: number; scale: number };

const TIERS = [
  { at: 0, label: "Cold start", teaser: "Tap the core to charge the launch." },
  { at: 25, label: "Warming up", teaser: "Unlocked: 40+ hackathons, workshops & webinars incoming." },
  { at: 50, label: "Heating", teaser: "Unlocked: Igniter tools — run an event end to end." },
  { at: 75, label: "Critical", teaser: "Unlocked: Achiever profiles, tickets & certificates." },
  { at: 100, label: "Ignited", teaser: "You ignited the core. See you on 15 August, 11:00 AM IST." },
];

const STORAGE_KEY = "ignite-best-charge";

function IgniteGame() {
  const [charge, setCharge] = useState(0);
  const [taps, setTaps] = useState(0);
  const [best, setBest] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    if (!Number.isNaN(stored)) setBest(stored);
  }, []);

  // Charge slowly cools down so it stays a game, not a click counter.
  useEffect(() => {
    const id = setInterval(() => setCharge((c) => (c >= 100 ? c : Math.max(0, c - 1))), 260);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (charge > best) {
      setBest(charge);
      window.localStorage.setItem(STORAGE_KEY, String(charge));
    }
  }, [charge, best]);

  const tier = [...TIERS].reverse().find((t) => charge >= t.at) ?? TIERS[0];
  const ignited = charge >= 100;

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const batch = Array.from({ length: 5 }, () => ({
      id: sparkId.current++,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      scale: 0.6 + Math.random() * 0.9,
    }));
    setSparks((s) => [...s.slice(-30), ...batch]);
    setTaps((t) => t + 1);
    setCharge((c) => Math.min(100, c + 7));
    window.setTimeout(() => {
      setSparks((s) => s.filter((sp) => !batch.some((b) => b.id === sp.id)));
    }, 700);
  }, []);

  return (
    <div className="mt-8 sm:mt-12">
      <button
        type="button"
        onClick={handleTap}
        aria-label="Tap to charge the launch core"
        className="group relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card/60 backdrop-blur-sm transition-transform duration-150 hover:scale-105 active:scale-95 sm:h-36 sm:w-36"
        style={{
          boxShadow: `0 0 ${12 + charge * 0.7}px color-mix(in oklab, var(--primary) ${Math.round(20 + charge * 0.6)}%, transparent)`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary/30 transition-all duration-300"
          style={{ clipPath: `inset(${100 - charge}% 0 0 0)` }}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-4 rounded-full bg-primary/40 blur-xl transition-opacity duration-300 sm:inset-6 ${ignited ? "animate-pulse opacity-100" : "opacity-60"}`}
        />
        <span className="relative text-stat text-3xl font-semibold text-foreground sm:text-4xl">
          {charge}%
        </span>
        {sparks.map((s) => (
          <span
            key={s.id}
            aria-hidden="true"
            className="pointer-events-none absolute h-1.5 w-1.5 animate-fade-out rounded-full bg-primary"
            style={{ left: s.x, top: s.y, transform: `scale(${s.scale})` }}
          />
        ))}
      </button>

      <div className="mx-auto mt-5 w-full max-w-md sm:mt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="text-eyebrow min-w-0 truncate text-foreground">{tier.label}</span>
          <span className="text-micro shrink-0 uppercase text-muted-foreground">
            {taps} taps · best {best}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${charge}%` }}
          />
        </div>
        <p className="text-caption mt-3 min-h-[3rem] text-balance text-muted-foreground sm:mt-4 sm:min-h-[2.5rem]">
          {tier.teaser}
        </p>
      </div>
    </div>
  );
}

/** Launch: 31 August 2026, 11:59 PM IST (18:30 UTC) */
export const LAUNCH_AT = Date.UTC(2026, 7, 31, 18, 30, 0);

function useCountdown(target: number, active: boolean) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  const diff = now === null ? null : Math.max(0, target - now);
  const fmt = (v: number) => (diff === null ? "--" : String(v).padStart(2, "0"));
  return {
    days: diff === null ? "--" : String(Math.floor(diff / 86_400_000)),
    hours: fmt(Math.floor(((diff ?? 0) / 3_600_000) % 24)),
    minutes: fmt(Math.floor(((diff ?? 0) / 60_000) % 60)),
    seconds: fmt(Math.floor(((diff ?? 0) / 1000) % 60)),
  };
}

export function ComingSoonGate({ children }: { children: ReactNode }) {
  // Locked by default so no content is exposed before hydration.
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const tick = () => setLocked(Date.now() < LAUNCH_AT);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = useCountdown(LAUNCH_AT, locked);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);

  if (!locked) return <>{children}</>;

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        inert={"" as unknown as boolean}
        className="pointer-events-none select-none blur-[14px] saturate-[0.85] opacity-40"
      >
        {children}
      </div>

      <div className="theme-dark fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overflow-x-hidden bg-background/85 px-4 py-10 backdrop-blur-2xl sm:items-center sm:px-6 sm:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] sm:h-[36rem] sm:w-[36rem]"
        />
        <div className="relative my-auto w-full max-w-2xl text-center">
          <span className="text-eyebrow inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-foreground sm:px-4">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
            Coming soon
          </span>

          <h1 className="text-display mt-6 text-foreground sm:mt-8">Enginow Ignite</h1>

          <p className="text-lead mx-auto mt-4 max-w-lg sm:mt-5">
            We&apos;re putting the finishing touches on the platform. Everything goes live by
            <span className="text-foreground"> 31 August, 11:59 PM IST</span>.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
            {units.map((u) => (
              <div
                key={u.label}
                className="rounded-2xl border border-border/60 bg-card/60 px-2 py-4 backdrop-blur-sm sm:py-5"
              >
                <div className="text-stat text-2xl font-semibold text-foreground sm:text-4xl">
                  {String(u.value).padStart(2, "0")}
                </div>
                <div className="text-micro mt-1.5 uppercase text-muted-foreground sm:mt-2">
                  {u.label}
                </div>
              </div>
            ))}
          </div>

          <IgniteGame />

        </div>
      </div>
    </div>
  );
}
