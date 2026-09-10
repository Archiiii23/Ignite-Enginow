import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stats = [
  { value: "500k+", label: "Participants" },
  { value: "12k", label: "Events Hosted" },
  { value: "85+", label: "Countries" },
  { value: "$2M+", label: "Prizes Distributed" },
];

export function Hero() {
  const target = new Date(Date.now() + 12 * 86400000 + 4 * 3600000);
  const { d, h, m, s } = useCountdown(target);

  return (
    <header className="relative pt-40 pb-28 overflow-hidden">
      {/* animated glow orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[520px] rounded-full bg-primary/25 blur-[140px] animate-float-slow" />
        <div
          className="absolute bottom-0 left-1/4 size-[320px] rounded-full bg-primary-glow/10 blur-[120px] animate-float-slow"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 size-[240px] rounded-full bg-primary/15 blur-[100px] animate-float-slow"
          style={{ animationDelay: "-7s" }}
        />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 backdrop-blur border border-foreground/10 text-eyebrow text-primary-glow mb-8"
          >
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
            </span>
            Next: Global AI Hackathon · {d}d {h.toString().padStart(2, "0")}h{" "}
            {m.toString().padStart(2, "0")}m {s.toString().padStart(2, "0")}s
          </motion.div>

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

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <button className="group inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95">
              Join Community
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center gap-2 bg-surface/60 backdrop-blur border border-foreground/10 px-6 py-3 rounded-xl font-medium hover:bg-surface transition-all active:scale-95">
              Explore Events
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border pt-10 w-full"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 items-start">
                <span className="text-stat">{stat.value}</span>
                <span className="text-eyebrow text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
