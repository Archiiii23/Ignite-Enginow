import { PageShell } from "@/components/site/PageShell";
import { Mail, MapPin, MessageCircle, Loader2, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const channels = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@enginow.ignite",
    href: "mailto:hello@enginow.ignite",
    note: "Replies within 1 business day.",
  },
  {
    icon: MessageCircle,
    title: "Support",
    value: "support.enginow.ignite",
    href: "mailto:support@enginow.ignite",
    note: "Priority for verified Igniters.",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Koramangala, Bengaluru",
    href: "https://maps.google.com/?q=Koramangala,Bengaluru",
    note: "Visits by appointment.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    topic: "Partnership",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSending(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = (await response.json().catch(() => ({}))) as { error?: string; success?: boolean };
      if (!response.ok) throw new Error(result.error || "Unable to send your message");
      toast.success("Message sent successfully!", { description: "We'll be in touch shortly." });
      setForm({ firstName: "", lastName: "", email: "", topic: "Partnership", message: "" });
    } catch (error) {
      clearTimeout(timeoutId);
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      toast.error("Message not sent", {
        description: isAbort
          ? "Request timed out. Please try again."
          : error instanceof Error
          ? error.message
          : "Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <section className="pt-40 pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Left */}
          <div>
            <p className="text-eyebrow text-muted-foreground mb-5">Get in touch</p>
            <h1 className="text-section-title">Let's build something worth attending.</h1>
            <p className="text-lead mt-6 max-w-lg">
              Partnerships, press, or platform questions — we read every message and respond
              quickly.
            </p>

            <div className="mt-12 space-y-6">
              {channels.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-start justify-between gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer block"
                >
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary grid place-items-center shrink-0 transition-colors">
                      <c.icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-caption text-muted-foreground">{c.title}</div>
                      <div className="text-sm font-semibold mt-0.5 text-foreground group-hover:text-primary transition-colors">{c.value}</div>
                      <div className="text-caption mt-1 text-muted-foreground">{c.note}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] h-fit"
          >
            <h3>Send a message</h3>
            <p className="text-caption mt-1">Fill in the form and we'll be in touch.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="First name"
                placeholder="Ada"
                required
                value={form.firstName}
                onChange={(value) => updateField("firstName", value)}
              />
              <Field
                label="Last name"
                placeholder="Lovelace"
                required
                value={form.lastName}
                onChange={(value) => updateField("lastName", value)}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Email"
                type="email"
                placeholder="you@building.com"
                required
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />
            </div>
            <div className="mt-4">
              <label className="block">
                <span className="text-caption text-muted-foreground">Topic</span>
                <select
                  value={form.topic}
                  onChange={(event) => updateField("topic", event.target.value)}
                  className="mt-1.5 w-full h-11 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:border-foreground/40"
                >
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
                  required
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Tell us a little about what you have in mind…"
                  className="mt-1.5 w-full bg-background border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 resize-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full bg-foreground text-background h-11 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              <span>{sending ? "Sending message..." : "Send message"}</span>
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-caption text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full h-11 bg-background border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
      />
    </label>
  );
}
