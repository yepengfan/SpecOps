import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

jest.mock("next/link", () => {
  return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  };
});

describe("Breadcrumb", () => {
  it("renders 3 segments on a phase page (Projects > Name > Phase)", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="spec"
      />
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("My Project")).toBeInTheDocument();
    expect(screen.getByText("Spec")).toBeInTheDocument();
  });

  it("links Projects segment to /", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="spec"
      />
    );

    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink).toHaveAttribute("href", "/");
  });

  it("links project name segment to /project/{id}/overview", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="spec"
      />
    );

    const projectLink = screen.getByRole("link", { name: "My Project" });
    expect(projectLink).toHaveAttribute("href", "/project/p1/overview");
  });

  it("renders current phase segment as span (not a link) with aria-current", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="spec"
      />
    );

    const currentSegment = screen.getByText("Spec");
    expect(currentSegment.tagName).toBe("SPAN");
    expect(currentSegment).toHaveAttribute("aria-current", "page");
  });

  it("wraps in nav with aria-label Breadcrumb", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="spec"
      />
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders only 2 segments on overview page (no phase segment)", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="My Project"
        currentPhase="overview"
      />
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();
    // On overview, project name is the current page
    const projectName = screen.getByText("My Project");
    expect(projectName).toHaveAttribute("aria-current", "page");
    // No third segment
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
  });

  it("truncates long project names with max-w class", () => {
    render(
      <Breadcrumb
        projectId="p1"
        projectName="A Very Very Very Long Project Name That Overflows"
        currentPhase="spec"
      />
    );

    const nameEl = screen.getByText("A Very Very Very Long Project Name That Overflows");
    expect(nameEl.className).toContain("truncate");
    expect(nameEl.className).toContain("max-w-[200px]");
  });
});
