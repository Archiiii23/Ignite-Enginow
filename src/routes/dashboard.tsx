import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth-context";
import { StudentPortal } from "@/components/dashboard/StudentPortal";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { AdminPortal } from "@/components/dashboard/AdminPortal";

export default function Dashboard() {
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
