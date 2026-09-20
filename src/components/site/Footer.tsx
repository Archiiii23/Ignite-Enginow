import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Youtube, X, Shield, FileText, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "sonner";

interface FooterLink {
  label: string;
  to?: string;
  legalKey?: "privacy" | "terms" | "refund" | "guidelines";
}

const platformLinks: FooterLink[] = [
  { label: "Events", to: "/events" },
  { label: "Resources", to: "/resources" },
  { label: "Careers", to: "/careers" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const achieverLinks: FooterLink[] = [
  { label: "Join Events", to: "/events" },
  { label: "Certificates", to: "/dashboard" },
  { label: "Bookmarks", to: "/dashboard" },
  { label: "Resources", to: "/resources" },
  { label: "Profile", to: "/dashboard" },
];

const igniterLinks: FooterLink[] = [
  { label: "Hosting Guidelines", to: "/resources" },
  { label: "Event Checklist", to: "/resources" },
  { label: "Organizer Handbook", to: "/organizer" },
  { label: "Volunteer Guide", to: "/resources" },
];

const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", legalKey: "privacy" },
  { label: "Terms of Service", legalKey: "terms" },
  { label: "Refund Policy", legalKey: "refund" },
  { label: "Community Guidelines", legalKey: "guidelines" },
];

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How Enginow Ignite protects your personal data and account privacy.",
    sections: [
      {
        heading: "1. Data We Collect",
        body: "We collect only information necessary to deliver and verify events — including name, email, authentication tokens, team memberships, and event submission data.",
      },
      {
        heading: "2. Participant Credentialing",
        body: "When you earn verifiable certificates or proof-of-work badges, cryptographic signatures may be recorded with your public profile handle.",
      },
      {
        heading: "3. No Third-Party Resale",
        body: "We never monetize or sell your personal contact information to external advertisers or data brokers.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Rules and agreements governing usage of the Enginow Ignite platform.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By creating an account, hosting, or registering for hackathons on Enginow Ignite, you agree to comply with our platform policies and fair competition rules.",
      },
      {
        heading: "2. Organizer Responsibility",
        body: "Verified Igniters are responsible for maintaining accurate schedules, legitimate prize distribution, and transparent judging criteria.",
      },
      {
        heading: "3. Account Integrity",
        body: "Duplicate registrations, falsified identities, or fraudulent submissions are grounds for immediate suspension across all events.",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    subtitle: "Transparent ticketing, pass cancellations, and refund terms.",
    sections: [
      {
        heading: "1. Paid Ticket Cancellations",
        body: "Full refunds are available up to 48 hours before an event's scheduled start time, unless specified otherwise by the event organizer.",
      },
      {
        heading: "2. Cancelled or Rescheduled Events",
        body: "If an organizer cancels or reschedules an event without alternative dates, 100% of ticket fees are refunded automatically to the original payment method.",
      },
      {
        heading: "3. Processing Timelines",
        body: "Refunds typically credit back to your account within 5 to 7 business days.",
      },
    ],
  },
  guidelines: {
    title: "Community Guidelines",
    subtitle: "Building respectful, collaborative, and inclusive engineering environments.",
    sections: [
      {
        heading: "1. Zero Tolerance for Harassment",
        body: "Enginow Ignite is dedicated to a harassment-free experience for everyone, regardless of gender, sexual orientation, disability, race, or technical skill level.",
      },
      {
        heading: "2. Fair Play & Academic Integrity",
        body: "All hackathon submissions must be built during the official competition window. Pre-built closed projects must be openly disclosed.",
      },
      {
        heading: "3. Constructive Collaboration",
        body: "Encourage peers, respect open-source contributors, and provide constructive feedback during demo days and peer review sessions.",
      },
    ],
  },
};

const socials = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [activeLegalModal, setActiveLegalModal] = useState<keyof typeof legalContent | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Subscribed to the Enginow Ignite newsletter!", {
      description: `Updates will be sent to ${newsletterEmail}`,
    });
    setNewsletterEmail("");
  };

  return (
    <footer id="contact" className="pt-16 pb-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-14 mb-16">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
                <img src={logo} alt="Enginow Ignite" width={32} height={32} className="size-8 drop-shadow-sm group-hover:scale-105 transition-transform" />
                <span className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  Enginow <span className="text-primary font-bold">Ignite</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-[42ch] leading-relaxed">
                The architectural foundation for global technical communities. Built for scale.
                Designed for impact.
              </p>
              <div className="mt-8 flex gap-2">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="size-10 rounded-full bg-secondary border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-muted-foreground cursor-pointer"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Platform */}
              <div className="flex flex-col gap-5">
                <span className="text-eyebrow text-muted-foreground">Platform</span>
                <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                  {platformLinks.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to!} className="hover:text-primary transition-colors cursor-pointer block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Achievers */}
              <div className="flex flex-col gap-5">
                <span className="text-eyebrow text-muted-foreground">For Achievers</span>
                <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                  {achieverLinks.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to!} className="hover:text-primary transition-colors cursor-pointer block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Igniters */}
              <div className="flex flex-col gap-5">
                <span className="text-eyebrow text-muted-foreground">For Igniters</span>
                <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                  {igniterLinks.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to!} className="hover:text-primary transition-colors cursor-pointer block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-5">
                <span className="text-eyebrow text-muted-foreground">Legal</span>
                <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                  {legalLinks.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => setActiveLegalModal(item.legalKey!)}
                        className="hover:text-primary transition-colors cursor-pointer text-left block"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-4 max-w-md w-full">
              <span className="text-eyebrow text-muted-foreground">
                Newsletter
              </span>
              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 p-1.5 bg-surface rounded-xl border border-border"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@building.com"
                  className="bg-transparent text-sm px-3 focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div className="flex flex-col md:items-end gap-2 text-caption">
              <div className="flex items-center gap-2">
                <span>Theme:</span>
                <ThemeToggle showLabel />
              </div>
              <div>
                © {new Date().getFullYear()} Enginow Ignite. Ignite Ideas. Build Communities. Create Impact.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Legal Policy Modal */}
      {activeLegalModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLegalModal(null)}
        >
          <div
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    {legalContent[activeLegalModal].title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {legalContent[activeLegalModal].subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-6 space-y-5 pr-1 text-left flex-1">
              {legalContent[activeLegalModal].sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>{sec.heading}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Enginow Ignite Trust & Safety</span>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
