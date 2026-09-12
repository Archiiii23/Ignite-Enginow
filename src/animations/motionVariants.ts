import type { Variants } from "framer-motion";
import { easings } from "./motionConfig";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: easings.customSmooth,
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (i: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.06,
      ease: easings.customSmooth,
    },
  }),
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: easings.customSmooth,
    },
  }),
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: easings.customSmooth,
    },
  }),
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.06,
      ease: easings.customSmooth,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardHoverVariants = {
  rest: { y: 0, scale: 1, boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)" },
  hover: {
    y: -5,
    scale: 1.015,
    boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)",
    transition: { duration: 0.3, ease: easings.customSmooth },
  },
  tap: { scale: 0.98, transition: { duration: 0.15 } },
};

export const buttonPressVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2, ease: easings.customSmooth } },
  tap: { scale: 0.96, transition: { duration: 0.1 } },
};

export const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.04, ease: easings.customSmooth },
  }),
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: easings.customSmooth },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 16,
    transition: { duration: 0.2, ease: easings.gentle },
  },
};

export const badgePulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};
