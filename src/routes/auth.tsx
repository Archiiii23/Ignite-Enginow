import { Link, useNavigate } from "@/lib/router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { useAuth, type UserRole } from "@/lib/auth-context";
import {
  GoogleAccountChooserModal,
  getSavedGoogleAccounts,
  type GoogleAccount,
} from "@/components/auth/GoogleAccountChooserModal";
import { GraduationCap, Briefcase, ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, signupWithEmail, user, isAuthenticated, isLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [suggestedAccount, setSuggestedAccount] = useState<GoogleAccount | null>(null);

  // Load saved/suggested Google accounts from previous visits
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = getSavedGoogleAccounts();
      if (saved.length > 0) {
        setSuggestedAccount(saved[0]);
      }
    }
  }, []);

  // Initialize Google Identity Services (GIS) One Tap only if a REAL Google Client ID is configured
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    // Prevent Google Error 401: invalid_client when client ID is missing or a mock placeholder
    if (!rawClientId || rawClientId.includes("mock") || rawClientId.includes("your_google_client_id")) {
      return;
    }

    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: rawClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              setGoogleLoading(true);
              try {
                const loggedIn = await loginWithGoogle({
                  credential: response.credential,
                  role: "student",
                });
                toast.success(`Welcome back, ${loggedIn.name}! Signed in with Google.`);
                navigate({ to: "/" });
              } catch (err: any) {
                toast.error(err?.message || "Google verification failed");
              } finally {
                setGoogleLoading(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        google.accounts.id.prompt();
      } catch (err) {
        console.debug("[GIS One Tap] Note:", err);
      }
    }
  }, [loginWithGoogle, navigate]);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleSelectGoogleAccount = async (account: GoogleAccount) => {
    setGoogleLoading(true);
    try {
      const loggedIn = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar,
        role: "student",
      });
      setSuggestedAccount(account);
      toast.success(`Signed in as ${loggedIn.email} via Google!`);
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSimulatedGoogleSignIn = async (asRole?: UserRole) => {
    setGoogleLoading(true);
    try {
      const targetRole = asRole || "student";
      const targetEmail = suggestedAccount?.email || user?.email || "jainarchi555@gmail.com";
      const targetName = suggestedAccount?.name || user?.name || "Archi Jain";
      await loginWithGoogle({
        role: targetRole,
        email: targetEmail,
        name: targetName,
      });
      toast.success(`Active as ${targetName} (${targetRole === "admin" ? "Administrator" : targetRole === "organizer" ? "Organizer" : "Participant"})`);
      if (targetRole === "admin") {
        navigate({ to: "/admin" });
      } else if (targetRole === "organizer") {
        navigate({ to: "/organizer" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
      toast.success("Welcome to Ignite!");
      navigate({ to: "/" });
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
              Enginow Ignite Single Sign-On
            </span>
            <h1 className="text-section-title">
              Sign In to Ignite
            </h1>
            <p className="text-lead mt-3">
              One account for hackathons, summits, and technical community hosting.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {/* Automatic Suggested Gmail Account Chip */}
            {suggestedAccount && (
              <div className="mb-4 p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        suggestedAccount.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(suggestedAccount.name)}`
                      }
                      alt={suggestedAccount.name}
                      className="size-10 rounded-full object-cover border border-border"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate flex items-center gap-1.5 text-foreground">
                      <span>{suggestedAccount.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary flex items-center gap-1">
                        <Sparkles className="size-2.5" /> Suggested
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{suggestedAccount.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount(suggestedAccount)}
                    disabled={googleLoading}
                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-70 shadow-sm"
                  >
                    {googleLoading ? <Loader2 className="size-3.5 animate-spin" /> : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChooserOpen(true)}
                    className="h-8 px-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {/* Primary Google Login Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsChooserOpen(true)}
                disabled={googleLoading}
                className="w-full h-12 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>{googleLoading ? "Connecting to Google..." : "Choose Gmail / Google Account"}</span>
              </button>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Sign-In:</strong> Connect your Google account to access registered events, certificates, and portals immediately.
                </span>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="text-micro text-muted-foreground bg-card px-3">
                  or continue with email credentials
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
                <div className="flex items-center justify-between">
                  <span className="text-caption text-muted-foreground">Email address</span>
                  {suggestedAccount && !email && (
                    <button
                      type="button"
                      onClick={() => setEmail(suggestedAccount.email)}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="size-2.5" /> Use {suggestedAccount.email}
                    </button>
                  )}
                </div>
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
                className="w-full bg-primary text-primary-foreground h-11 rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0_0_24px_-4px_var(--primary-glow)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                <span>
                  {loading
                    ? "Authenticating (1-2s)..."
                    : mode === "signin"
                    ? "Sign In with Email"
                    : "Create Account with Email"}
                </span>
              </button>
            </form>

            {/* Quick Persona Instant Login for Local Testing */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 text-center">
                Developer Fast-Access Personas
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatedGoogleSignIn("student")}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
                >
                  <GraduationCap className="size-4 text-violet-500" />
                  <span>Participant</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedGoogleSignIn("organizer")}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
                >
                  <Briefcase className="size-4 text-amber-500" />
                  <span>Organizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedGoogleSignIn("admin")}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold flex flex-col items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="size-4 text-rose-500" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-caption text-center mt-6 text-muted-foreground">
            Protected by Enginow Ignite security & Google OAuth session governance.{" "}
            <Link to="/" className="underline hover:text-foreground">
              Terms & Privacy
            </Link>
          </p>
        </div>

        {/* Google Account Chooser Modal */}
        <GoogleAccountChooserModal
          isOpen={isChooserOpen}
          onClose={() => setIsChooserOpen(false)}
          onSelectAccount={handleSelectGoogleAccount}
        />
      </section>
    </PageShell>
  );
}
