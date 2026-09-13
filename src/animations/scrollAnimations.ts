import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { getPrefersReducedMotion } from "./motionConfig";

// Ensure ScrollTrigger is registered safely once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook to create a GSAP ScrollTrigger timeline cleanly with lifecycle cleanup
 */
export function useGSAPScrollTrigger(
  callback: (ctx: gsap.Context, trigger: typeof ScrollTrigger) => void,
  deps: React.DependencyList = []
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || getPrefersReducedMotion() || !containerRef.current) return;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context((self) => {
        try {
          callback(self, ScrollTrigger);
        } catch (callbackErr) {
          console.warn("GSAP animation callback error:", callbackErr);
        }
      }, containerRef);
    } catch (err) {
      console.warn("GSAP ScrollTrigger context initialization failed:", err);
    }

    return () => {
      try {
        ctx?.revert();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

export { gsap, ScrollTrigger };
