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
    if (getPrefersReducedMotion() || !containerRef.current) return;

    const ctx = gsap.context(() => {
      callback(ctx, ScrollTrigger);
    }, containerRef);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

export { gsap, ScrollTrigger };
