"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default" });

let mermaidIdCounter = 0;

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const id = `mermaid-${++mermaidIdCounter}`;
    let cancelled = false;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to render diagram";
          setError(message);
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          Mermaid error: {error}
        </div>
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return <div ref={containerRef} className="overflow-x-auto" />;
}
