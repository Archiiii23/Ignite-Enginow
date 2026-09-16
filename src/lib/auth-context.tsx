import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type UserRole = "student" | "organizer" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
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
  loginWithGoogle: (preferredRole?: UserRole) => Promise<UserProfile>;
  loginWithEmail: (email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
  signupWithEmail: (name: string, email: string, passwordOrRole?: string | UserRole) => Promise<UserProfile>;
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

  // On initial mount, fetch current authenticated session
  useEffect(() => {
    if (typeof window === "undefined") return;

    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.data) {
          const u = payload.data;
          setUser({
            id: u.id || u._id,
            name: u.name,
            email: u.email,
            avatar: u.profileImage || u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: u.role || "student",
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
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const loginWithGoogle = useCallback(async (preferredRole: UserRole = "student") => {
    const res = await authRequest<UserProfile>("demo-login", { role: preferredRole });
    setUser(res);
    return res;
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
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
