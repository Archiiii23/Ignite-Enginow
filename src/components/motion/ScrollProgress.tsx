import { motion, useScroll, useSpring } from "framer-motion";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

export function ScrollProgress() {
  const isReducedMotion = getPrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001,
  });

  if (isReducedMotion) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-glow to-accent z-[60] origin-left pointer-events-none"
    />
  );
}
