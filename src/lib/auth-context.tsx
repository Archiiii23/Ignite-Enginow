import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  loginWithEmail: (email: string, role?: UserRole) => Promise<UserProfile>;
  signupWithEmail: (name: string, email: string, role: UserRole) => Promise<UserProfile>;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const STORAGE_KEY = "ignite-auth-user";

const defaultProfiles: Record<UserRole, UserProfile> = {
  student: {
    id: "usr_student_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "student",
    headline: "CS & AI Undergraduate · Hackathon Enthusiast",
    college: "Indian Institute of Technology (IIT)",
    bio: "Passionate about machine learning, distributed systems, and competitive coding. Built 3 hackathon-winning projects.",
    skills: ["Python", "PyTorch", "React", "TypeScript", "FastAPI"],
    github: "github.com/aaravsharma",
    linkedin: "linkedin.com/in/aaravsharma",
  },
  organizer: {
    id: "usr_org_1",
    name: "DevSphere Foundation",
    email: "events@devsphere.org",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "organizer",
    headline: "Global Technical Community & Hackathon Organizers",
    orgName: "DevSphere Foundation",
    orgWebsite: "https://devsphere.org",
    orgBio: "Empowering 50,000+ engineers worldwide through open hackathons, bootcamps, and developer workshops.",
    verificationStatus: "verified",
  },
  admin: {
    id: "usr_admin_1",
    name: "Sarah Chen (Admin)",
    email: "sarah.chen@enginow.io",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    headline: "Platform Operations & Governance Lead",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return defaultProfiles.student;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    // Default logged in as student for seamless first-load demonstration
    return defaultProfiles.student;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const loginWithGoogle = useCallback(async (preferredRole: UserRole = "student") => {
    // Realistic simulation: pick or build Google profile
    const base = defaultProfiles[preferredRole];
    const googleUser: UserProfile = {
      ...base,
      id: `google_${Date.now()}`,
      email: preferredRole === "student" ? "student.demo@gmail.com" : preferredRole === "organizer" ? "organizer.demo@gmail.com" : "admin.demo@enginow.io",
      name: preferredRole === "student" ? "Aarav Sharma (Google)" : preferredRole === "organizer" ? "DevSphere (Google)" : "Sarah Chen (Google Admin)",
      role: preferredRole,
    };
    setUser(googleUser);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: googleUser.email, role: googleUser.role }),
    }).catch(() => undefined);
    return googleUser;
  }, []);

  const loginWithEmail = useCallback(async (email: string, role: UserRole = "student") => {
    const base = defaultProfiles[role];
    const newUser: UserProfile = {
      ...base,
      id: `usr_${Date.now()}`,
      email,
      name: email.split("@")[0],
      role,
    };
    setUser(newUser);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role }),
    }).catch(() => undefined);
    return newUser;
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, role: UserRole) => {
    const base = defaultProfiles[role];
    const newUser: UserProfile = {
      ...base,
      id: `usr_${Date.now()}`,
      email,
      name,
      role,
    };
    setUser(newUser);
    fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    }).catch(() => undefined);
    return newUser;
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setUser((current) => {
      const base = defaultProfiles[newRole];
      const updated = {
        ...base,
        id: current ? current.id : base.id,
      };
      fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => undefined);
      return updated;
    });
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...updates };
      fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => undefined);
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
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
        switchRole,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
