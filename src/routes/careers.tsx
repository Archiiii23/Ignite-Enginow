import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { careersDescription } from "@/lib/seo-descriptions";
import { ArrowUpRight, MapPin } from "lucide-react";

const roles = [
  { title: "Staff Frontend Engineer", team: "Engineering", location: "Bengaluru · Hybrid", type: "Full-time" },
  { title: "Product Designer, Growth", team: "Design", location: "Remote (IN)", type: "Full-time" },
  { title: "Community Manager", team: "Community", location: "Bengaluru", type: "Full-time" },
  { title: "Backend Engineer, Platform", team: "Engineering", location: "Remote (IN)", type: "Full-time" },
  { title: "Content & Editorial Lead", team: "Marketing", location: "Bengaluru · Hybrid", type: "Full-time" },
  { title: "Developer Relations", team: "Community", location: "Remote (IN)", type: "Full-time" },
];

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: pageMeta({
      title: "Career",
      description: careersDescription(roles),
      socialDescription:
        "Open roles at Enginow Ignite. Engineering, design, product, and community.",
      path: "/careers",
    }),
    links: canonical("/careers"),
  }),
  component: CareersPage,
});


const perks = [
  { title: "Ownership from day one", body: "Small, senior teams. You'll ship something visible in your first week." },
  { title: "Craft-first culture", body: "Design reviews, code reviews, and weekly demo days. We ship quality." },
  { title: "Health & wellness", body: "Comprehensive insurance for you and your family. Annual wellness stipend." },
  { title: "Learning stipend", body: "₹75,000 per year for books, courses, and conferences." },
];

function CareersPage() {
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
            <div key={p.title} className="p-8 rounded-2xl border border-border bg-card">
              <h3>{p.title}</h3>
              <p className="text-muted-foreground mt-3">{p.body}</p>
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

          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {roles.map((r, i) => (
              <a
                key={r.title}
                href="#"
                className={`group grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-4 p-6 hover:bg-secondary/50 transition-colors ${
                  i !== roles.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-caption mt-1">{r.team}</div>
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <MapPin className="size-3.5" /> {r.location}
                </div>
                <div className="text-caption">{r.type}</div>
                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-foreground justify-self-end" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
