import { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  MapPin,
  Sparkles,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Hash,
  Github,
  Linkedin,
  Code2,
  Users2,
  Shirt,
  Utensils,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { EventItem } from "@/data/events";
import type { Registration } from "@/lib/platform-store";
import { useAuth } from "@/lib/auth-context";

interface EventRegistrationModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRegistration: (formData: Partial<Registration>) => Promise<void>;
}

const COMMON_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PyTorch / AI",
  "Next.js",
  "Rust",
  "Cloud / DevOps",
  "PostgreSQL",
  "UI/UX Design",
  "Web3 / Crypto",
  "Cybersecurity",
];

export function EventRegistrationModal({
  event,
  isOpen,
  onClose,
  onSubmitRegistration,
}: EventRegistrationModalProps) {
  const { user } = useAuth();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("B.Tech / B.E. Computer Science");
  const [yearOfStudy, setYearOfStudy] = useState("3rd Year");
  const [rollNumber, setRollNumber] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "TypeScript"]);
  const [participationType, setParticipationType] = useState<"solo" | "team">("solo");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState<number>(3);
  const [teamRole, setTeamRole] = useState("Team Lead / Full Stack");
  const [reasonForAttending, setReasonForAttending] = useState("");
  const [tshirtSize, setTshirtSize] = useState("L");
  const [dietaryPreference, setDietaryPreference] = useState("Vegetarian");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill fields whenever modal opens or user updates
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFullName(user.name || "");
        setEmail(user.email || "");
        setCollege(user.college || "");
      }
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email address is required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8)
      errs.phone = "Valid contact number (at least 8 digits) is required";
    if (!college.trim()) errs.college = "College / University name is required";
    if (!degree.trim()) errs.degree = "Degree / Branch is required";
    if (!rollNumber.trim()) errs.rollNumber = "Student ID or Roll number is required";
    if (participationType === "team" && !teamName.trim())
      errs.teamName = "Team name is required for team registrations";
    if (!agreeTerms) errs.agreeTerms = "You must agree to the Code of Conduct";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitRegistration({
        userName: fullName.trim(),
        userEmail: email.trim(),
        college: college.trim(),
        phone: phone.trim(),
        degree: degree.trim(),
        yearOfStudy,
        rollNumber: rollNumber.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        experienceLevel,
        skills: selectedSkills,
        participationType,
        teamName: participationType === "team" ? teamName.trim() : undefined,
        teamSize: participationType === "team" ? teamSize : 1,
        teamRole: participationType === "team" ? teamRole : undefined,
        reasonForAttending: reasonForAttending.trim(),
        tshirtSize,
        dietaryPreference: event.mode === "Online" ? "None" : dietaryPreference,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-background/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-card border border-primary/25 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Subtle Radiant Corner Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-primary-glow/15 blur-3xl" />

          {/* Modal Header */}
          <div className="relative px-6 py-5 border-b border-border bg-card/60 backdrop-blur shrink-0 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {event.category}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  {event.mode}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {event.price === "Free" ? "Free Pass" : event.price}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                Register for {event.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary" /> {event.dateLabel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" /> {event.location}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-7 flex-1">
            {/* Note banner */}
            <div className="flex items-start gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl text-xs text-muted-foreground">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Please provide your complete, accurate student and event participation details.
                These credentials will be verified during event check-in and printed on your official pass.
              </span>
            </div>

            {/* SECTION 1: Personal & Academic Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <GraduationCap className="size-4 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase font-mono">
                  1. Student & Academic Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.fullName ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@college.edu"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.email ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Contact Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Phone / WhatsApp Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.phone ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* College / University Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    College / University Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology Madras"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.college ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.college && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.college}
                    </p>
                  )}
                </div>

                {/* Degree & Branch */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Degree & Specialization <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="B.Tech / B.E. Computer Science">B.Tech / B.E. Computer Science</option>
                    <option value="B.Tech Artificial Intelligence / Data Science">B.Tech AI / Data Science</option>
                    <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                    <option value="B.Tech Electronics & Communication">B.Tech Electronics & Comm.</option>
                    <option value="BCA / MCA (Computer Applications)">BCA / MCA</option>
                    <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                    <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
                    <option value="Other Engineering / Technical Degree">Other Technical Degree</option>
                  </select>
                </div>

                {/* Current Year of Study */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Year of Study <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year / Final Year (Senior)">4th Year / Final Year (Senior)</option>
                    <option value="Post-Graduate / Masters">Post-Graduate / Masters</option>
                    <option value="Recent Graduate (Batch of 2026)">Recent Graduate (Batch of 2026)</option>
                  </select>
                </div>

                {/* Student Roll / ID Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Student ID / College Roll Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 23CS0148 or CS-2023-998"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.rollNumber ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.rollNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Technical Profile & Social Links */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Code2 className="size-4 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase font-mono">
                  2. Technical Profile & Experience
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GitHub Profile URL */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    GitHub Profile URL
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* LinkedIn or Portfolio URL */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    LinkedIn / Portfolio URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-2">
                    Coding & Systems Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "Beginner", label: "Beginner", desc: "First hackathon / 0-1 yr" },
                      { id: "Intermediate", label: "Intermediate", desc: "1-3 yrs building projects" },
                      { id: "Advanced", label: "Advanced / Pro", desc: "Shipped apps / 3+ yrs" },
                    ].map((lvl) => (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => setExperienceLevel(lvl.id)}
                        className={`p-3 text-left rounded-xl border transition-all ${
                          experienceLevel === lvl.id
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border bg-secondary/40 hover:bg-secondary"
                        }`}
                      >
                        <div className="font-semibold text-xs text-foreground">{lvl.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills tags */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Primary Tech Skills / Areas of Interest
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SKILLS.map((skill) => {
                      const isSel = selectedSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            isSel
                              ? "bg-primary text-primary-foreground border-primary font-medium"
                              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {isSel ? "✓ " : "+ "}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Participation & Logistics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Users2 className="size-4 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase font-mono">
                  3. Participation & Preferences
                </h3>
              </div>

              {/* Solo vs Team */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  Registration Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setParticipationType("solo")}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      participationType === "solo"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    <div className="font-semibold text-xs text-foreground">Solo Builder</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Individual attendee pass
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipationType("team")}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      participationType === "team"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    <div className="font-semibold text-xs text-foreground">Team Entry</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Register as team captain / member
                    </div>
                  </button>
                </div>
              </div>

              {/* Team fields */}
              {participationType === "team" && (
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Team Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Quantum Pioneers"
                        className={`w-full h-10 px-3 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          errors.teamName ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.teamName && (
                        <p className="mt-1 text-[11px] text-destructive">{errors.teamName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Team Size (including you)
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value={2}>2 Members</option>
                        <option value={3}>3 Members</option>
                        <option value={4}>4 Members</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Your Team Role
                    </label>
                    <input
                      type="text"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      placeholder="e.g. Lead Developer, AI / ML Engineer, Frontend Dev"
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Why do you want to attend? / What do you hope to achieve?
                </label>
                <textarea
                  rows={2}
                  value={reasonForAttending}
                  onChange={(e) => setReasonForAttending(e.target.value)}
                  placeholder="Tell the organizers what excites you about this event or what project idea you wish to explore..."
                  className="w-full p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {/* Swag size & Dietary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Shirt className="size-3.5 text-primary" /> Swag / T-Shirt Size
                  </label>
                  <select
                    value={tshirtSize}
                    onChange={(e) => setTshirtSize(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                  </select>
                </div>

                {event.mode !== "Online" && (
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <Utensils className="size-3.5 text-primary" /> Dietary Preference (Venue Lunch)
                    </label>
                    <select
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Jain Food">Jain Vegetarian</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Terms & Code of Conduct */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded text-primary focus:ring-primary border-border bg-secondary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I represent that the information provided above is accurate and agree to follow the{" "}
                  <span className="text-foreground font-medium underline">
                    Enginow Code of Conduct
                  </span>
                  . I understand check-in at the venue or online gate requires an ID matching these details.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-all shadow-[0_0_24px_-4px_var(--primary-glow)] disabled:opacity-60"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Complete Registration & Get Ticket Pass
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
