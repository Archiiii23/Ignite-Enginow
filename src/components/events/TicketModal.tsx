import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, Printer, QrCode, X, Calendar, MapPin, Sparkles } from "lucide-react";
import type { Registration } from "@/lib/platform-store";
import logo from "@/assets/logo.png";

interface TicketModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketModal({ registration, isOpen, onClose }: TicketModalProps) {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadConfirmation = () => {
    const confirmationText = `=====================================================
ENGINOW IGNITE - OFFICIAL EVENT CONFIRMATION PASS
=====================================================
Event: ${registration.eventTitle}
Ticket Code: ${registration.ticketCode}
Seat Number: ${registration.seatNumber}
Date & Time: ${registration.eventDate}
Venue / Location: ${registration.eventLocation}

ATTENDEE DETAILS:
Name: ${registration.userName}
Email: ${registration.userEmail}
College: ${registration.college || "N/A"}
Phone: ${registration.phone || "N/A"}
Degree & Year: ${[registration.degree, registration.yearOfStudy].filter(Boolean).join(" · ") || "N/A"}
Student Roll ID: ${registration.rollNumber || "N/A"}
Participation: ${registration.participationType || "Solo"} ${registration.teamName ? `(Team: ${registration.teamName})` : ""}
Registered Date: ${new Date(registration.registeredAt).toLocaleString()}
Status: ${registration.status.toUpperCase()}

INSTRUCTIONS:
1. Please present this confirmation pass or QR Code at the registration desk.
2. Carry a valid student/government ID for verification.
3. For questions, contact support@enginow.io.
=====================================================`;

    const blob = new Blob([confirmationText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `confirmation-${registration.ticketCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-card border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Ambient radiant corner glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-primary-glow/20 blur-3xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close ticket"
            >
              <X className="size-5" />
            </button>

            {/* Ticket Header */}
            <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="Ignite" className="size-8 drop-shadow" />
                <div>
                  <div className="font-display font-bold text-sm tracking-tight">
                    Enginow <span className="text-primary font-extrabold">Ignite</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono">
                    Official Event Pass
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" /> Confirmed
              </span>
            </div>

            {/* Event Info Card */}
            <div className="space-y-4">
              <div>
                <span className="text-micro text-primary font-bold tracking-wider uppercase">
                  Event Access Pass
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground mt-0.5">
                  {registration.eventTitle}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/80 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Calendar className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-mono">Date & Time</div>
                    <div className="font-medium text-foreground">{registration.eventDate}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-mono">Venue / Mode</div>
                    <div className="font-medium text-foreground">{registration.eventLocation}</div>
                  </div>
                </div>
              </div>

              {/* Attendee Full Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-sm border-b border-border/80">
                <div>
                  <div className="text-[11px] text-muted-foreground font-mono">Attendee Name</div>
                  <div className="font-semibold text-foreground text-base">{registration.userName}</div>
                  <div className="text-xs text-muted-foreground truncate">{registration.userEmail}</div>
                  {registration.phone && (
                    <div className="text-xs text-primary font-mono mt-0.5">{registration.phone}</div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-mono">Institution / College</div>
                  <div className="font-medium text-foreground">{registration.college || "Independent Builder"}</div>
                  {(registration.degree || registration.yearOfStudy) && (
                    <div className="text-xs text-muted-foreground">
                      {[registration.degree, registration.yearOfStudy].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {registration.rollNumber && (
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Roll/ID: {registration.rollNumber}
                    </div>
                  )}
                </div>

                {/* Additional student metadata badges */}
                {(registration.teamName || registration.githubUrl || registration.seatNumber) && (
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-medium border border-primary/20">
                      Seat: {registration.seatNumber}
                    </span>
                    {registration.teamName && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium border border-border">
                        Team: {registration.teamName} {registration.teamRole ? `(${registration.teamRole})` : ""}
                      </span>
                    )}
                    {registration.tshirtSize && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono border border-border">
                        Size: {registration.tshirtSize}
                      </span>
                    )}
                    {registration.githubUrl && (
                      <a
                        href={registration.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-primary hover:underline font-mono border border-border"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* QR Code & Barcode Pass section */}
              <div className="mt-4 p-4 rounded-2xl bg-secondary/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-20 bg-background rounded-xl p-2 border border-border shadow-sm flex items-center justify-center">
                    <QrCode className="size-16 text-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono">Ticket Code</div>
                    <div className="text-base font-mono font-bold tracking-wider text-primary">
                      {registration.ticketCode}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Scan at entry desk for check-in
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadConfirmation}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Download className="size-3.5" /> Download Confirmation
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium hover:bg-secondary transition-colors"
                  >
                    <Printer className="size-3.5" /> Print / Save PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Footer notice */}
            <div className="mt-6 flex items-center justify-between text-caption text-muted-foreground border-t border-border pt-4">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="size-3 text-primary" /> Verified by Enginow Ignite
              </span>
              <span>Reg #{registration.id.slice(-6).toUpperCase()}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
