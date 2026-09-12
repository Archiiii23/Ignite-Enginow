import { motion } from "framer-motion";
import { ShieldCheck, Calendar } from "lucide-react";
import { usePlatformStore } from "@/lib/platform-store";

export function PopularOrganizers() {
  const { organizers, events } = usePlatformStore();
  const verifiedOrgs = organizers.filter((o) => o.verificationStatus === "verified");

  const orgData = verifiedOrgs.map((org) => ({
    ...org,
    eventCount: events.filter(
      (e) => e.organizerId === org.userId && e.approvalStatus === "published"
    ).length,
  }));

  // Fill with defaults if needed
  const displayOrgs = [
    ...orgData,
    ...(orgData.length < 3
      ? [
          {
            id: "static_1", userId: "s1", name: "Enginow Labs", email: "labs@enginow.io",
            orgName: "Enginow Labs", website: "https://labs.enginow.io",
            verificationStatus: "verified" as const, eventsCount: 8, joinedAt: "2026-01-10",
            eventCount: 8,
          },
          {
            id: "static_2", userId: "s2", name: "GDG India", email: "india@gdg.community",
            orgName: "GDG India", website: "https://gdg.community",
            verificationStatus: "verified" as const, eventsCount: 12, joinedAt: "2026-02-15",
            eventCount: 12,
          },
          {
            id: "static_3", userId: "s3", name: "IEEE Student Branch", email: "branch@ieee.org",
            orgName: "IEEE Student Branch", website: "https://ieee.org",
            verificationStatus: "verified" as const, eventsCount: 5, joinedAt: "2026-03-01",
            eventCount: 5,
          },
        ].slice(0, 3 - orgData.length)
      : []),
  ].slice(0, 6);

  if (displayOrgs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-eyebrow text-primary font-semibold">— Popular Organizers</span>
            <h2 className="mt-4 text-section-title">Trusted by the community</h2>
            <p className="mt-5 text-lead max-w-[50ch]">
              Verified organizers creating the events you love. Join thousands of participants.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayOrgs.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 border border-primary/10 grid place-items-center shrink-0 text-lg font-bold text-primary font-display">
                  {org.orgName?.[0] ?? org.name?.[0] ?? "O"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{org.orgName || org.name}</span>
                    {org.verificationStatus === "verified" && (
                      <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {org.eventCount} events
                    </span>
                    {org.verificationStatus === "verified" && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="size-3" /> Verified
                      </span>
                    )}
                  </div>
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary/70 hover:text-primary mt-1 truncate block transition-colors"
                    >
                      {org.website.replace("https://", "")}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
