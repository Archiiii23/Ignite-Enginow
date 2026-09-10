import { motion } from "framer-motion";

const items = [
  { date: "OCT 20", title: "Project Pitch Day", meta: "Webinar · Open to all", active: true },
  { date: "OCT 25", title: "Rust Conf '26", meta: "Conference · Berlin", active: false },
  { date: "NOV 01", title: "Global FinTech AI", meta: "Hackathon · Remote", active: true },
  { date: "NOV 12", title: "Web3 Builder Meet", meta: "Meetup · Tokyo", active: false },
  { date: "NOV 18", title: "Ignite Demo Day", meta: "Showcase · Virtual", active: true },
  { date: "NOV 24", title: "Design Systems Live", meta: "Workshop · NYC", active: false },
  { date: "DEC 02", title: "Open Source Summit", meta: "Conference · Remote", active: true },
];

export function Timeline() {
  return (
    <section className="py-24 md:py-32 overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <span className="text-eyebrow text-primary-glow">
          — Pipeline
        </span>
        <h2 className="mt-3 text-section-title">Upcoming timeline</h2>
      </div>
      <div className="mask-fade-right overflow-x-auto scrollbar-none">
        <div className="flex gap-0 px-6 min-w-max pb-6">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`w-72 border-t border-border pt-8 pr-12 relative ${
                it.active ? "" : "opacity-60"
              }`}
            >
              <div
                className={`absolute -top-1.5 left-0 size-3 rounded-full ${
                  it.active ? "bg-primary shadow-[0_0_16px_theme(colors.primary)]" : "bg-muted"
                }`}
              />
              <span className="text-eyebrow text-muted-foreground">
                {it.date}
              </span>
              <h4 className="mt-2 font-display text-[1.0625rem] font-medium tracking-[-0.015em]">{it.title}</h4>
              <p className="mt-1 text-caption">{it.meta}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
