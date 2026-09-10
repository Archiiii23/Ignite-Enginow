const items = [
  {
    quote:
      "The scale of events we can run on Ignite is unmatched. We moved from 500 to 5,000 attendees without a single hitch in our flow.",
    name: "Elena Vance",
    role: "Lead Organizer, DevFlow",
  },
  {
    quote:
      "Our hackathon participants loved the intuitive interface. It feels less like a tool and more like an experience built for them.",
    name: "Marcus Thorne",
    role: "CTO, SparkLabs",
  },
  {
    quote:
      "The verified certificates feature alone saved us hundreds of manual hours. It's the gold standard for credentialing.",
    name: "Sarah Jenks",
    role: "Director, EduGlobal",
  },
  {
    quote:
      "We ran a global summit across six time zones on Ignite. The team's operational discipline shines through the product.",
    name: "Ravi Patel",
    role: "Head of Community, Northwind",
  },
  {
    quote:
      "The typography, the pace, the polish — everything feels intentional. Ignite raised our whole event's perceived quality.",
    name: "Nadia Okoro",
    role: "Founder, StackForge",
  },
];

export function Testimonials() {
  const loop = [...items, ...items];
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <span className="text-eyebrow text-primary-glow">
          — Voices
        </span>
        <h2 className="mt-3 text-section-title">
          Trusted by organizers
        </h2>
      </div>

      <div
        className="relative"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex gap-5 w-max animate-marquee">
          {loop.map((t, i) => (
            <figure
              key={i}
              className="flex-none w-[380px] bg-surface/60 backdrop-blur border border-foreground/5 rounded-3xl p-8"
            >
              <blockquote className="text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-sm font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-eyebrow text-muted-foreground">
                    {t.role}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
