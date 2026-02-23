import type { Variants, Transition } from "framer-motion";

/** Fade + subtle vertical slide for page/tab transitions */
export const fadeSlideVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Container variant with staggered children (60ms between each) */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

/** Individual item fade + rise for staggered lists (250ms duration) */
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};

/** Shared transition config for page transitions (200ms easeOut) */
export const pageTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/** Collapsible expand transition (200ms easeOut) */
export const collapsibleExpandTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/** Collapsible collapse transition (150ms easeIn) */
export const collapsibleCollapseTransition: Transition = {
  duration: 0.15,
  ease: "easeIn",
};
