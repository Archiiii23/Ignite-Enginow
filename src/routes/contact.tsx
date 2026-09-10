import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: pageMeta({
      title: "Contact",
      description: "Get in touch with the Enginow Ignite team.",
      socialDescription: "Reach out for partnerships, press, or platform support.",
      path: "/contact",
    }),
    links: canonical("/contact"),
  }),
  component: ContactPage,
});

const channels = [
  { icon: Mail, title: "Email", value: "hello@enginow.ignite", note: "Replies within 1 business day." },
  { icon: MessageCircle, title: "Support", value: "support.enginow.ignite", note: "Priority for verified Igniters." },
  { icon: MapPin, title: "Office", value: "Koramangala, Bengaluru", note: "Visits by appointment." },
];

function ContactPage() {
  return (
    <PageShell>
      <section className="pt-40 pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Left */}
          <div>
            <p className="text-eyebrow text-muted-foreground mb-5">Get in touch</p>
            <h1 className="text-section-title">Let's build something worth attending.</h1>
            <p className="text-lead mt-6 max-w-lg">
              Partnerships, press, or platform questions — we read every message and respond quickly.
            </p>

            <div className="mt-12 space-y-6">
              {channels.map((c) => (
                <div key={c.title} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
                  <div className="size-10 rounded-lg bg-secondary grid place-items-center shrink-0">
                    <c.icon className="size-4" />
                  </div>
                  <div>
                    <div className="text-caption text-muted-foreground">{c.title}</div>
                    <div className="text-sm font-medium mt-0.5">{c.value}</div>
                    <div className="text-caption mt-1">{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] h-fit"
          >
            <h3>Send a message</h3>
            <p className="text-caption mt-1">Fill in the form and we'll be in touch.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First name" placeholder="Ada" />
              <Field label="Last name" placeholder="Lovelace" />
            </div>
            <div className="mt-4">
              <Field label="Email" type="email" placeholder="you@building.com" />
            </div>
            <div className="mt-4">
              <label className="block">
                <span className="text-caption text-muted-foreground">Topic</span>
                <select className="mt-1.5 w-full h-11 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:border-foreground/40">
                  <option>Partnership</option>
                  <option>Press</option>
                  <option>Platform support</option>
                  <option>Careers</option>
                </select>
              </label>
            </div>
            <div className="mt-4">
              <label className="block">
                <span className="text-caption text-muted-foreground">Message</span>
                <textarea
                  rows={5}
                  placeholder="Tell us a little about what you have in mind…"
                  className="mt-1.5 w-full bg-background border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 resize-none"
                />
              </label>
            </div>
            <button className="mt-6 w-full bg-foreground text-background h-11 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
              Send message
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-caption text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full h-11 bg-background border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
      />
    </label>
  );
}
