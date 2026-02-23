"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, Lock, GitBranch, LayoutDashboard } from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { PHASE_TYPES, type PhaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<PhaseType, string> = {
  spec: "Spec",
  plan: "Plan",
  tasks: "Tasks",
};

interface TabEntry {
  key: string;
  href: string;
  locked: boolean;
}

interface PhaseNavProps {
  projectId: string;
}

export function PhaseNav({ projectId }: PhaseNavProps) {
  const project = useProjectStore((s) => s.currentProject);
  const pathname = usePathname();
  const router = useRouter();
  const tablistRef = useRef<HTMLDivElement>(null);

  // Build full tab list (overview + phases + traceability)
  const allTabs: TabEntry[] = project
    ? [
        {
          key: "overview",
          href: `/project/${projectId}/overview`,
          locked: false,
        },
        ...PHASE_TYPES.map((phase) => ({
          key: phase,
          href: `/project/${projectId}/${phase}`,
          locked: project.phases[phase].status === "locked",
        })),
        {
          key: "traceability",
          href: `/project/${projectId}/traceability`,
          locked: false,
        },
      ]
    : [];

  const focusableTabs = allTabs.filter((t) => !t.locked);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusableTabs.length === 0) return;

      const tabElements = tablistRef.current?.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );
      if (!tabElements || tabElements.length === 0) return;

      // Find which focusable tab currently has focus
      let currentIdx = Array.from(tabElements).findIndex(
        (el) => el === document.activeElement,
      );
      if (currentIdx === -1) currentIdx = 0;

      let nextIdx = currentIdx;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextIdx = (currentIdx + 1) % tabElements.length;
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIdx =
            (currentIdx - 1 + tabElements.length) % tabElements.length;
          break;
        case "Home":
          e.preventDefault();
          nextIdx = 0;
          break;
        case "End":
          e.preventDefault();
          nextIdx = tabElements.length - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          // Navigate to the focused tab's href
          {
            const focusedEl = tabElements[currentIdx];
            const href = focusedEl?.getAttribute("href");
            if (href) router.push(href);
          }
          return;
        default:
          return;
      }

      tabElements[nextIdx]?.focus();
    },
    [focusableTabs.length, router],
  );

  if (!project) return null;

  // Determine the active (currently selected) focusable tab index
  const activeFocusableIdx = focusableTabs.findIndex(
    (t) => t.href === pathname,
  );

  return (
    <nav aria-label="Phase navigation">
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- individual tabs are focusable via roving tabindex */}
      <div
        ref={tablistRef}
        role="tablist"
        className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1"
        onKeyDown={onKeyDown}
      >
        {(() => {
          const overviewHref = `/project/${projectId}/overview`;
          const isOverviewActive = pathname === overviewHref;
          const focusableIdx = focusableTabs.findIndex(
            (t) => t.key === "overview",
          );

          return (
            <Link
              href={overviewHref}
              role="tab"
              aria-selected={isOverviewActive}
              tabIndex={
                focusableIdx === (activeFocusableIdx >= 0 ? activeFocusableIdx : 0)
                  ? 0
                  : -1
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                isOverviewActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutDashboard className="size-3.5" />
              Overview
            </Link>
          );
        })()}

        <span className="mx-1 text-muted-foreground/40">|</span>

        {PHASE_TYPES.map((phase) => {
          const status = project.phases[phase].status;
          const href = `/project/${projectId}/${phase}`;
          const isActive = pathname === href;

          if (status === "locked") {
            return (
              <span
                key={phase}
                role="tab"
                aria-disabled="true"
                aria-selected={false}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm text-muted-foreground opacity-50"
              >
                <Lock className="size-3.5" />
                {PHASE_LABELS[phase]}
              </span>
            );
          }

          const focusableIdx = focusableTabs.findIndex(
            (t) => t.key === phase,
          );

          return (
            <Link
              key={phase}
              href={href}
              role="tab"
              aria-selected={isActive}
              tabIndex={
                focusableIdx === (activeFocusableIdx >= 0 ? activeFocusableIdx : 0)
                  ? 0
                  : -1
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {status === "reviewed" && <Check className="size-3.5" />}
              {PHASE_LABELS[phase]}
            </Link>
          );
        })}

        <span className="mx-1 text-muted-foreground/40">|</span>

        {(() => {
          const traceHref = `/project/${projectId}/traceability`;
          const isTraceActive = pathname === traceHref;
          const focusableIdx = focusableTabs.findIndex(
            (t) => t.key === "traceability",
          );

          return (
            <Link
              href={traceHref}
              role="tab"
              aria-selected={isTraceActive}
              tabIndex={
                focusableIdx === (activeFocusableIdx >= 0 ? activeFocusableIdx : 0)
                  ? 0
                  : -1
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                isTraceActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <GitBranch className="size-3.5" />
              Traceability
            </Link>
          );
        })()}
      </div>
    </nav>
  );
}
