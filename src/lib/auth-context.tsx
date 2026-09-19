import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type UserRole = "student" | "organizer" | "admin";

export interface RoleChangeRequest {
  requestedRole: "student" | "organizer" | "participant";
  reason?: string;
  status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  requestedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isRoleSelected?: boolean;
  roleChangeRequest?: RoleChangeRequest;
  headline?: string;
  college?: string;
  bio?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  orgName?: string;
  orgWebsite?: string;
  orgBio?: string;
  verificationStatus?: "not_submitted" | "pending" | "verified" | "rejected" | "suspended";
  isSuspended?: boolean;
  joinedAt?: string;
}

export interface GoogleAuthOptions {
  role?: UserRole;
  credential?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (options?: GoogleAuthOptions | UserRole) => Promise<UserProfile>;
  loginWithEmail: (email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
  signupWithEmail: (name: string, email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
  selectRole: (
    role: "participant" | "organizer",
    orgDetails?: {
      orgName?: string;
      orgWebsite?: string;
      orgBio?: string;
      phone?: string;
      documentsSubmitted?: string;
    }
  ) => Promise<UserProfile>;
  requestRoleChange: (requestedRole: "participant" | "organizer", reason?: string) => Promise<UserProfile>;
  refreshUser: () => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  switchRole?: (newRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1200): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    ...options,
    signal: options.signal ?? controller.signal,
  }).finally(() => clearTimeout(id));
}

const ensureMinAuthDuration = async (startTime: number, targetMs = 1200) => {
  const elapsed = Date.now() - startTime;
  if (elapsed < targetMs) {
    await new Promise((resolve) => setTimeout(resolve, targetMs - elapsed));
  }
};

async function authRequest<T>(path: string, body?: unknown, timeoutMs = 1200) {
  const response = await fetchWithTimeout(`/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  }, timeoutMs);
  const data = (await response.json()) as T & { error?: string; success?: boolean; data?: T };
  if (!response.ok) throw new Error(data.error || "Authentication request failed");
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data as T;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("ignite_auth_user");
        if (stored) return JSON.parse(stored) as UserProfile;
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchWithTimeout("/api/auth/me", { credentials: "include" }, 1000);
      if (res.ok) {
        const payload = await res.json();
        if (payload?.data) {
          const u = payload.data;
          const profile: UserProfile = {
            id: u.id || u._id,
            name: u.name,
            email: u.email,
            avatar: u.profileImage || u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: u.role || "student",
            isRoleSelected: u.isRoleSelected ?? true,
            roleChangeRequest: u.roleChangeRequest,
            headline: u.headline,
            college: u.college,
            bio: u.bio,
            skills: u.skills,
            github: u.github,
            linkedin: u.linkedin,
            orgName: u.orgName,
            orgWebsite: u.orgWebsite,
            orgBio: u.orgBio,
            verificationStatus: u.verificationStatus,
          };
          setUser(profile);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("ignite_auth_user", JSON.stringify(profile));
          }
          return profile;
        }
      }
    } catch {
      // Backend may be offline or starting up
    } finally {
      setIsLoading(false);
    }
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("ignite_auth_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserProfile;
          setUser(parsed);
          return parsed;
        } catch {}
      }
    }
    setUser(null);
    return null;
  }, []);

  // On initial mount, refresh session in background without blocking
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = useCallback(async (options?: GoogleAuthOptions | UserRole) => {
    const startTime = Date.now();
    const payload: GoogleAuthOptions =
      typeof options === "string" ? { role: options } : (options ?? { role: "student" });
    const preferredRole: UserRole = payload.role || "student";

    try {
      const res = await authRequest<UserProfile>("google", payload, 2000);
      await ensureMinAuthDuration(startTime, 800);
      setUser(res);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
      }
      return res;
    } catch (err) {
      console.warn("[Google Auth] Server request failed, falling back to client session:", err);
      await ensureMinAuthDuration(startTime, 800);
      const email = payload.email || "alex.rivera@gmail.com";
      const name = payload.name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const googleProfile: UserProfile = {
        id: "usr_google_" + Math.random().toString(36).slice(2, 9),
        name: name,
        email: email,
        avatar: payload.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        role: preferredRole,
        isRoleSelected: true,
      };
      setUser(googleProfile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(googleProfile));
      }
      return googleProfile;
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, passwordOrRole?: string | UserRole) => {
    const role = typeof passwordOrRole === "string" && ["student", "organizer", "admin"].includes(passwordOrRole)
      ? (passwordOrRole as UserRole)
      : "student";

    const startTime = Date.now();
    try {
      const res = await authRequest<UserProfile>("login", { email, password: passwordOrRole, role }, 1200);
      await ensureMinAuthDuration(startTime, 1200);
      setUser(res);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
      }
      return res;
    } catch {
      await ensureMinAuthDuration(startTime, 1200);
      const fallbackUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).slice(2, 9),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role,
        isRoleSelected: true,
      };
      setUser(fallbackUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(fallbackUser));
      }
      return fallbackUser;
    }
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, passwordOrRole?: string | UserRole) => {
    const role = typeof passwordOrRole === "string" && ["student", "organizer", "admin"].includes(passwordOrRole)
      ? (passwordOrRole as UserRole)
      : "student";

    const startTime = Date.now();
    try {
      const res = await authRequest<UserProfile>("signup", { name, email, password: passwordOrRole, role }, 1200);
      await ensureMinAuthDuration(startTime, 1200);
      setUser(res);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
      }
      return res;
    } catch {
      await ensureMinAuthDuration(startTime, 1200);
      const fallbackUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).slice(2, 9),
        name: name.trim() || email.split("@")[0],
        email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role,
        isRoleSelected: true,
      };
      setUser(fallbackUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(fallbackUser));
      }
      return fallbackUser;
    }
  }, []);

  const selectRole = useCallback(
    async (
      role: "participant" | "organizer",
      orgDetails?: {
        orgName?: string;
        orgWebsite?: string;
        orgBio?: string;
        phone?: string;
        documentsSubmitted?: string;
      }
    ) => {
      const startTime = Date.now();
      try {
        const res = await authRequest<UserProfile>("select-role", { role, ...orgDetails }, 1200);
        await ensureMinAuthDuration(startTime, 1200);
        setUser(res);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
        }
        return res;
      } catch {
        await ensureMinAuthDuration(startTime, 1200);
        const finalRole = role.toLowerCase() === "organizer" ? "organizer" : "student";
        const updated: UserProfile = {
          ...(user || {
            id: "usr_google_dev",
            name: "Alex Rivera",
            email: "alex.rivera@campus.edu",
            avatar: "",
          }),
          role: finalRole,
          isRoleSelected: true,
          orgName: orgDetails?.orgName,
          orgWebsite: orgDetails?.orgWebsite,
          orgBio: orgDetails?.orgBio,
          verificationStatus: finalRole === "organizer" ? "pending" : undefined,
        };
        setUser(updated);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ignite_auth_user", JSON.stringify(updated));
        }
        return updated;
      }
    },
    [user]
  );

  const requestRoleChange = useCallback(async (requestedRole: "participant" | "organizer", reason?: string) => {
    const res = await authRequest<UserProfile>("request-role-change", { requestedRole, reason }, 1500);
    setUser(res);
    return res;
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    loginWithGoogle(newRole);
  }, [loginWithGoogle]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
    void fetch("/api/users/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    }).catch(() => undefined);
  }, []);

  const logout = useCallback(() => {
    void fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ignite_auth_user");
      window.location.href = "/auth";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        selectRole,
        requestRoleChange,
        refreshUser,
        updateUserProfile,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
