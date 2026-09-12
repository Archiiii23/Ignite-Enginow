import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number; // negative moves up faster, positive moves down
  springy?: boolean;
}

export function Parallax({
  children,
  className = "",
  speed = -40,
  springy = true,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReducedMotion = getPrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const springY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const y = springy ? springY : rawY;

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
