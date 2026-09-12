import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cardHoverVariants } from "@/animations/motionVariants";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = "", ...props }: AnimatedCardProps) {
  const isReducedMotion = getPrefersReducedMotion();

  if (isReducedMotion) {
    return <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardHoverVariants}
      className={`bg-card border border-border rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
