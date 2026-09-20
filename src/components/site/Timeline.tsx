import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-eyebrow text-primary font-semibold">
                — Scene 3: Participate & Pipeline
              </span>
              <h2 className="mt-3 text-section-title">Upcoming event timeline</h2>
              <p className="mt-3 text-lead max-w-[50ch]">
                Track community hackathons, demo days, and global keynotes as they unfold across the calendar.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow transition-colors"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <div className="mask-fade-right overflow-x-auto scrollbar-none pb-6 cursor-grab active:cursor-grabbing">
        <motion.div
          style={{ x: isReduced ? 0 : translateX }}
          className="flex gap-0 px-6 min-w-max"
        >
          {items.map((it, i) => (
            <ScrollReveal key={it.title} delay={i * 0.05} direction="right">
              <Link
                to="/events"
                search={{ q: it.title } as Record<string, string>}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className={`w-72 border-t border-border/80 pt-8 pr-12 relative cursor-pointer ${
                    it.active ? "" : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`absolute -top-1.5 left-0 size-3 rounded-full transition-transform group-hover:scale-125 ${
                      it.active
                        ? "bg-primary shadow-[0_0_16px_var(--primary-glow)] ring-4 ring-primary/20"
                        : "bg-muted group-hover:bg-primary/60"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-eyebrow text-muted-foreground">{it.date}</span>
                    <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>{it.step}</span>
                      <ArrowRight className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-[1.0625rem] font-medium tracking-[-0.015em] text-foreground group-hover:text-primary transition-colors">
                    {it.title}
                  </h4>
                  <p className="mt-1.5 text-caption text-muted-foreground group-hover:text-foreground/80 transition-colors">{it.meta}</p>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
