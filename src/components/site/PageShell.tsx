import type { ReactNode } from "react";
import { FloatingNav } from "@/components/site/FloatingNav";
import { Footer } from "@/components/site/Footer";

/**
 * PageShell — consistent nav + footer wrapper for all interior routes.
 * `variant` controls the base theme of the main content area.
 */
export function PageShell({
  children,
  variant = "light",
}: {
  children: ReactNode;
  variant?: "light" | "dark";
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <FloatingNav overDark={variant === "dark"} />
      <main className={variant === "dark" ? "theme-dark bg-background text-foreground" : ""}>
        {children}

      </main>
      <div className="theme-dark bg-background text-foreground">
        <Footer />
      </div>
    </div>
  );
}
