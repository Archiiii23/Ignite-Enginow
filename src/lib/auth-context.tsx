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
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
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
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Authentication request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    authRequest<{ user: UserProfile | null }>("session")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const loginWithGoogle = useCallback(async () => {
    throw new Error("Google sign-in is not configured");
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const profile = await authRequest<UserProfile>("login", { email, password });
    setUser(profile);
    return profile;
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, password: string) => {
    const profile = await authRequest<UserProfile>("signup", { name, email, password });
    setUser(profile);
    return profile;
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
    void fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void fetch("/api/auth/logout", { method: "POST", credentials: "include" });
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
