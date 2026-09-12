import type { Options } from "lenis";

/**
 * Global Lenis smooth scroll configuration
 */
export const lenisDefaultOptions: Options = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
};

/**
 * Standard cubic-bezier easings for Framer Motion
 */
export const easings = {
  customSmooth: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
  springy: [0.68, -0.6, 0.32, 1.6] as const,
  snappy: [0.2, 0.8, 0.2, 1] as const,
};

/**
 * Springs for Framer Motion
 */
export const springPresets = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  snappy: { stiffness: 240, damping: 22, mass: 0.8 },
  bouncy: { stiffness: 350, damping: 15, mass: 0.5 },
  subtle: { stiffness: 90, damping: 18, mass: 1.2 },
};

/**
 * Check reduced motion preference dynamically
 */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
