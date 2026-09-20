import { useRef } from "react";
import { useGSAPScrollTrigger } from "@/animations/scrollAnimations";
import { ScrollReveal } from "./ScrollReveal";
import {
  Search,
  Ticket,
  Users2,
  CalendarCheck,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const capabilities = [
  {
    step: "01",
    tag: "Discovery",
    title: "Deep Semantic Event Discovery",
    desc: "Find hackathons, conferences, and technical workshops using intelligent taxonomy filters, prize thresholds, and formats.",
    icon: Search,
    color: "from-violet-500/20 via-violet-500/5 to-transparent",
    border: "border-violet-500/30",
    badge: "bg-violet-500/10 text-violet-500",
    to: "/events" as const,
  },
  {
    step: "02",
    tag: "Participation",
    title: "Instant QR Passes & Wallet Sync",
    desc: "Register in one click. Receive cryptographic ticket codes with assigned seating and instant Apple/Google Calendar sync.",
    icon: Ticket,
    color: "from-blue-500/20 via-blue-500/5 to-transparent",
    border: "border-blue-500/30",
    badge: "bg-blue-500/10 text-blue-500",
    to: "/events" as const,
  },
  {
    step: "03",
    tag: "Collaboration",
    title: "Cross-Disciplinary Team Matchmaking",
    desc: "Connect with frontend engineers, AI researchers, and designers. Build balanced squads for competitive hackathons.",
    icon: Users2,
    color: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-500",
    to: "/events" as const,
  },
  {
    step: "04",
    tag: "Execution",
    title: "Organizer Command Suite",
    desc: "Control custom registration questions, manage check-in counters with live QR scanning, and coordinate judges in real time.",
    icon: CalendarCheck,
    color: "from-amber-500/20 via-amber-500/5 to-transparent",
    border: "border-amber-500/30",
    badge: "bg-amber-500/10 text-amber-500",
    to: "/organizer" as const,
  },
  {
    step: "05",
    tag: "Credentialing",
    title: "Verifiable Proof of Skill",
    desc: "Earn tamper-proof digital certificates and badges stored on your profile to showcase to engineering recruiters.",
    icon: Award,
    color: "from-rose-500/20 via-rose-500/5 to-transparent",
    border: "border-rose-500/30",
    badge: "bg-rose-500/10 text-rose-500",
    to: "/dashboard" as const,
  },
  {
    step: "06",
    tag: "Impact",
    title: "Direct Industry Hiring Pipeline",
    desc: "Leading tech enterprises scout top performers directly from event leaderboards and hackathon project submissions.",
    icon: TrendingUp,
    color: "from-primary/20 via-primary/5 to-transparent",
    border: "border-primary/30",
    badge: "bg-primary/10 text-primary",
    to: "/careers" as const,
  },
];

export function HorizontalStorySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const containerRef = useGSAPScrollTrigger((ctx, ScrollTrigger) => {
    // Only run pinned horizontal sequence on screens >= 768px
    if (window.innerWidth < 768 || !trackRef.current || !containerRef.current) return;

    const track = trackRef.current;
    const totalScroll = track.scrollWidth - window.innerWidth + 120;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: () => `+=${totalScroll}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const x = -self.progress * totalScroll;
        track.style.transform = `translateX(${x}px)`;
        if (progressRef.current) {
          progressRef.current.style.width = `${self.progress * 100}%`;
        }
      },
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="horizontal-story-wrapper relative bg-background border-t border-border overflow-hidden py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <ScrollReveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="size-3.5" />
            Platform Capabilities
          </div>
          <h2 className="text-section-title">
            The Complete Engineering Event Lifecycle
          </h2>
          <p className="mt-3 text-lead text-muted-foreground text-sm sm:text-base">
            Scroll to tour the technical architecture engineered to host events from first discovery to long-term career impact.
          </p>
        </ScrollReveal>

        {/* Minimal Desktop Progress Track Indicator */}
        <div className="hidden md:block mt-8 h-1 w-full max-w-xs bg-muted rounded-full overflow-hidden">
          <div ref={progressRef} className="h-full bg-primary rounded-full transition-none w-0" />
        </div>
      </div>

      {/* Horizontal Cards Track */}
      <div className="w-full overflow-x-auto md:overflow-visible no-scrollbar px-6">
        <div
          ref={trackRef}
          className="flex gap-6 pb-6 md:pb-0 md:will-change-transform"
          style={{ width: "max-content" }}
        >
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.step}
                to={c.to}
                className="block shrink-0 cursor-pointer"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className={`w-[320px] sm:w-[380px] md:w-[420px] bg-card/80 backdrop-blur-xl border ${c.border} hover:border-primary/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group h-full`}
                >
                  <div
                    className={`absolute -top-10 -right-10 size-40 bg-gradient-to-br ${c.color} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-2xl font-bold tracking-tight text-foreground/30 group-hover:text-primary transition-colors">
                        {c.step}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border border-current/20 ${c.badge}`}>
                        {c.tag}
                      </span>
                    </div>

                    <div className={`size-12 rounded-2xl ${c.badge} border border-current/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="size-6" />
                    </div>

                    <h3 className="text-xl font-display font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>

                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
                      Explore {c.tag} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">
                      Enginow Standard
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
