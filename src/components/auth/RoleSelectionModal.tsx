import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ticket,
  BarChart3,
  Users2,
  Lock,
  Loader2,
  Building2,
  Globe,
  FileText,
  Phone,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function RoleSelectionModal({ isOpen, onSuccess }: RoleSelectionModalProps) {
  const { user, selectRole } = useAuth();
  const [step, setStep] = useState<"choose_role" | "organizer_details">("choose_role");
  const [selected, setSelected] = useState<"participant" | "organizer">("participant");
  const [loading, setLoading] = useState(false);

  // Organizer Details Form State
  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgBio, setOrgBio] = useState("");
  const [phone, setPhone] = useState("");
  const [documentsSubmitted, setDocumentsSubmitted] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleNextOrConfirm = async () => {
    if (selected === "organizer" && step === "choose_role") {
      setStep("organizer_details");
      return;
    }

    // If participant, confirm directly
    if (selected === "participant") {
      setLoading(true);
      try {
        await selectRole("participant");
        toast.success(`Welcome to Ignite Enginow! You are registered as a Participant.`);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        toast.error(err.message || "Failed to confirm role selection.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // If submitting organizer details:
    const errs: Record<string, string> = {};
    if (!orgName.trim()) errs.orgName = "Organization or Community name is required";
    if (!orgWebsite.trim()) errs.orgWebsite = "Official website or community URL is required";
    if (!documentsSubmitted.trim()) errs.documentsSubmitted = "Please describe verification proof or documentation";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await selectRole("organizer", {
        orgName: orgName.trim(),
        orgWebsite: orgWebsite.trim(),
        orgBio: orgBio.trim(),
        phone: phone.trim(),
        documentsSubmitted: documentsSubmitted.trim(),
      });
      toast.success(
        "Organizer profile submitted! Our administrator team will review your credentials shortly."
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit organizer profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden relative"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Stepper indicator for Organizer Flow */}
          {selected === "organizer" && (
            <div className="flex items-center justify-center gap-2 mb-4 text-xs font-mono text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-md ${step === "choose_role" ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-foreground"}`}>
                Step 2: Role Selection
              </span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded-md ${step === "organizer_details" ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-muted-foreground"}`}>
                Step 3 & 4: Organizer Profile
              </span>
            </div>
          )}

          {step === "choose_role" ? (
            <div className="overflow-y-auto">
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
                  Hello <span className="font-semibold text-foreground">{user?.name || "there"}</span>! Choose your role to access customized dashboards and workflows.
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
                        Instant Access
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
                        <span>Download QR passes & tickets</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users2 className="size-3.5 text-primary shrink-0" />
                        <span>Participate solo or with teams</span>
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
                        Admin Approval
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
                        <span>Manage participant rosters & check-in</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="size-3.5 text-amber-500 shrink-0" />
                        <span>Requires administrator review & verification</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border text-xs text-muted-foreground flex items-start gap-3 mb-6">
                <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Approval Workflow:</span>{" "}
                  Selecting <strong>Organizer</strong> will prompt you to enter your organization details and credentials. Once submitted, your profile will be reviewed by platform administrators before event listings can be published.
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleNextOrConfirm}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95 transition-opacity shadow-[0_0_24px_-4px_var(--primary-glow)] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {selected === "participant" ? "Confirm as Participant" : "Next: Enter Organizer Details"}
                      </span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-5">
              {/* Header */}
              <div>
                <button
                  type="button"
                  onClick={() => setStep("choose_role")}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
                >
                  <ArrowLeft className="size-3.5" /> Back to role selection
                </button>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                  Step 3: Organization Details
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Please provide your organization or community information. Platform administrators will review your credentials to approve your organizer account.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Org Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Organization / Community / Club Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. DevSphere Foundation / IITM Coding Club"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.orgName ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.orgName && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.orgName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Website */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Official Website / Link <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        placeholder="https://devsphere.org"
                        className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          errors.orgWebsite ? "border-destructive" : "border-border"
                        }`}
                      />
                    </div>
                    {errors.orgWebsite && (
                      <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.orgWebsite}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Contact Phone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Org Bio */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Organization Mission / Description
                  </label>
                  <textarea
                    rows={2}
                    value={orgBio}
                    onChange={(e) => setOrgBio(e.target.value)}
                    placeholder="Brief overview of past events, student community size, or organization objectives..."
                    className="w-full p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                {/* Documents / Proof */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Verification Documents & Proof Note <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <textarea
                      rows={2}
                      value={documentsSubmitted}
                      onChange={(e) => setDocumentsSubmitted(e.target.value)}
                      placeholder="e.g. University Club Approval Letter PDF link, Certificate of Incorporation, or Domain TXT record for verification"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/50 border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none ${
                        errors.documentsSubmitted ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.documentsSubmitted && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.documentsSubmitted}
                    </p>
                  )}
                </div>
              </div>

              {/* Review Timeline Alert */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-muted-foreground">
                <Clock className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Step 4 & 5: Submission & Admin Review:</strong>{" "}
                  Submitting this form places your organizer profile into <em>Pending Review</em>. Our platform administrators review applications promptly to enable event publishing.
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep("choose_role")}
                  className="px-4 h-10 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextOrConfirm}
                  disabled={loading}
                  className="px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-95 shadow-[0_0_24px_-4px_var(--primary-glow)] flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting Profile...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>Submit Profile for Admin Review</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
