import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

const items = [
  { date: "OCT 20", title: "Project Pitch Day", meta: "Webinar · Open to all", active: true, step: "Participate" },
  { date: "OCT 25", title: "Rust Conf '26", meta: "Conference · Berlin", active: false, step: "Explore" },
  { date: "NOV 01", title: "Global FinTech AI", meta: "Hackathon · Remote", active: true, step: "Register" },
  { date: "NOV 12", title: "Web3 Builder Meet", meta: "Meetup · Tokyo", active: false, step: "Network" },
  { date: "NOV 18", title: "Ignite Demo Day", meta: "Showcase · Virtual", active: true, step: "Pitch" },
  { date: "NOV 24", title: "Design Systems Live", meta: "Workshop · NYC", active: false, step: "Learn" },
  { date: "DEC 02", title: "Open Source Summit", meta: "Conference · Remote", active: true, step: "Contribute" },
];

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = getPrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const translateX = useTransform(scrollYProgress, [0, 1], [0, -140]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 overflow-hidden border-t border-border bg-card/20">
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <ScrollReveal>
          <span className="text-eyebrow text-primary font-semibold">
            — Scene 3: Participate & Pipeline
          </span>
          <h2 className="mt-3 text-section-title">Upcoming event timeline</h2>
          <p className="mt-3 text-lead max-w-[50ch]">
            Track community hackathons, demo days, and global keynotes as they unfold across the calendar.
          </p>
        </ScrollReveal>
      </div>

      <div className="mask-fade-right overflow-x-auto scrollbar-none pb-6 cursor-grab active:cursor-grabbing">
        <motion.div
          style={{ x: isReduced ? 0 : translateX }}
          className="flex gap-0 px-6 min-w-max"
        >
          {items.map((it, i) => (
            <ScrollReveal key={it.title} delay={i * 0.05} direction="right">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className={`w-72 border-t border-border/80 pt-8 pr-12 relative ${
                  it.active ? "" : "opacity-60"
                }`}
              >
                <div
                  className={`absolute -top-1.5 left-0 size-3 rounded-full ${
                    it.active
                      ? "bg-primary shadow-[0_0_16px_var(--primary-glow)] ring-4 ring-primary/20"
                      : "bg-muted"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-eyebrow text-muted-foreground">{it.date}</span>
                  <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {it.step}
                  </span>
                </div>
                <h4 className="mt-3 font-display text-[1.0625rem] font-medium tracking-[-0.015em] text-foreground">
                  {it.title}
                </h4>
                <p className="mt-1.5 text-caption text-muted-foreground">{it.meta}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
