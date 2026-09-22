import { Link } from "@/lib/router";
import { PageShell } from "@/components/site/PageShell";
import { ArrowUpRight, MapPin, X, CheckCircle2, Send, Sparkles, Briefcase } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const roles = [
  {
    title: "Staff Frontend Engineer",
    team: "Engineering",
    location: "Bengaluru · Hybrid",
    type: "Full-time",
    description: "Architect high-speed event infrastructure, real-time ticket scanning, and slick interactive story interfaces with React 19, Vite, and GSAP/Framer Motion.",
    skills: ["TypeScript / React", "Web Animations & Canvas", "Performance & Latency Profiling"],
  },
  {
    title: "Product Designer, Growth",
    team: "Design",
    location: "Remote (IN)",
    type: "Full-time",
    description: "Design dark-mode first design systems, event portals, and creator dashboards that make complex hackathon coordination feel effortless.",
    skills: ["Figma Mastery", "Design Systems", "Prototyping & Motion"],
  },
  {
    title: "Community Manager",
    team: "Community",
    location: "Bengaluru",
    type: "Full-time",
    description: "Empower student chapters, college clubs, and regional hackathon organizers to launch thriving technology communities.",
    skills: ["Developer Relations", "Campus Ecosystem Outreach", "Event Operations"],
  },
  {
    title: "Backend Engineer, Platform",
    team: "Engineering",
    location: "Remote (IN)",
    type: "Full-time",
    description: "Scale high-concurrency registration pipelines, cryptographic badge minting, and live submission evaluation APIs.",
    skills: ["Node.js / Go", "PostgreSQL & Redis", "Distributed Webhooks"],
  },
  {
    title: "Content & Editorial Lead",
    team: "Marketing",
    location: "Bengaluru · Hybrid",
    type: "Full-time",
    description: "Champion stories of breakthroughs, hackathon winners, and community organizers across global tech ecosystems.",
    skills: ["Technical Storytelling", "Editorial Strategy", "Community Interviews"],
  },
  {
    title: "Developer Relations",
    team: "Community",
    location: "Remote (IN)",
    type: "Full-time",
    description: "Bridge sponsor APIs with hackathon participants through technical workshops, office hours, and code reviews.",
    skills: ["Public Speaking", "API Integration", "Hackathon Mentoring"],
  },
];



const perks = [
  { title: "Ownership from day one", body: "Small, senior teams. You'll ship something visible in your first week." },
  { title: "Craft-first culture", body: "Design reviews, code reviews, and weekly demo days. We ship quality." },
  { title: "Health & wellness", body: "Comprehensive insurance for you and your family. Annual wellness stipend." },
  { title: "Learning stipend", body: "₹75,000 per year for books, courses, and conferences." },
];

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[0] | null>(null);
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPortfolio, setApplicantPortfolio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantEmail.trim()) {
      toast.error("Please provide your email address.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Application received for ${selectedRole?.title}!`, {
        description: `We'll review your profile and reply to ${applicantEmail} within 48 hours.`,
      });
      setSelectedRole(null);
      setApplicantEmail("");
      setApplicantPortfolio("");
    }, 600);
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="pt-40 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-eyebrow text-muted-foreground mb-6">Careers</p>
          <h1 className="text-display">Build the platform builders wish they had.</h1>
          <p className="text-lead mt-8 max-w-2xl mx-auto">
            We're a small, senior team shipping fast. If you care deeply about craft, community, and
            the experience of every keystroke — you'll feel at home here.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {perks.map((p) => (
            <div key={p.title} className="p-8 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="px-4 md:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-eyebrow text-muted-foreground mb-3">Open roles</p>
              <h2 className="text-section-title">We're hiring across teams.</h2>
            </div>
            <span className="text-caption hidden md:block">{roles.length} open positions</span>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card divide-y divide-border">
            {roles.map((r) => (
              <div
                key={r.title}
                onClick={() => setSelectedRole(r)}
                className="group grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-4 p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    <span>{r.title}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 md:hidden">
                      {r.type}
                    </span>
                  </div>
                  <div className="text-caption text-muted-foreground mt-1">{r.team}</div>
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <MapPin className="size-3.5" /> {r.location}
                </div>
                <div className="text-caption hidden md:block">{r.type}</div>
                <div className="flex items-center gap-2 justify-self-end text-xs font-semibold text-primary">
                  <span>View role</span>
                  <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Overview & Quick Application Modal */}
      {selectedRole && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedRole(null)}
        >
          <div
            className="relative w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {selectedRole.team}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> {selectedRole.location}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-foreground">
                  {selectedRole.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-5 space-y-5 pr-1 flex-1 text-left">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground mb-2">The Mission</h4>
                <p className="text-sm text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-2xl border border-border">
                  {selectedRole.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground mb-2.5">Key Focus Areas</h4>
                <div className="space-y-2">
                  {selectedRole.skills.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground bg-card border border-border p-2.5 rounded-xl">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleApply} className="pt-3 border-t border-border space-y-3">
                <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Fast Track Application</h4>
                <div>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="Your email address (e.g. builder@gmail.com)"
                    className="w-full bg-secondary/40 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={applicantPortfolio}
                    onChange={(e) => setApplicantPortfolio(e.target.value)}
                    placeholder="GitHub, Portfolio, or LinkedIn URL (optional)"
                    className="w-full bg-secondary/40 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground">No cover letter needed. We value your work.</span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>{submitting ? "Sending..." : "Submit Application"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
