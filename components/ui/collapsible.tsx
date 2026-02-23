"use client"

import { useState } from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  collapsibleExpandTransition,
  collapsibleCollapseTransition,
} from "@/lib/motion"

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
  const [expanded, setExpanded] = useState(false);

  if (reducedMotion) {
    return isOpen ? <div>{children}</div> : null;
  }

  return (
    <AnimatePresence
      initial={false}
      onExitComplete={() => setExpanded(false)}
    >
      {isOpen && (
        <motion.div
          key="collapsible-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: collapsibleExpandTransition,
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: collapsibleCollapseTransition,
          }}
          style={{ overflow: expanded ? "visible" : "hidden" }}
          onAnimationComplete={(definition) => {
            if (
              typeof definition === "object" &&
              definition !== null &&
              "height" in definition &&
              definition.height === "auto"
            ) {
              setExpanded(true);
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
