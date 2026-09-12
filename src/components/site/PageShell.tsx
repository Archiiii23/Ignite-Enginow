import type { ReactNode } from "react";
import { FloatingNav } from "@/components/site/FloatingNav";
import { Footer } from "@/components/site/Footer";

/**
 * PageShell — consistent nav + footer wrapper for all interior routes.
 * `variant` controls the base theme of the main content area.
 */
export function PageShell({
  children,
}: {
  children: ReactNode;
  variant?: "light" | "dark";
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <FloatingNav />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
