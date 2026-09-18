import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Bell, Calendar, Clock, Award, Sparkles } from "lucide-react";

export type NotificationType = "success" | "info" | "warning" | "error";

export type NotificationCategory =
  | "registration_success"
  | "approval_status"
  | "event_published"
  | "event_rejected"
  | "registration_closing"
  | "event_reminder"
  | "general";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
  createdAt: number;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType, category?: NotificationCategory) => void;
  notifyRegistrationSuccess: (eventTitle: string, ticketCode?: string) => void;
  notifyApprovalStatus: (entityName: string, status: "approved" | "rejected", reason?: string) => void;
  notifyEventPublished: (eventTitle: string) => void;
  notifyEventRejected: (eventTitle: string, reason?: string) => void;
  notifyRegistrationClosing: (eventTitle: string, hoursLeft?: number) => void;
  notifyEventReminder: (eventTitle: string, timeLabel?: string) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = "ignite-notifications-v2";
const MAX_STORED = 40;
const AUTO_DISMISS_MS = 5000;

// Seed notifications explicitly demonstrating the 6 required notification categories
const defaultNotificationsSeed: Notification[] = [
  {
    id: "notif_seed_1",
    title: "Registration Success 🎉",
    message: "You have successfully registered for Quantum Hack 2026. Your access pass #IGN-QNT-8812 is confirmed.",
    type: "success",
    category: "registration_success",
    createdAt: Date.now() - 1000 * 60 * 25, // 25m ago
    read: false,
  },
  {
    id: "notif_seed_2",
    title: "Approval Status: Verified ✓",
    message: "Congratulations! Your organizer credentials for 'DevSphere Foundation' have been approved by Admin.",
    type: "success",
    category: "approval_status",
    createdAt: Date.now() - 1000 * 60 * 120, // 2h ago
    read: false,
  },
  {
    id: "notif_seed_3",
    title: "Event Published 🚀",
    message: "Your event 'Designing Systems That Scale' has been approved and is now live and accepting registrations.",
    type: "info",
    category: "event_published",
    createdAt: Date.now() - 1000 * 60 * 360, // 6h ago
    read: true,
  },
  {
    id: "notif_seed_4",
    title: "Event Rejected ⚠️",
    message: "Submission for 'AI Model Workshop 101' requires detailed agenda & speaker verification before approval.",
    type: "warning",
    category: "event_rejected",
    createdAt: Date.now() - 1000 * 60 * 720, // 12h ago
    read: true,
  },
  {
    id: "notif_seed_5",
    title: "Registration Closing Soon ⏳",
    message: "Only 4 hours remaining to register for 'LLMOps & Production Model Monitoring at Scale'. Seats filling fast.",
    type: "warning",
    category: "registration_closing",
    createdAt: Date.now() - 1000 * 60 * 1440, // 24h ago
    read: true,
  },
  {
    id: "notif_seed_6",
    title: "Event Reminder 🔔",
    message: "Reminder: 'Frontier AI & Generative Models Research Seminar' starts tomorrow at 09:30 AM. Check your ticket pass.",
    type: "info",
    category: "event_reminder",
    createdAt: Date.now() - 1000 * 60 * 2880, // 2d ago
    read: true,
  },
];

const typeConfig: Record<NotificationType, { icon: typeof CheckCircle2; cls: string; bar: string }> = {
  success: { icon: CheckCircle2, cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  info: { icon: Info, cls: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  error: { icon: XCircle, cls: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400", bar: "bg-red-500" },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return defaultNotificationsSeed;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : defaultNotificationsSeed;
      }
    } catch { /* ignore */ }
    return defaultNotificationsSeed;
  });

  // Toasts currently displayed (most recent 3)
  const [toasts, setToasts] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
    } catch { /* ignore */ }
  }, [notifications]);

  const addNotification = useCallback((
    title: string,
    message: string,
    type: NotificationType = "info",
    category: NotificationCategory = "general"
  ) => {
    const n: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      type,
      category,
      createdAt: Date.now(),
      read: false,
    };
    setNotifications((prev) => [n, ...prev].slice(0, MAX_STORED));
    setToasts((prev) => [n, ...prev].slice(0, 3));

    // Auto-dismiss toast
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== n.id));
      timersRef.current.delete(n.id);
    }, AUTO_DISMISS_MS);
    timersRef.current.set(n.id, timer);
  }, []);

  const notifyRegistrationSuccess = useCallback((eventTitle: string, ticketCode?: string) => {
    addNotification(
      "Registration Success 🎉",
      `You're confirmed for "${eventTitle}". ${ticketCode ? `Pass #${ticketCode} is issued.` : "Your pass has been generated."}`,
      "success",
      "registration_success"
    );
  }, [addNotification]);

  const notifyApprovalStatus = useCallback((entityName: string, status: "approved" | "rejected", reason?: string) => {
    if (status === "approved") {
      addNotification(
        "Approval Status: Approved ✓",
        `Your verification application for "${entityName}" was approved by the platform administrator.`,
        "success",
        "approval_status"
      );
    } else {
      addNotification(
        "Approval Status: Rejected ⚠️",
        `Application for "${entityName}" was rejected.${reason ? ` Reason: ${reason}` : ""}`,
        "warning",
        "approval_status"
      );
    }
  }, [addNotification]);

  const notifyEventPublished = useCallback((eventTitle: string) => {
    addNotification(
      "Event Published 🚀",
      `"${eventTitle}" is now publicly listed and open for registrations.`,
      "info",
      "event_published"
    );
  }, [addNotification]);

  const notifyEventRejected = useCallback((eventTitle: string, reason?: string) => {
    addNotification(
      "Event Rejected ⚠️",
      `"${eventTitle}" was not approved.${reason ? ` Reason: ${reason}` : " Please review platform guidelines and resubmit."}`,
      "error",
      "event_rejected"
    );
  }, [addNotification]);

  const notifyRegistrationClosing = useCallback((eventTitle: string, hoursLeft: number = 6) => {
    addNotification(
      "Registration Closing ⏳",
      `Registration for "${eventTitle}" will close in ${hoursLeft} hours. Complete your registration now.`,
      "warning",
      "registration_closing"
    );
  }, [addNotification]);

  const notifyEventReminder = useCallback((eventTitle: string, timeLabel: string = "tomorrow at 10:00 AM") => {
    addNotification(
      "Event Reminder 🔔",
      `Reminder: "${eventTitle}" is scheduled for ${timeLabel}. Check your ticket for venue access.`,
      "info",
      "event_reminder"
    );
  }, [addNotification]);

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        notifyRegistrationSuccess,
        notifyApprovalStatus,
        notifyEventPublished,
        notifyEventRejected,
        notifyRegistrationClosing,
        notifyEventReminder,
        markAllRead,
        clearNotification,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-4 z-[60] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const c = typeConfig[toast.type];
            const Icon = c.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl bg-card backdrop-blur-sm ${c.cls}`}
              >
                {/* Progress bar */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 ${c.bar}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
                />
                <div className="flex items-start gap-3 p-4 pr-10">
                  <Icon className="size-4 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{toast.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{toast.message}</div>
                  </div>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
}
