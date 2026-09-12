import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { buttonPressVariants } from "@/animations/motionVariants";
import { getPrefersReducedMotion } from "@/animations/motionConfig";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function AnimatedButton({ children, className = "", onClick, ...props }: AnimatedButtonProps) {
  const isReducedMotion = getPrefersReducedMotion();

  if (isReducedMotion) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={buttonPressVariants}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
