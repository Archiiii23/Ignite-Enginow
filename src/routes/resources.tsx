import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { resourcesDescription } from "@/lib/seo-descriptions";
import { ArrowUpRight, BookOpen, FileText, Play, Wrench } from "lucide-react";

const categories = [
  { icon: BookOpen, label: "Guides", count: 42 },
  { icon: FileText, label: "Templates", count: 18 },
  { icon: Play, label: "Talks", count: 96 },
  { icon: Wrench, label: "Playbooks", count: 24 },
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
    kind: "Playbook",
    title: "The 30-day hackathon playbook",
    excerpt: "A day-by-day blueprint used by top organizers to run a 500-person hackathon end-to-end.",
    readTime: "22 min read",
  },
  {
    kind: "Guide",
    title: "Designing sponsor packages people say yes to",
    excerpt: "How to price, position, and pitch sponsorships that fund your event and delight partners.",
    readTime: "14 min read",
  },
  {
    kind: "Template",
    title: "Event landing page in a weekend",
    excerpt: "A production-ready template with capacity, waitlist, and registration built in.",
    readTime: "Download",
  },
  {
    kind: "Talk",
    title: "Anatomy of a memorable keynote",
    excerpt: "A dissection of five industry-defining keynotes and what made each one work.",
    readTime: "38 min watch",
  },
];

function ResourcesPage() {
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
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <a
              key={c.label}
              href="#"
              className="group p-6 rounded-2xl border border-border bg-card hover:border-foreground/25 transition-colors"
            >
              <c.icon className="size-5" />
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-caption mt-1">{c.count} resources</div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="px-4 md:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-section-title">Featured</h2>
            <a href="#" className="text-caption inline-flex items-center gap-1 hover:text-foreground">
              Browse library <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((r) => (
              <a
                key={r.title}
                href="#"
                className="group p-8 rounded-2xl border border-border bg-card hover:border-foreground/25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-micro text-muted-foreground">{r.kind}</span>
                  <span className="text-caption">{r.readTime}</span>
                </div>
                <h3 className="mt-6 tracking-tight">{r.title}</h3>
                <p className="text-muted-foreground mt-3">{r.excerpt}</p>
                <div className="mt-8 inline-flex items-center gap-1 text-sm font-medium">
                  Read <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
