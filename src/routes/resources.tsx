import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { resourcesDescription } from "@/lib/seo-descriptions";
import { ArrowUpRight, BookOpen, FileText, Play, Wrench, X, CheckCircle2, Download, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categories = [
  { icon: BookOpen, label: "Guides", count: 42, key: "Guide" },
  { icon: FileText, label: "Templates", count: 18, key: "Template" },
  { icon: Play, label: "Talks", count: 96, key: "Talk" },
  { icon: Wrench, label: "Playbooks", count: 24, key: "Playbook" },
];

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: pageMeta({
      title: "Resources",
      description: resourcesDescription(categories),
      socialDescription:
        "Guides, templates, and playbooks for organizers and participants.",
      path: "/resources",
    }),
    links: canonical("/resources"),
  }),
  component: ResourcesPage,
});

const featured = [
  {
    id: "hackathon-playbook",
    kind: "Playbook",
    title: "The 30-day hackathon playbook",
    excerpt: "A day-by-day blueprint used by top organizers to run a 500-person hackathon end-to-end.",
    readTime: "22 min read",
    content: "This comprehensive playbook details week-by-week checkpoints: Day 1-7 (Sponsorship tiers & platform setup), Day 8-14 (Mentor onboarding & judging criteria), Day 15-21 (Attendee track announcements & team formation), Day 22-30 (Live QR check-in flows, opening keynote run-of-show, and project evaluation rubrics).",
    takeaways: [
      "Checklists for sponsor acquisition and deliverables",
      "QR code check-in flow templates",
      "Judges scoring criteria rubrics",
    ],
  },
  {
    id: "sponsor-packages",
    kind: "Guide",
    title: "Designing sponsor packages people say yes to",
    excerpt: "How to price, position, and pitch sponsorships that fund your event and delight partners.",
    readTime: "14 min read",
    content: "Sponsors care about talent density, branding reach, and interactive workshop hosting. Learn how to construct Title, Track, and Community sponsor packages that generate win-win ROI for technology brands looking to recruit builders.",
    takeaways: [
      "Calculators for pricing sponsorship tiers based on registrant volume",
      "Pitch deck slide structure with highest close rates",
      "Post-event impact report templates",
    ],
  },
  {
    id: "landing-page-template",
    kind: "Template",
    title: "Event landing page in a weekend",
    excerpt: "A production-ready template with capacity, waitlist, and registration built in.",
    readTime: "Downloadable ZIP",
    content: "A modern, responsive Next.js/Tailwind landing page template crafted specifically for developer conferences and community hackathons. Includes dark mode, schedule timeline, speaker grid, and ticket checkout states.",
    takeaways: [
      "Figma UI kit with accessible typography & dark palette",
      "Clean TypeScript code with responsive mobile layout",
      "Built-in metadata for social cards & SEO",
    ],
  },
  {
    id: "keynote-anatomy",
    kind: "Talk",
    title: "Anatomy of a memorable keynote",
    excerpt: "A dissection of five industry-defining keynotes and what made each one work.",
    readTime: "38 min watch",
    content: "An analysis of opening keynotes by visionary engineers. We study how opening hooks, live coding demos, narrative pacing, and audience engagement create talks that resonate years after demo day.",
    takeaways: [
      "Guidelines for live demonstration backup strategies",
      "Slide pacing rules (1 idea per 45 seconds)",
      "Vocal delivery and question cadence",
    ],
  },
];

function ResourcesPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeResource, setActiveResource] = useState<(typeof featured)[0] | null>(null);

  const displayedResources = selectedFilter === "All"
    ? featured
    : featured.filter((r) => r.kind.toLowerCase() === selectedFilter.toLowerCase());

  const handleDownloadOrSave = (r: (typeof featured)[0]) => {
    toast.success(`Accessing ${r.title}`, {
      description: "Resource ready! Check your dashboard or downloads.",
    });
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="pt-40 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-eyebrow text-muted-foreground mb-5">Resources</p>
          <h1 className="text-section-title max-w-3xl">
            Playbooks, guides, and templates from the world's best organizers.
          </h1>
          <p className="text-lead mt-6 max-w-2xl">
            Every event is a design problem. These are the tools we and our community use to solve them.
          </p>
        </div>
      </section>

      {/* Category cards */}
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by Category</span>
            {selectedFilter !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedFilter("All")}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Reset to All ({featured.length})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => {
              const isSelected = selectedFilter.toLowerCase() === c.key.toLowerCase();
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setSelectedFilter(isSelected ? "All" : c.key)}
                  className={`group p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-foreground/25 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <c.icon className={`size-5 transition-colors ${isSelected ? "text-primary" : "text-foreground"}`} />
                    {isSelected && <Sparkles className="size-3.5 text-primary" />}
                  </div>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <div className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{c.label}</div>
                      <div className="text-caption mt-1 text-muted-foreground">{c.count} resources</div>
                    </div>
                    <ArrowUpRight className={`size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="px-4 md:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-eyebrow text-primary font-semibold">— Library</span>
              <h2 className="mt-2 text-section-title">
                {selectedFilter === "All" ? "Featured Resources" : `${selectedFilter}s`}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFilter("All")}
              className="text-caption inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              Browse all library <ArrowUpRight className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedResources.map((r) => (
              <div
                key={r.title}
                onClick={() => setActiveResource(r)}
                className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-micro font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{r.kind}</span>
                    <span className="text-caption text-muted-foreground">{r.readTime}</span>
                  </div>
                  <h3 className="mt-6 tracking-tight text-lg font-semibold group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{r.excerpt}</p>
                </div>
                <div className="mt-8 flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open Guide <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Free access</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reader Modal */}
      {activeResource && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveResource(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {activeResource.kind}
                </span>
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-foreground mt-2">
                  {activeResource.title}
                </h2>
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  Estimated read: {activeResource.readTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveResource(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-6 space-y-6 pr-1 text-left flex-1">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground mb-2">Overview</h4>
                <p className="text-sm text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-2xl border border-border">
                  {activeResource.content}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-muted-foreground mb-3">Key Takeaways & Assets Included</h4>
                <div className="space-y-2">
                  {activeResource.takeaways.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-foreground bg-card border border-border p-3 rounded-xl">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveResource(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-secondary transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadOrSave(activeResource)}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity flex items-center gap-2 shadow-sm"
              >
                <Download className="size-4" />
                <span>Save to Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
