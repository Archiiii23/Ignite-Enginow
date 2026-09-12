import { motion } from "framer-motion";
import {
  Zap,
  Users,
  Award,
  Briefcase,
  Sparkles,
  Rocket,
  Globe2,
  BookOpen,
} from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const features = [
  { icon: Zap, title: "Host with ease", desc: "Launch a landing page, manage registrations, and coordinate logistics in one dashboard." },
  { icon: Users, title: "Global community", desc: "Reach half a million builders, designers, and founders across 85+ countries." },
  { icon: Award, title: "Proof of skill", desc: "Issue verifiable certificates participants can carry across their entire career." },
  { icon: Briefcase, title: "Career highway", desc: "Bridge talent and industry with direct hiring pipelines built for sponsors." },
  { icon: Sparkles, title: "Mentorship", desc: "Pair Achievers with senior Igniters through curated 1:1 sessions." },
  { icon: Rocket, title: "Hackathons at scale", desc: "Team formation, submissions, and automated judging — all handled." },
  { icon: Globe2, title: "Hybrid ready", desc: "Ship online, offline, and hybrid experiences without duct-taping tools together." },
  { icon: BookOpen, title: "Learning resources", desc: "A curated library of playbooks, templates, and organizer handbooks." },
];

export function Features() {
  return (
    <section id="about" className="py-24 md:py-32 border-t border-border bg-surface/30">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <span className="text-eyebrow text-primary font-semibold">
            — Why Enginow Ignite
          </span>
          <h2 className="mt-3 text-section-title">
            Engineered for momentum
          </h2>
          <p className="mt-5 text-lead max-w-[58ch] mx-auto">
            The complete ecosystem for community architects. Every tool you need to scale from ten
            to ten thousand.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border overflow-hidden rounded-3xl border border-border">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.04} direction="up">
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group bg-card p-8 flex flex-col gap-4 hover:bg-secondary/40 transition-colors h-full"
              >
                <div className="size-10 rounded-xl bg-primary/10 ring-1 ring-primary/25 text-primary grid place-items-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-[1.0625rem] font-medium tracking-[-0.015em]">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
