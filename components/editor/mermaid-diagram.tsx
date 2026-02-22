"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default" });

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const id = useId();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // mermaid IDs must be alphanumeric — strip colons from useId() output
    const mermaidId = `mermaid-${id.replace(/:/g, "")}`;

    mermaid
      .render(mermaidId, code)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to render diagram";
          setError(message);
          setSvg(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, id]);

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

  if (!svg) return null;

  // dangerouslySetInnerHTML is safe here — SVG is produced by mermaid's trusted renderer
  return <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}
