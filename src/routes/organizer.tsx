import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { Briefcase, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: pageMeta({
      title: "Organizer Dashboard — Enginow Ignite",
      description: "Manage events, review attendee rosters, track registrations, and monitor analytics.",
      path: "/organizer",
      noindex: true,
    }),
    links: canonical("/organizer"),
  }),
  component: OrganizerRoute,
});

function OrganizerRoute() {
  const { user, isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToOrganizer = async () => {
    try {
      await loginWithGoogle({
        role: "organizer",
        email: "organizer@enginow.ignite",
        name: "Alex DevSphere",
      });
      toast.success("Switched to Organizer persona!");
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
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center mx-auto mb-4">
              <Briefcase className="size-7" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Organizer Access Required
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              You must be signed in with an organizer account to host events, manage registrations, and view analytics.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth"
                className="w-full h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <span>Sign in to Ignite</span>
                <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={handleSwitchToOrganizer}
                className="w-full h-11 px-5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <Briefcase className="size-4 text-amber-500" />
                <span>Fast Access as Organizer (Dev Mode)</span>
              </button>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  // If logged in as participant (student), allow fast elevation to organizer
  if (user.role === "student") {
    return (
      <PageShell>
        <section className="min-h-[75svh] grid place-items-center px-4 py-24">
          <div className="text-center max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">
              Organizer Privileges Required
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              You are currently signed in as <strong className="text-foreground">{user.name}</strong> with the{" "}
              <span className="font-semibold text-primary">Participant</span> role.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              To publish hackathons and review registrant rosters, switch to an organizer profile.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSwitchToOrganizer}
                className="w-full h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <CheckCircle2 className="size-4" />
                <span>Switch to Organizer Persona (Dev Mode)</span>
              </button>
              <Link
                to="/dashboard"
                className="w-full h-11 px-5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <span>Go to Student Portal</span>
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  // Render full OrganizerPortal for organizer and admin
  return (
    <PageShell>
      <OrganizerPortal />
    </PageShell>
  );
}
