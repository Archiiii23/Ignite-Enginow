import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Ticket,
  BarChart3,
  Users2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function RoleSelectionModal({ isOpen, onSuccess }: RoleSelectionModalProps) {
  const { user, selectRole } = useAuth();
  const [selected, setSelected] = useState<"participant" | "organizer">("participant");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await selectRole(selected);
      toast.success(
        `Welcome to Ignite Enginow! You are registered as a ${
          selected === "participant" ? "Participant" : "Organizer"
        }.`
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm role selection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden relative"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
              <Sparkles className="size-3.5" />
              <span>Welcome to Ignite Enginow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Select Your Platform Role
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Hello <span className="font-semibold text-foreground">{user?.name || "there"}</span>! To personalize your experience and workflows, choose your primary role on Ignite Enginow.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Participant Card */}
            <div
              onClick={() => setSelected("participant")}
              className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                selected === "participant"
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-foreground/20 bg-card/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <GraduationCap className="size-6" />
                  </div>
                  {selected === "participant" ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <div className="size-5 rounded-full border border-border" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">Participant</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Default
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  For students, engineers, and developers looking to learn, compete, and connect.
                </p>

                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Ticket className="size-3.5 text-primary shrink-0" />
                    <span>Register for hackathons & events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <span>Download QR passes & earn certificates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users2 className="size-3.5 text-primary shrink-0" />
                    <span>Find teams & network with peers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Organizer Card */}
            <div
              onClick={() => setSelected("organizer")}
              className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                selected === "organizer"
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-foreground/20 bg-card/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Briefcase className="size-6" />
                  </div>
                  {selected === "organizer" ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <div className="size-5 rounded-full border border-border" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">Organizer</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    Host
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  For communities, universities, and organizations hosting technical events.
                </p>

                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Briefcase className="size-3.5 text-amber-500 shrink-0" />
                    <span>Create & publish technical events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users2 className="size-3.5 text-amber-500 shrink-0" />
                    <span>Manage registrations & check-ins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="size-3.5 text-amber-500 shrink-0" />
                    <span>Access organizer analytics & exports</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important governance note */}
          <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border text-xs text-muted-foreground flex items-start gap-3 mb-6">
            <Lock className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Role Governance Notice:</span>{" "}
              Once confirmed, your role is locked to prevent unauthorized privilege escalation. Changing your role later requires submitting a formal request that must be approved by a platform administrator.
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0_0_24px_-4px_var(--primary-glow)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Confirming Role...</span>
              ) : (
                <>
                  <span>Confirm as {selected === "participant" ? "Participant" : "Organizer"}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
