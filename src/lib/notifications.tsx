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
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Bell } from "lucide-react";

export type NotificationType = "success" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: number;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = "ignite-notifications";
const MAX_STORED = 30;
const AUTO_DISMISS_MS = 5000;

const typeConfig: Record<NotificationType, { icon: typeof CheckCircle2; cls: string; bar: string }> = {
  success: { icon: CheckCircle2, cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  info: { icon: Info, cls: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  error: { icon: XCircle, cls: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400", bar: "bg-red-500" },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
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

  const addNotification = useCallback((title: string, message: string, type: NotificationType = "info") => {
    const n: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      type,
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
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearNotification }}>
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
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
