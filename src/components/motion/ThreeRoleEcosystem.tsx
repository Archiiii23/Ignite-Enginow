import { motion } from "framer-motion";
import { GraduationCap, Briefcase, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";
import { ScrollReveal } from "./ScrollReveal";

const roles = [
  {
    role: "Participant / Achiever",
    title: "Discover & Excel",
    desc: "Browse hackathons, register in one click, build project proof-of-work, and unlock career opportunities.",
    icon: GraduationCap,
    badge: "Student",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    badgeBg: "bg-violet-500/10 text-violet-500",
    to: "/events" as const,
    actions: [
      { label: "Discover Events", to: "/events" as const },
      { label: "Build Portfolio", to: "/dashboard" as const },
      { label: "Win Prizes", to: "/events" as const },
    ],
  },
  {
    role: "Organizer / Igniter",
    title: "Create & Scale",
    desc: "Design event portals, collect registrations, handle QR check-ins, automate judging, and publish results.",
    icon: Briefcase,
    badge: "Organizer",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    badgeBg: "bg-amber-500/10 text-amber-500",
    to: "/organizer" as const,
    actions: [
      { label: "Publish Events", to: "/organizer" as const },
      { label: "QR Check-in", to: "/organizer" as const },
      { label: "Live Analytics", to: "/organizer" as const },
    ],
  },
  {
    role: "Administrator",
    title: "Verify & Govern",
    desc: "Approve submitted events, verify organizer credentials, moderate ecosystem content, and ensure quality.",
    icon: ShieldCheck,
    badge: "Admin",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
    badgeBg: "bg-rose-500/10 text-rose-500",
    to: "/admin" as const,
    actions: [
      { label: "Verify Credential", to: "/admin" as const },
      { label: "Event Approval", to: "/admin" as const },
      { label: "Platform Moderation", to: "/admin" as const },
    ],
  },
];

export function ThreeRoleEcosystem() {
  return (
    <section className="py-28 md:py-36 bg-background relative overflow-hidden border-t border-border">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-eyebrow text-primary font-semibold tracking-wider">
            — Three Roles, One Ecosystem
          </span>
          <h2 className="mt-3 text-section-title">
            Unified for seamless collaboration
          </h2>
          <p className="mt-4 text-lead text-muted-foreground text-sm sm:text-base">
            Engineered so Students, Organizers, and Administrators seamlessly connect to create world-class technical events.
          </p>
        </ScrollReveal>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <ScrollReveal key={r.role} delay={i * 0.1} direction="up">
                <Link
                  to={r.to}
                  className="block h-full cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.015 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full bg-card/80 backdrop-blur-xl border ${r.border} hover:border-primary/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 size-36 bg-gradient-to-br ${r.color} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${r.badgeBg} border border-current/20 group-hover:scale-110 transition-transform`}>
                          <Icon className="size-6" />
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.badgeBg}`}>
                          {r.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {r.desc}
                      </p>

                      <div className="mt-6 flex flex-col gap-2">
                        {r.actions.map((act) => (
                          <div
                            key={act.label}
                            onClick={(e) => {
                              // allow bubbling to parent Link or direct navigation
                            }}
                            className="flex items-center justify-between text-xs font-medium text-foreground/80 bg-secondary/50 hover:bg-secondary/80 hover:text-foreground px-3 py-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="size-3 text-primary shrink-0" />
                              <span>{act.label}</span>
                            </div>
                            <ArrowRight className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border/40">
                      <span
                        className="inline-flex items-center gap-2 text-xs font-semibold text-primary group-hover:underline group-hover:translate-x-1 transition-transform"
                      >
                        Explore {r.badge} Portal <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Ecosystem Convergence Banner */}
        <ScrollReveal delay={0.3} className="mt-14">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 rounded-3xl p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Convergence</span>
              <h4 className="text-lg font-display font-semibold text-foreground mt-1">
                Participant + Organizer + Admin = Ignite Enginow
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                All roles sync in real time through shared event stores and notification pipelines.
              </p>
            </div>
            <Link
              to="/events"
              className="shrink-0 h-11 px-6 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_-4px_var(--primary-glow)] flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              Get Started Now <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
