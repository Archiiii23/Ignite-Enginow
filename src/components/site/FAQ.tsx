import { Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Who can host events on Enginow Ignite?",
    a: "Any verified Igniter can host events. Achievers can request Igniter status from the admin team — approvals typically take under 48 hours.",
  },
  {
    q: "Is there a fee to host or attend?",
    a: "Hosting community events is free. Premium features like on-chain certificates and dedicated event infrastructure are available on our paid plans.",
  },
  {
    q: "What types of events are supported?",
    a: "Hackathons, workshops, webinars, bootcamps, competitions, meetups, conferences, and any technical or community event you can imagine.",
  },
  {
    q: "Can I run online, offline, or hybrid events?",
    a: "All three. Ignite handles registrations, check-in QR codes, live streaming, and hybrid attendee flows without switching tools.",
  },
  {
    q: "Do participants get certificates?",
    a: "Yes. Every event can issue verifiable certificates automatically to registered participants after the event concludes.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-eyebrow text-primary-glow">
            — FAQ
          </span>
          <h2 className="mt-3 text-section-title">
            Frequently asked
          </h2>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full py-6 flex items-center justify-between gap-6 text-left group"
                >
                  <span className="font-display text-[1.0625rem] font-medium tracking-[-0.015em] group-hover:text-primary-glow transition-colors">
                    {f.q}
                  </span>
                  <Plus
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-45 text-primary-glow" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-muted-foreground leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
