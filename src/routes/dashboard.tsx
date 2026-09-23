import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth-context";
import { StudentPortal } from "@/components/dashboard/StudentPortal";
import { OrganizerPortal } from "@/components/dashboard/OrganizerPortal";
import { AdminPortal } from "@/components/dashboard/AdminPortal";

import { Link } from "@/lib/router";
import { UserCheck, Briefcase, ShieldCheck, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user, loginWithGoogle } = useAuth();

  if (!user) {
    return (
      <PageShell>
        <section className="min-h-[75svh] grid place-items-center px-4 py-24">
          <div className="text-center max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
              <UserCheck className="size-7" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Access Your Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with your account or use fast-access dev personas to explore tickets, certificates, or organizer tools.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth"
                className="w-full h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <span>Sign in to Ignite</span>
                <ArrowRight className="size-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => loginWithGoogle({ role: "student", name: "Aarav Sharma", email: "aarav.sharma@campus.edu" })}
                  className="h-10 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="size-3.5 text-violet-500" />
                  <span>Participant</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginWithGoogle({ role: "organizer", name: "Elena Vance", email: "elena@devflow.org" })}
                  className="h-10 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Briefcase className="size-3.5 text-amber-500" />
                  <span>Organizer</span>
                </button>
              </div>
            </div>
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
