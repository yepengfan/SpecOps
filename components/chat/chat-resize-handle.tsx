"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface ChatResizeHandleProps {
  panelWidth: number;
  onWidthChange: (width: number) => void;
  onDragEnd: (width: number) => void;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 640;
const KEYBOARD_STEP = 10;

function clampWidth(width: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

export function ChatResizeHandle({
  panelWidth,
  onWidthChange,
  onDragEnd,
}: ChatResizeHandleProps) {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const currentWidthRef = useRef(panelWidth);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const el = e.target as HTMLElement;
      if (el.setPointerCapture) {
        el.setPointerCapture(e.pointerId);
      }
      startXRef.current = e.clientX;
      startWidthRef.current = panelWidth;
      currentWidthRef.current = panelWidth;
      isDraggingRef.current = true;
    },
    [panelWidth],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startXRef.current - e.clientX;
      const newWidth = clampWidth(startWidthRef.current + delta);
      currentWidthRef.current = newWidth;
      onWidthChange(newWidth);
    },
    [onWidthChange],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onDragEnd(currentWidthRef.current);
  }, [onDragEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newWidth: number | null = null;
      if (e.key === "ArrowLeft") {
        newWidth = clampWidth(panelWidth + KEYBOARD_STEP);
      } else if (e.key === "ArrowRight") {
        newWidth = clampWidth(panelWidth - KEYBOARD_STEP);
      }
      if (newWidth !== null) {
        e.preventDefault();
        onWidthChange(newWidth);
        onDragEnd(newWidth);
      }
    },
    [panelWidth, onWidthChange, onDragEnd],
  );

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={panelWidth}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      aria-label="Resize chat panel"
      tabIndex={0}
      className={cn(
        "hidden md:flex items-center justify-center w-1 cursor-col-resize select-none",
        "hover:bg-border transition-colors",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    />
  );
}
