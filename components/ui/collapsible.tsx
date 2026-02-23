"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsibleContent = CollapsiblePrimitive.Content

function AnimatedCollapsibleContent({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return isOpen ? <div>{children}</div> : null;
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="collapsible-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: { duration: 0.15, ease: "easeIn" },
          }}
          style={{ overflow: "hidden" }}
          onAnimationComplete={(definition) => {
            // After expand completes, allow overflow for dropdowns/tooltips
            if (
              typeof definition === "object" &&
              definition !== null &&
              "height" in definition &&
              definition.height === "auto"
            ) {
              // overflow is managed by style prop during animation
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, AnimatedCollapsibleContent }
