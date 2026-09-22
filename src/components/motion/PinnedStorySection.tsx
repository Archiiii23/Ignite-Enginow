import { useState } from "react";
import { Link } from "@/lib/router";
import { useGSAPScrollTrigger } from "@/animations/scrollAnimations";
import {
  Compass,
  UserCheck,
  PlusCircle,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const storySteps = [
  {
    step: "01",
    role: "Student",
    roleBadgeClass: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    title: "Discover Opportunities",
    desc: "Explore hackathons, workshops, and conferences tailored to your technical skills. Filter by format, prize pool, or track.",
    icon: Compass,
    highlights: ["500k+ Active Participants", "AI & Custom Filters", "Instant Proof of Skill"],
    to: "/events",
    ctaLabel: "Explore Opportunities",
  },
  {
    step: "02",
    role: "Student",
    roleBadgeClass: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    title: "One-Click Registration & Tickets",
    desc: "Claim your pass or join a team in seconds. Receive instant QR tickets and live calendar synced reminders.",
    icon: UserCheck,
    highlights: ["Team Matchmaker", "Instant QR Pass", "Integrated Schedule"],
    to: "/events",
    ctaLabel: "Browse Passes & Tickets",
  },
  {
    step: "03",
    role: "Organizer",
    roleBadgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    title: "Create & Launch Events",
    desc: "Build custom event pages, configure custom tracks, set submission guidelines, and publish in minutes.",
    icon: PlusCircle,
    highlights: ["Custom Landing Pages", "Flexible Tracks", "Sponsor Showcase"],
    to: "/organizer",
    ctaLabel: "Launch Organizer Studio",
  },
  {
    step: "04",
    role: "Admin",
    roleBadgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    title: "Instant Verification & Approval",
    desc: "Administrators inspect submitted events, verify organizer credentials, and publish directly to the global ecosystem.",
    icon: ShieldCheck,
    highlights: ["Verification Queue", "Compliance Checks", "Ecosystem Moderation"],
    to: "/admin",
    ctaLabel: "Access Admin Verification",
  },
  {
    step: "05",
    role: "Organizer",
    roleBadgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    title: "Manage Attendees & Submissions",
    desc: "Track live registrations, check-in attendees via QR codes, assign judges, and evaluate project submissions in real time.",
    icon: LayoutDashboard,
    highlights: ["Live QR Check-in", "Automated Judging", "Participant Broadcasts"],
    to: "/organizer",
    ctaLabel: "Manage Attendees & Live QR",
  },
  {
    step: "06",
    role: "Admin & Organizer",
    roleBadgeClass: "bg-primary/10 text-primary border-primary/20",
    title: "Analytics & Career Impact",
    desc: "Measure attendee engagement, export analytics reports, issue verifiable certificates, and pipeline top talent.",
    icon: BarChart3,
    highlights: ["Deep Analytics", "Verifiable Certificates", "Direct Talent Highway"],
    to: "/dashboard",
    ctaLabel: "View Analytics & Certificates",
  },
];

export function PinnedStorySection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const containerRef = useGSAPScrollTrigger((ctx, ScrollTrigger) => {
    if (!containerRef.current) return;
    const totalSteps = storySteps.length;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${totalSteps * 90}%`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const step = Math.min(
          totalSteps - 1,
          Math.floor(self.progress * totalSteps)
        );
        setActiveStepIndex(step);
      },
    });
  }, []);

  const activeStep = storySteps[activeStepIndex];

  return (
    <div ref={containerRef} className="pinned-story-wrapper relative bg-background border-t border-border overflow-hidden">
      <div className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-eyebrow text-primary font-semibold tracking-wider">
            — The Engine Lifecycle
          </span>
          <h2 className="mt-2 text-section-title">
            How Ignite Enginow powers the ecosystem
          </h2>
          <p className="mt-3 text-lead text-muted-foreground text-sm sm:text-base">
            From initial event discovery to administrator verification and real-time analytics.
          </p>
        </div>

        {/* Story Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {/* Progress Bar (Left Desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-3 border-r border-border/50 pr-0 lg:pr-8">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Workflow Sequence
            </span>

            {storySteps.map((s, idx) => {
              const isActive = idx === activeStepIndex;
              const Icon = s.icon;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all duration-300 border ${
                    isActive
                      ? "bg-primary/10 border-primary/40 text-foreground shadow-md translate-x-1"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className={`size-9 rounded-xl grid place-items-center font-mono text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{s.title}</div>
                    <div className="text-[10px] text-muted-foreground">{s.role}</div>
                  </div>
                  <Icon className={`size-4 shrink-0 transition-opacity ${isActive ? "opacity-100 text-primary" : "opacity-40"}`} />
                </button>
              );
            })}
          </div>

          {/* Active Step Story View (Right Desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[340px] pl-0 lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${activeStep.roleBadgeClass}`}
                  >
                    Role: {activeStep.role}
                  </span>
                  <span className="font-mono text-sm font-bold text-muted-foreground">
                    Step {activeStep.step} of 0{storySteps.length}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground">
                    {activeStep.title}
                  </h3>
                  <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                    {activeStep.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/40">
                  {activeStep.highlights.map((item) => (
                    <Link
                      key={item}
                      to={activeStep.to}
                      className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border/50 text-xs font-medium text-foreground hover:bg-secondary/80 hover:border-primary/30 transition-all cursor-pointer group/pill"
                    >
                      <CheckCircle2 className="size-4 text-primary shrink-0 group-hover/pill:scale-110 transition-transform" />
                      <span className="group-hover/pill:text-primary transition-colors truncate">{item}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={activeStep.to}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:opacity-95 transition-all shadow-[0_0_20px_-4px_var(--primary-glow)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>{activeStep.ctaLabel}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">
                    Direct access for {activeStep.role}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Scroll Indicator Footer */}
            <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-4">
              <span>Scroll down to advance narrative</span>
              <div className="flex items-center gap-1.5">
                {storySteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStepIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
