import { render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { AnimatedCollapsibleContent } from "@/components/ui/collapsible";

describe("AnimatedCollapsibleContent", () => {
  it("renders children when isOpen is true", () => {
    render(
      <AnimatedCollapsibleContent isOpen={true}>
        <p>Section content</p>
      </AnimatedCollapsibleContent>,
    );
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("does not render children when isOpen is false", () => {
    render(
      <AnimatedCollapsibleContent isOpen={false}>
        <p>Hidden content</p>
      </AnimatedCollapsibleContent>,
    );
    // AnimatePresence is mocked as passthrough, so with isOpen=false
    // the component should not render children
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders children instantly when reduced motion is preferred", () => {
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    render(
      <AnimatedCollapsibleContent isOpen={true}>
        <p>Instant content</p>
      </AnimatedCollapsibleContent>,
    );
    expect(screen.getByText("Instant content")).toBeInTheDocument();
  });

  it("hides children instantly when reduced motion is preferred and isOpen is false", () => {
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    render(
      <AnimatedCollapsibleContent isOpen={false}>
        <p>Hidden instant</p>
      </AnimatedCollapsibleContent>,
    );
    expect(screen.queryByText("Hidden instant")).not.toBeInTheDocument();
  });
});
