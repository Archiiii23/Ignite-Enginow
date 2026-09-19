import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";
import { AdminPortal } from "@/components/dashboard/AdminPortal";
import { ShieldCheck, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: pageMeta({
      title: "Admin Dashboard — Enginow Ignite",
      description: "Platform governance, user management, organizer approvals, and event moderation.",
      path: "/admin",
      noindex: true,
    }),
    links: canonical("/admin"),
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const { user, isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToAdmin = async () => {
    try {
      await loginWithGoogle({ role: "admin", email: "admin@enginow.ignite", name: "Sarah Chen (Admin)" });
      toast.success("Switched to Admin persona!");
    } catch (err: any) {
      toast.error(err.message || "Failed to switch role");
    }
  };

  // If not logged in
  if (!isAuthenticated || !user) {
    return (
      <PageShell>
        <section className="min-h-[75svh] grid place-items-center px-4 py-24">
          <div className="text-center max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-500 grid place-items-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Admin Access Required
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              You must be signed in with an administrator account to view the platform governance dashboard.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth"
                className="w-full h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                <span>Sign in to Ignite</span>
                <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={handleSwitchToAdmin}
                className="w-full h-11 px-5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck className="size-4 text-rose-500" />
                <span>Fast Access as Admin (Dev Mode)</span>
              </button>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  // If logged in as non-admin
  if (user.role !== "admin") {
    return (
      <PageShell>
        <section className="min-h-[75svh] grid place-items-center px-4 py-24">
          <div className="text-center max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">
              Elevated Privileges Required
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              You are currently signed in as <strong className="text-foreground">{user.name}</strong> with role{" "}
              <span className="capitalize font-semibold text-primary">{user.role === "student" ? "Participant" : user.role}</span>.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Administrator authority is required to manage users, approve organizers, and inspect analytics.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSwitchToAdmin}
                className="w-full h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <ShieldCheck className="size-4" />
                <span>Elevate to Admin Persona (Dev Mode)</span>
              </button>
              <Link
                to="/dashboard"
                className="w-full h-11 px-5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Return to My Dashboard</span>
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  // Admin user
  return (
    <PageShell>
      <AdminPortal />
    </PageShell>
  );
}
