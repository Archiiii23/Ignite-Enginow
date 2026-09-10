import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { Github } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: pageMeta({
      title: "Sign in",
      description: "Sign in or create your Enginow Ignite account.",
      path: "/auth",
      noindex: true,
    }),
    links: canonical("/auth"),
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <PageShell variant="dark">
      <section className="min-h-[100svh] pt-32 pb-24 px-4 md:px-6 grid place-items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--foreground)_15%,transparent),transparent_70%)]" />
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-eyebrow text-muted-foreground mb-4">
              {mode === "signin" ? "Welcome back" : "Join Enginow Ignite"}
            </p>
            <h1 className="text-section-title">
              {mode === "signin" ? "Sign in to continue." : "Create your account."}
            </h1>
            <p className="text-lead mt-4">
              {mode === "signin"
                ? "Access events, dashboards, and certificates."
                : "Host or attend premium technical events."}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)]">
            <div className="flex p-1 bg-secondary rounded-lg mb-6 text-sm">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 h-9 rounded-md transition-colors ${
                    mode === m ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {mode === "signup" && (
                <Field label="Full name" type="text" placeholder="Ada Lovelace" />
              )}
              <Field label="Email" type="email" placeholder="you@building.com" />
              <Field label="Password" type="password" placeholder="••••••••" />
              {mode === "signup" && (
                <div className="text-caption">
                  You'll join as an{" "}
                  <span className="text-foreground font-medium">Achiever</span>. Upgrade to{" "}
                  <span className="text-foreground font-medium">Igniter</span> after your first event.
                </div>
              )}
              <button className="w-full bg-foreground text-background h-11 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="text-micro text-muted-foreground bg-card px-3">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <OAuthButton label="Google" />
              <OAuthButton label="GitHub" icon={<Github className="size-4" />} />
            </div>
          </div>

          <p className="text-caption text-center mt-6">
            By continuing you agree to the{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
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

function OAuthButton({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="h-11 rounded-lg border border-border bg-background hover:bg-secondary text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors">
      {icon}
      {label}
    </button>
  );
}
