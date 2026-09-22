import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useLocation } from "@/lib/router";
import { gsap, ScrollTrigger } from "@/animations/scrollAnimations";
import { lenisDefaultOptions, getPrefersReducedMotion } from "@/animations/motionConfig";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Disable smooth scroll if reduced motion is requested or in SSR
    if (typeof window === "undefined" || getPrefersReducedMotion()) return;

    try {
      const lenis = new Lenis(lenisDefaultOptions);
      lenisRef.current = lenis;

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      const updateGSAP = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateGSAP);
      gsap.ticker.lagSmoothing(0);

      return () => {
        try {
          gsap.ticker.remove(updateGSAP);
          lenis.destroy();
        } catch {}
        lenisRef.current = null;
      };
    } catch (err) {
      console.warn("SmoothScroll failed to initialize, falling back to native scroll:", err);
    }
  }, []);

  // Reset scroll position smoothly on route changes
  useEffect(() => {
    try {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    } catch {}
  }, [location.pathname]);

  return <>{children}</>;
}
