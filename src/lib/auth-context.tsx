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
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<UserProfile>;
  loginWithEmail: (email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
  signupWithEmail: (name: string, email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
  selectRole: (role: "participant" | "organizer") => Promise<UserProfile>;
  requestRoleChange: (requestedRole: "participant" | "organizer", reason?: string) => Promise<UserProfile>;
  refreshUser: () => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  switchRole?: (newRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function authRequest<T>(path: string, body?: unknown) {
  const response = await fetch(`/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as T & { error?: string; success?: boolean; data?: T };
  if (!response.ok) throw new Error(data.error || "Authentication request failed");
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data as T;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
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

  // On initial mount, fetch current authenticated session
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = useCallback(async (preferredRole: UserRole = "student") => {
    try {
      const res = await authRequest<UserProfile>("demo-login", { role: preferredRole });
      setUser(res);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
      }
      return res;
    } catch {
      const googleProfile: UserProfile = {
        id: "usr_google_" + Math.random().toString(36).slice(2, 9),
        name: "Alex Rivera",
        email: "alex.rivera@campus.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: preferredRole,
        isRoleSelected: false,
        accountStatus: "active",
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

    try {
      const res = await authRequest<UserProfile>("login", { email, password: passwordOrRole, role });
      setUser(res);
      return res;
    } catch {
      return loginWithGoogle(role);
    }
  }, [loginWithGoogle]);

  const signupWithEmail = useCallback(async (name: string, email: string, passwordOrRole?: string | UserRole) => {
    const role = typeof passwordOrRole === "string" && ["student", "organizer", "admin"].includes(passwordOrRole)
      ? (passwordOrRole as UserRole)
      : "student";

    try {
      const res = await authRequest<UserProfile>("signup", { name, email, password: passwordOrRole, role });
      setUser(res);
      return res;
    } catch {
      return loginWithGoogle(role);
    }
  }, [loginWithGoogle]);

  const selectRole = useCallback(async (role: "participant" | "organizer") => {
    try {
      const res = await authRequest<UserProfile>("select-role", { role });
      setUser(res);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(res));
      }
      return res;
    } catch {
      const finalRole = role.toLowerCase() === "organizer" ? "organizer" : "student";
      const updated: UserProfile = {
        ...(user || {
          id: "usr_google_dev",
          name: "Alex Rivera",
          email: "alex.rivera@campus.edu",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        }),
        role: finalRole,
        isRoleSelected: true,
      };
      setUser(updated);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ignite_auth_user", JSON.stringify(updated));
      }
      return updated;
    }
  }, [user]);

  const requestRoleChange = useCallback(async (requestedRole: "participant" | "organizer", reason?: string) => {
    const res = await authRequest<UserProfile>("request-role-change", { requestedRole, reason });
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
