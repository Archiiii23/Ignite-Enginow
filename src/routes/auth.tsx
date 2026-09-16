import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { GraduationCap, Briefcase, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: pageMeta({
      title: "Sign in & Roles",
      description: "Sign in to Enginow Ignite as a Student, Organizer, or Admin.",
      path: "/auth",
      noindex: true,
    }),
    links: canonical("/auth"),
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { loginWithEmail, signupWithEmail } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signupWithEmail(name || email.split("@")[0], email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate({ to: "/dashboard" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toast.error(
        message.toLowerCase().includes("already exists")
          ? "Account already exists, please sign in"
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="min-h-[100svh] pt-32 pb-24 px-4 md:px-6 grid place-items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(60%_50%_at_50%_10%,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_70%)]" />

        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <span className="text-eyebrow text-primary font-semibold mb-3 inline-block">
              Enginow Ignite Auth & RBAC
            </span>
            <h1 className="text-section-title">
              {mode === "signin" ? "Welcome back." : "Create your account."}
            </h1>
            <p className="text-lead mt-3">
              Choose your role to access role-specific workflows and dashboards.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
            {/* Role Selection Tabs */}
            <div className="mb-6">
              <label className="text-caption text-muted-foreground block mb-2 font-medium">
                Select your primary role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === "student"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="size-4 mb-1 text-primary" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("organizer")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === "organizer"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Briefcase className="size-4 mb-1 text-primary" />
                  <span>Organizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === "admin"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="size-4 mb-1 text-primary" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Role explanation */}
              <div className="mt-2 text-xs text-muted-foreground px-1">
                {selectedRole === "student" && (
                  <span>
                    Participate in hackathons, download QR event passes & favorite events.
                  </span>
                )}
                {selectedRole === "organizer" && (
                  <span>
                    Create listings, submit for verification, manage attendees & track analytics.
                  </span>
                )}
                {selectedRole === "admin" && (
                  <span>
                    Approve/reject organizers & events, view platform analytics & moderation.
                  </span>
                )}
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="text-micro text-muted-foreground bg-card px-3">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex p-1 bg-secondary rounded-lg mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    mode === "signin"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    mode === "signup"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Create account
                </button>
              </div>

              {mode === "signup" && (
                <label className="block">
                  <span className="text-caption text-muted-foreground">Full name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="mt-1.5 w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-caption text-muted-foreground">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.edu"
                  className="mt-1.5 w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </label>

              <label className="block">
                <span className="text-caption text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full h-11 bg-background border border-border rounded-xl px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground h-11 rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0_0_24px_-4px_var(--primary-glow)]"
              >
                {mode === "signin"
                  ? `Sign In as ${selectedRole}`
                  : `Create ${selectedRole} Account`}
              </button>
            </form>
          </div>

          <p className="text-caption text-center mt-6 text-muted-foreground">
            Protected by Enginow Ignite security & OAuth governance.{" "}
            <Link to="/" className="underline hover:text-foreground">
              Terms & Privacy
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
