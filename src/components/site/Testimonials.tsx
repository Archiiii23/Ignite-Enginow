import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const items = [
  {
    quote:
      "The scale of events we can run on Ignite is unmatched. We moved from 500 to 5,000 attendees without a single hitch in our flow.",
    name: "Elena Vance",
    role: "Lead Organizer, DevFlow",
    to: "/events" as const,
  },
  {
    quote:
      "Our hackathon participants loved the intuitive interface. It feels less like a tool and more like an experience built for them.",
    name: "Marcus Thorne",
    role: "CTO, SparkLabs",
    to: "/events" as const,
  },
  {
    quote:
      "The verified certificates feature alone saved us hundreds of manual hours. It's the gold standard for credentialing.",
    name: "Sarah Jenks",
    role: "Director, EduGlobal",
    to: "/dashboard" as const,
  },
  {
    quote:
      "We ran a global summit across six time zones on Ignite. The team's operational discipline shines through the product.",
    name: "Ravi Patel",
    role: "Head of Community, Northwind",
    to: "/about" as const,
  },
  {
    quote:
      "The typography, the pace, the polish — everything feels intentional. Ignite raised our whole event's perceived quality.",
    name: "Nadia Okoro",
    role: "Founder, StackForge",
    to: "/organizer" as const,
  },
];

export function Testimonials() {
  const loop = [...items, ...items];
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-eyebrow text-primary font-semibold">
              — Voices
            </span>
            <h2 className="mt-3 text-section-title">
              Trusted by organizers
            </h2>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow transition-colors"
          >
            <span>Read community stories</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div
        className="relative group/marquee"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex gap-5 w-max animate-marquee group-hover/marquee:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <Link
              key={i}
              to={t.to}
              className="block cursor-pointer"
            >
              <figure
                className="flex-none w-[380px] bg-card border border-border hover:border-primary/40 rounded-3xl p-8 shadow-sm dark:shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-full"
              >
                <blockquote className="text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-sm font-semibold text-primary-foreground shadow-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-eyebrow text-muted-foreground">
                        {t.role}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity" />
                </figcaption>
              </figure>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
