import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { GraduationCap, Briefcase, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

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
  const { loginWithGoogle, loginWithEmail, signupWithEmail, switchRole } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async (roleToUse: UserRole = selectedRole) => {
    setLoading(true);
    try {
      await loginWithGoogle(roleToUse);
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        await signupWithEmail(name || email.split("@")[0], email, selectedRole);
      } else {
        await loginWithEmail(email, selectedRole);
      }
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchRole(role);
    navigate({ to: "/dashboard" });
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
                  <span>Participate in hackathons, download QR event passes & favorite events.</span>
                )}
                {selectedRole === "organizer" && (
                  <span>Create listings, submit for verification, manage attendees & track analytics.</span>
                )}
                {selectedRole === "admin" && (
                  <span>Approve/reject organizers & events, view platform analytics & moderation.</span>
                )}
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleAuth()}
              className="w-full h-12 rounded-xl border border-border bg-background hover:bg-secondary text-foreground text-sm font-semibold inline-flex items-center justify-center gap-3 transition-all duration-200 active:scale-98 shadow-sm group"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="text-micro text-muted-foreground bg-card px-3">or continue with email</span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex p-1 bg-secondary rounded-lg mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
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
                {mode === "signin" ? `Sign In as ${selectedRole}` : `Create ${selectedRole} Account`}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Demo Personas
                </span>
                <span className="text-[11px] text-primary font-medium">1-Click Instant Login</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("student")}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-foreground">Student Demo</div>
                    <div className="text-[10px] text-muted-foreground">Aarav (IIT)</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin("organizer")}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-foreground">Organizer Demo</div>
                    <div className="text-[10px] text-muted-foreground">DevSphere Org</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin")}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-foreground">Admin Demo</div>
                    <div className="text-[10px] text-muted-foreground">Sarah (Super)</div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>
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
