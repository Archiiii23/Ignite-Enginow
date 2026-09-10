export function CTA() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden p-12 md:p-20 text-center border border-primary/30 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent">
        <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_top,color-mix(in_oklab,var(--foreground)_18%,transparent),transparent_60%)]" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <h2 className="text-section-title text-balance">
          Ready to ignite your <span className="text-gradient-brand">first event?</span>
        </h2>
        <p className="mt-6 text-lead max-w-[46ch] mx-auto">
          Join thousands of organizers building the future of community engagement.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <button className="bg-foreground text-background px-7 py-3.5 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-95">
            Host your first event
          </button>
          <button className="bg-surface/60 backdrop-blur border border-foreground/10 text-foreground px-7 py-3.5 rounded-xl font-medium hover:bg-surface transition-all active:scale-95">
            Become an Igniter
          </button>
        </div>
      </div>
    </section>
  );
}
