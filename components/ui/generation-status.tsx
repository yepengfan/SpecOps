"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

type Phase = "spec" | "plan" | "tasks";

const messages: Record<Phase, string[]> = {
  spec: [
    "🧠 Thinking deeply...",
    "📋 Crafting requirements...",
    "🔍 Analyzing constraints...",
    "✍️ Writing specifications...",
    "⚡ Almost there...",
  ],
  plan: [
    "🏗️ Architecting the plan...",
    "🔧 Designing components...",
    "📐 Mapping data models...",
    "🛡️ Checking edge cases...",
    "⚡ Wrapping up...",
  ],
  tasks: [
    "📝 Breaking down tasks...",
    "🔗 Mapping dependencies...",
    "📂 Assigning files...",
    "🧪 Planning tests...",
    "⚡ Finalizing...",
  ],
};

interface GenerationStatusProps {
  phase: Phase;
  isActive: boolean;
}

export function GenerationStatus({ phase, isActive }: GenerationStatusProps) {
  const [index, setIndex] = useState(0);
  const [wasActive, setWasActive] = useState(isActive);
  const reducedMotion = useReducedMotion();

  // Reset index when transitioning to active (React "adjust state during render" pattern)
  if (isActive && !wasActive) {
    setIndex(0);
    setWasActive(true);
  } else if (!isActive && wasActive) {
    setWasActive(false);
  }

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages[phase].length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  if (!isActive) return null;

  const currentMessage = messages[phase][index];

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex h-8 items-center text-sm text-muted-foreground">
        {reducedMotion ? (
          <span>{currentMessage}</span>
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={currentMessage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={pageTransition}
            >
              {currentMessage}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
      </div>
    </div>
  );
}
