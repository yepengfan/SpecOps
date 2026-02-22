import { render, screen } from "@testing-library/react";

// Mock react-markdown since it's ESM-only
jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children, components }: { children: string; components?: Record<string, unknown> }) => {
      // Simple mock: render children as HTML-like structure
      // For testing purposes, parse basic markdown patterns
      const lines = children.split("\n");
      const elements: React.ReactNode[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("## ")) {
          elements.push(<h2 key={i}>{line.slice(3)}</h2>);
        } else if (line.startsWith("```mermaid")) {
          // Find end of code block
          const endIdx = lines.indexOf("```", i + 1);
          const code = lines.slice(i + 1, endIdx).join("\n");
          if (components && typeof components === "object" && "code" in components) {
            const CodeComponent = components.code as React.ComponentType<{ className: string; children: string }>;
            elements.push(<CodeComponent key={i} className="language-mermaid">{code}</CodeComponent>);
          }
          i = endIdx;
        } else if (line.startsWith("```")) {
          const lang = line.slice(3);
          const endIdx = lines.indexOf("```", i + 1);
          const code = lines.slice(i + 1, endIdx).join("\n");
          if (components && typeof components === "object" && "code" in components) {
            const CodeComponent = components.code as React.ComponentType<{ className: string; children: string }>;
            elements.push(<CodeComponent key={i} className={lang ? `language-${lang}` : ""}>{code}</CodeComponent>);
          }
          i = endIdx;
        } else if (line.startsWith("| ") && lines[i + 1]?.startsWith("|")) {
          // GFM table
          const headers = line.split("|").filter(Boolean).map((h) => h.trim());
          const dataRows = [];
          let j = i + 2; // skip separator
          while (j < lines.length && lines[j].startsWith("|")) {
            dataRows.push(lines[j].split("|").filter(Boolean).map((c) => c.trim()));
            j++;
          }
          elements.push(
            <table key={i}>
              <thead><tr>{headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr></thead>
              <tbody>{dataRows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>)}</tbody>
            </table>
          );
          i = j - 1;
        } else if (line.startsWith("- ")) {
          elements.push(<li key={i}>{line.slice(2)}</li>);
        } else if (line.includes("`")) {
          // Inline code
          const parts = line.split("`");
          elements.push(
            <p key={i}>
              {parts.map((part, pi) =>
                pi % 2 === 1 ? <code key={pi}>{part}</code> : part
              )}
            </p>
          );
        } else if (line.includes("**")) {
          const parts = line.split("**");
          elements.push(
            <p key={i}>
              {parts.map((part, pi) =>
                pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part
              )}
            </p>
          );
        } else if (line.trim()) {
          elements.push(<p key={i}>{line}</p>);
        }
      }

      return <div>{elements}</div>;
    },
  };
});

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => {},
}));

// Mock MermaidDiagram since mermaid requires a DOM with canvas
jest.mock("@/components/editor/mermaid-diagram", () => ({
  MermaidDiagram: ({ code }: { code: string }) => (
    <div data-testid="mermaid-diagram">{code}</div>
  ),
}));

// Import after mocks
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";

describe("MarkdownRenderer", () => {
  it("renders basic markdown text", () => {
    render(<MarkdownRenderer content="Hello **world**" />);
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders headings", () => {
    render(<MarkdownRenderer content="## Section Title" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Section Title");
  });

  it("renders GFM tables", () => {
    const table = [
      "| Name | Age |",
      "|------|-----|",
      "| Alice | 30 |",
    ].join("\n");

    render(<MarkdownRenderer content={table} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders mermaid code blocks via MermaidDiagram", () => {
    const content = "```mermaid\ngraph TD;\nA-->B;\n```";
    render(<MarkdownRenderer content={content} />);

    const diagram = screen.getByTestId("mermaid-diagram");
    expect(diagram).toBeInTheDocument();
    expect(diagram).toHaveTextContent("graph TD;");
  });

  it("renders non-mermaid code blocks as pre/code", () => {
    const content = "```javascript\nconsole.log('hello');\n```";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText("console.log('hello');")).toBeInTheDocument();
  });

  it("renders inline code", () => {
    render(<MarkdownRenderer content="Use `npm install` to install" />);
    expect(screen.getByText("npm install")).toBeInTheDocument();
  });

  it("renders lists", () => {
    const content = ["- Item 1", "- Item 2", "- Item 3"].join("\n");
    render(<MarkdownRenderer content={content} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});
