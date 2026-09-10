import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Users } from "lucide-react";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import e4 from "@/assets/event-4.jpg";
import e5 from "@/assets/event-5.jpg";
import e6 from "@/assets/event-6.jpg";

type Status = "LIVE" | "UPCOMING" | "CLOSING" | "ENDED";

const events: Array<{
  title: string;
  banner: string;
  status: Status;
  date: string;
  venue: string;
  category: string;
  registered: string;
  description: string;
}> = [
  {
    title: "NeuralLink Hack 2026",
    banner: e1,
    status: "LIVE",
    date: "Oct 24 — 26",
    venue: "Virtual",
    category: "Hackathon",
    registered: "1,240",
    description: "Building the next generation of brain-computer interfaces and accessible neural frameworks.",
  },
  {
    title: "Founders Summit",
    banner: e2,
    status: "UPCOMING",
    date: "Nov 02",
    venue: "San Francisco",
    category: "Conference",
    registered: "840",
    description: "An exclusive gathering for early-stage founders navigating the zero-to-one phase.",
  },
  {
    title: "UI/UX Masterclass",
    banner: e3,
    status: "CLOSING",
    date: "Oct 30",
    venue: "Online",
    category: "Workshop",
    registered: "2,105",
    description: "Advanced spatial design techniques and high-fidelity prototyping with industry leads.",
  },
  {
    title: "Rust Systems Bootcamp",
    banner: e4,
    status: "UPCOMING",
    date: "Nov 12 — 15",
    venue: "Berlin",
    category: "Bootcamp",
    registered: "612",
    description: "Four intensive days on ownership, async runtimes, and building production-grade services.",
  },
  {
    title: "Global FinTech AI",
    banner: e5,
    status: "UPCOMING",
    date: "Nov 20 — 22",
    venue: "Remote",
    category: "Hackathon",
    registered: "3,180",
    description: "Ship real financial infrastructure powered by open models. $250k in prizes.",
  },
  {
    title: "Ignite Demo Day",
    banner: e6,
    status: "ENDED",
    date: "Oct 12",
    venue: "Virtual",
    category: "Showcase",
    registered: "5,420",
    description: "Twenty communities. Ninety projects. One evening of relentless building.",
  },
];

const statusClass: Record<Status, string> = {
  LIVE: "bg-background/85 backdrop-blur text-live ring-1 ring-live/40",
  UPCOMING: "bg-background/85 backdrop-blur text-foreground ring-1 ring-foreground/15",
  CLOSING: "bg-background/85 backdrop-blur text-closing ring-1 ring-closing/40",
  ENDED: "bg-background/85 backdrop-blur text-muted-foreground ring-1 ring-foreground/15",
};


export function FeaturedEvents() {
  return (
    <section id="events" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-eyebrow text-primary-glow">
              — Featured
            </span>
            <h2 className="mt-3 text-section-title">
              Events happening now
            </h2>
            <p className="mt-5 text-lead max-w-[52ch]">
              The most anticipated gatherings across the global ecosystem — hand-picked by the Ignite team.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-glow hover:text-foreground transition-colors"
          >
            View all events <ArrowUpRight className="size-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-surface/60 backdrop-blur border border-foreground/5 rounded-2xl overflow-hidden hover:border-foreground/20 hover:-translate-y-1 transition-all duration-500 will-change-transform"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={event.banner}
                  alt={event.title}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                <span
                  className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-micro ${statusClass[event.status]}`}
                >
                  {event.status === "LIVE" ? "● Live now" : event.status.toLowerCase()}
                </span>
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-micro bg-background/60 backdrop-blur ring-1 ring-foreground/10">
                  {event.category}
                </span>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-medium tracking-[-0.015em]">{event.title}</h3>
                  <span className="text-xs font-mono text-muted-foreground shrink-0 mt-1">
                    {event.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-caption">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> {event.venue}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" /> {event.registered}
                    </span>
                  </div>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-foreground/5 hover:bg-primary hover:text-primary-foreground transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
