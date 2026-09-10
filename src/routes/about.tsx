import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { ArrowUpRight, Compass, Rocket, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: pageMeta({
      title: "About",
      description:
        "Enginow Ignite is the premium platform for hackathons, workshops, webinars and community events — built by engineers, for engineers.",
      socialDescription:
        "Learn about the team, mission and craft behind Enginow Ignite — the operating system for technical communities.",
      path: "/about",
    }),
    links: canonical("/about"),
  }),
  component: AboutPage,
});

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
  { value: "180+", label: "Cities" },
  { value: "24k", label: "Achievers" },
  { value: "1.2k", label: "Igniters" },
  { value: "99.98%", label: "Uptime" },
];

function AboutPage() {
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
            <div key={s.label} className="bg-background p-8">
              <div className="text-stat">{s.value}</div>
              <div className="text-caption mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
