import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";
import { StudentPortal } from "@/components/dashboard/StudentPortal";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { AdminPortal } from "@/components/dashboard/AdminPortal";
import { RoleSelectionModal } from "@/components/auth/RoleSelectionModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: pageMeta({
      title: "Dashboard",
      description: "Your Enginow Ignite command center — events, attendees, and analytics.",
      socialDescription: "Manage events, attendees, and analytics from one premium dashboard.",
      path: "/dashboard",
      noindex: true,
    }),
    links: canonical("/dashboard"),
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageShell>
        <section className="min-h-[70svh] grid place-items-center px-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You are not signed in.</p>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              Sign in to access dashboard
            </a>
          </div>
        </section>
      </PageShell>
    );
  }

  // If user signed in with Google for the first time and has not selected a role
  if (user.isRoleSelected === false) {
    return (
      <PageShell>
        <RoleSelectionModal isOpen={true} />
        <section className="min-h-[70svh] grid place-items-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Role Onboarding Required</h2>
            <p className="text-sm text-muted-foreground">
              Please choose whether you will participate as a Participant or host as an Organizer to access your dashboard.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Role-specific portal with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={user.role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {user.role === "student" && <StudentPortal />}
          {user.role === "organizer" && <OrganizerPortal />}
          {user.role === "admin" && <AdminPortal />}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  );
}
