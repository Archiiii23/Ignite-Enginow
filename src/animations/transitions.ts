import type { Variants } from "framer-motion";
import { easings } from "./motionConfig";

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.customSmooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: easings.gentle },
  },
};
