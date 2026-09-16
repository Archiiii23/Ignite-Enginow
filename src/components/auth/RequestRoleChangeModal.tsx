import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface RequestRoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestRoleChangeModal({ isOpen, onClose }: RequestRoleChangeModalProps) {
  const { user, requestRoleChange } = useAuth();
  const currentRole = user?.role === "organizer" ? "Organizer" : user?.role === "admin" ? "Admin" : "Participant";
  const defaultTarget = user?.role === "organizer" ? "participant" : "organizer";

  const [requestedRole, setRequestedRole] = useState<"participant" | "organizer">(defaultTarget);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const pendingRequest = user.roleChangeRequest?.status === "PENDING" ? user.roleChangeRequest : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a brief justification for this role change.");
      return;
    }

    setLoading(true);
    try {
      await requestRoleChange(requestedRole, reason.trim());
      toast.success("Role change request submitted! An administrator will review your request.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit role change request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Request Role Change</h3>
              <p className="text-xs text-muted-foreground">
                Current role: <span className="font-semibold text-primary">{currentRole}</span>
              </p>
            </div>
          </div>

          {/* If there is already a pending request */}
          {pendingRequest ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm mb-1">
                <Clock className="size-4" />
                <span>Request Under Administrator Review</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You currently have an active request to change your role to{" "}
                <span className="font-bold text-foreground capitalize">
                  {pendingRequest.requestedRole === "student" ? "Participant" : pendingRequest.requestedRole}
                </span>
                . Our moderation team reviews role change requests within 24 hours.
              </p>
              {pendingRequest.reason && (
                <div className="mt-2 text-xs italic text-muted-foreground/90 bg-background/60 p-2 rounded-lg">
                  "{pendingRequest.reason}"
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
                <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  Per Enginow Ignite security policy, roles are locked after initial onboarding. Any switch between <span className="font-medium text-foreground">Participant</span> and <span className="font-medium text-foreground">Organizer</span> requires administrative authorization.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Select Requested Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRequestedRole("participant")}
                    disabled={user.role === "student"}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      requestedRole === "participant"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : user.role === "student"
                        ? "opacity-50 cursor-not-allowed border-border"
                        : "border-border hover:border-foreground/20 text-muted-foreground"
                    }`}
                  >
                    Participant
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                      Attend events & competitions
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestedRole("organizer")}
                    disabled={user.role === "organizer"}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      requestedRole === "organizer"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : user.role === "organizer"
                        ? "opacity-50 cursor-not-allowed border-border"
                        : "border-border hover:border-foreground/20 text-muted-foreground"
                    }`}
                  >
                    Organizer
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                      Create events & manage check-ins
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for Role Change <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are requesting this role change (e.g. Hosting upcoming hackathons, campus club representative)..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-10 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity shadow-[0_0_20px_-4px_var(--primary-glow)] flex items-center gap-1.5"
                >
                  {loading ? "Submitting..." : "Submit for Admin Approval"}
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
