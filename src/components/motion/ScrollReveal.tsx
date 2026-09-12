import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { easings, getPrefersReducedMotion } from "@/animations/motionConfig";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const isReducedMotion = getPrefersReducedMotion();

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = 32;
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: offset };
      case "down":
        return { opacity: 0, y: -offset };
      case "left":
        return { opacity: 0, x: -offset };
      case "right":
        return { opacity: 0, x: offset };
      case "none":
        return { opacity: 0 };
    }
  };

  const variants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: easings.customSmooth,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
