import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePlatformStore } from "@/lib/platform-store";

export function AnnouncementBanner() {
  const { announcements } = usePlatformStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeAnnouncements = announcements.filter((a) => a.active && !dismissed.has(a.id));

  if (activeAnnouncements.length === 0) return null;

  const ann = activeAnnouncements[0];

  const typeColors = {
    info: "bg-primary/10 border-primary/20 text-primary",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-b ${typeColors[ann.type]} overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3">
          <Megaphone className="size-3.5 shrink-0" />
          <Link
            to="/events"
            className="text-xs font-semibold flex-1 text-center hover:underline cursor-pointer inline-flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
          >
            <span>{ann.title}: {ann.message}</span>
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">Learn more →</span>
          </Link>
          <button
            onClick={() => setDismissed((prev) => new Set([...prev, ann.id]))}
            className="shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
