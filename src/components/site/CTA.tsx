import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function CTA() {
  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal className="relative max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden p-12 md:p-20 text-center border border-primary/25 bg-gradient-to-b from-primary/15 via-primary/5 to-card shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.25)]">
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_65%)] animate-pulse-slow" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <span className="text-eyebrow text-primary font-semibold tracking-wider uppercase mb-3 inline-block">
          Discover. Create. Connect. Manage.
        </span>

        <h2 className="text-section-title text-balance">
          Ready to ignite your <span className="text-gradient-brand">next event?</span>
        </h2>
        <p className="mt-6 text-lead max-w-[46ch] mx-auto text-muted-foreground">
          Join half a million builders, organizers, and ecosystem leaders powering hackathons, bootcamps, and workshops worldwide.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-3.5">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/auth"
              className="inline-block bg-primary text-primary-foreground shadow-[0_0_30px_-6px_var(--primary-glow)] px-8 py-4 rounded-xl font-semibold text-sm hover:opacity-95 transition-all"
            >
              Host Your First Event
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/events"
              className="inline-block bg-secondary border border-border text-foreground px-8 py-4 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-all shadow-sm"
            >
              Explore Ecosystem
            </Link>
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  );
}
