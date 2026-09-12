import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { canonical, pageMeta } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";
import { StudentPortal } from "@/components/dashboard/StudentPortal";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { AdminPortal } from "@/components/dashboard/AdminPortal";
import { GraduationCap, Briefcase, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: pageMeta({
      title: "Dashboard",
      description:
        "Your Enginow Ignite command center — events, attendees, and analytics.",
      socialDescription:
        "Manage events, attendees, and analytics from one premium dashboard.",
      path: "/dashboard",
      noindex: true,
    }),
    links: canonical("/dashboard"),
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, switchRole } = useAuth();

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

  return (
    <PageShell>
      {/* Role switcher floating bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl"
        >
          <span className="text-[11px] text-muted-foreground px-2 font-medium">Switch role:</span>
          {([
            ["student", "Student", GraduationCap],
            ["organizer", "Organizer", Briefcase],
            ["admin", "Admin", ShieldCheck],
          ] as const).map(([role, label, Icon]) => (
            <motion.button
              key={role}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchRole(role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                user.role === role
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_-2px_var(--primary-glow)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </motion.button>
          ))}
        </motion.div>
      </div>

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
