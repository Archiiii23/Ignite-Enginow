import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePlatformStore } from "@/lib/platform-store";
import { CalendarDays, Users, Building2, Star } from "lucide-react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = 16;
    const totalSteps = duration / step;
    const increment = target / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export function StatsSection() {
  const { events, registrations, organizers } = usePlatformStore();

  const publishedEvents = events.filter((e) => e.approvalStatus === "published").length;
  const totalRegs = registrations.filter((r) => r.status !== "cancelled").length;
  const verifiedOrgs = organizers.filter((o) => o.verificationStatus === "verified").length;
  const featuredEvents = events.filter((e) => e.isFeatured).length;

  const stats = [
    { icon: CalendarDays, label: "Events Hosted", value: Math.max(publishedEvents, 12000), suffix: "+" },
    { icon: Users, label: "Participants", value: Math.max(totalRegs, 500000), suffix: "+" },
    { icon: Building2, label: "Verified Organizers", value: Math.max(verifiedOrgs, 850), suffix: "+" },
    { icon: Star, label: "Featured Events", value: Math.max(featuredEvents, 240), suffix: "+" },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center md:items-start gap-2 md:pl-8 md:border-l border-border first:border-l-0 first:pl-0"
            >
              <stat.icon className="size-5 text-primary" />
              <div className="text-stat text-primary">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
