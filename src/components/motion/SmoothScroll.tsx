import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useRouterState } from "@tanstack/react-router";
import { gsap, ScrollTrigger } from "@/animations/scrollAnimations";
import { lenisDefaultOptions, getPrefersReducedMotion } from "@/animations/motionConfig";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const routerState = useRouterState();

  useEffect(() => {
    // Disable smooth scroll if reduced motion is requested
    if (getPrefersReducedMotion()) return;

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
      gsap.ticker.remove(updateGSAP);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll position smoothly on route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [routerState.location.pathname]);

  return <>{children}</>;
}
