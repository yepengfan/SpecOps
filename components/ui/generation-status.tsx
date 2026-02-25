"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

type Phase = "spec" | "plan" | "tasks";

export const statusMessages: string[] = [
  "🧠 Thinking...",
  "🔬 Analyzing...",
  "💭 Cerebrating...",
  "⚡ Calculating...",
  "🔍 Examining...",
  "✨ Reasoning...",
  "📐 Synthesizing...",
  "🎯 Deliberating...",
  "🌀 Processing...",
  "💡 Contemplating...",
];

function randomIndex(exclude: number): number {
  let next: number;
  let attempts = 0;
  do {
    next = Math.floor(Math.random() * statusMessages.length);
  } while (next === exclude && statusMessages.length > 1 && ++attempts < 10);
  return next;
}

interface GenerationStatusProps {
  phase: Phase;
  isActive: boolean;
}

// phase is accepted for API compatibility but no longer affects message selection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GenerationStatus({ phase, isActive }: GenerationStatusProps) {
  const [index, setIndex] = useState(() => randomIndex(-1));
  const [wasActive, setWasActive] = useState(isActive);
  const reducedMotion = useReducedMotion();

  // Reset index when transitioning to active (React "adjust state during render" pattern)
  if (isActive && !wasActive) {
    setIndex(randomIndex(-1));
    setWasActive(true);
  } else if (!isActive && wasActive) {
    setWasActive(false);
  }

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setIndex((prev) => randomIndex(prev));
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const currentMessage = statusMessages[index];

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
