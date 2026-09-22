import { Link } from "@/lib/router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { ArrowUpRight, Compass, Rocket, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Compass,
    title: "Craft over noise",
    body: "Every interaction is designed. Every default is opinionated. Every pixel earns its place.",
  },
  {
    icon: Rocket,
    title: "Engineered to scale",
    body: "From a 40-person meetup to a 10,000-person hackathon — the same tooling, the same reliability.",
  },
  {
    icon: Users,
    title: "Community first",
    body: "We build for organizers and participants — never the resale of their attention.",
  },
  {
    icon: Shield,
    title: "Quiet reliability",
    body: "Realtime capacity, waitlists, certificates, refunds — handled, so you can focus on the room.",
  },
];

const stats = [
  { value: "180+", label: "Cities", to: "/events" as const, hint: "Explore events across cities" },
  { value: "24k", label: "Achievers", to: "/dashboard" as const, hint: "Join participant community" },
  { value: "1.2k", label: "Igniters", to: "/organizer" as const, hint: "Meet verified organizers" },
  { value: "99.98%", label: "Uptime", to: "/events" as const, hint: "High-reliability platform" },
];

export default function AboutPage() {
  return (
    <PageShell variant="dark">
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--foreground)_18%,transparent),transparent_60%)]" />
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-eyebrow text-muted-foreground mb-6"
          >
            About Enginow Ignite
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-display max-w-4xl"
          >
            An operating system for the world's technical communities.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lead mt-8 max-w-2xl"
          >
            We build tools that let engineers, designers and organizers create events people actually
            remember — with the polish of a product launch and the intimacy of a room full of peers.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="bg-background p-8 group hover:bg-secondary/40 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="text-stat group-hover:text-primary transition-colors">{s.value}</div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
              <div className="text-caption mt-2 text-muted-foreground group-hover:text-foreground transition-colors">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="px-4 md:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-eyebrow text-primary font-semibold">— Core Philosophy</span>
            <h2 className="mt-3 text-section-title">Built with intention</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <v.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {v.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-16 p-8 md:p-12 rounded-3xl bg-secondary/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold font-display text-foreground">Want to join the movement?</h3>
              <p className="text-sm text-muted-foreground mt-1">Host your community event or discover high-impact hackathons today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/events"
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl hover:opacity-95 transition-opacity"
              >
                Explore Events
              </Link>
              <Link
                to="/organizer"
                className="px-5 py-2.5 bg-card border border-border text-foreground font-semibold text-xs sm:text-sm rounded-xl hover:bg-secondary transition-colors"
              >
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
