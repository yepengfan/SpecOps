import { render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";

const mockUsePathname = jest.fn<() => string>();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Import after mocks are set up
import ProjectTemplate from "@/app/project/[id]/template";

beforeEach(() => {
  mockUsePathname.mockReturnValue("/project/123/overview");
});

describe("ProjectTemplate", () => {
  it("renders children inside a motion wrapper when animations are enabled", () => {
    const { container } = render(
      <ProjectTemplate>
        <div data-testid="child">Tab content</div>
      </ProjectTemplate>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Tab content")).toBeInTheDocument();

    // With animations enabled, children are wrapped in a motion.div (mocked as div)
    // The wrapper div sits between the container root and the child content
    const child = screen.getByTestId("child");
    const wrapper = child.parentElement;
    expect(wrapper).not.toBe(container);
    expect(wrapper?.tagName).toBe("DIV");
  });

  it("renders children directly (no wrapper) when reduced motion is preferred", () => {
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    const { container } = render(
      <ProjectTemplate>
        <div data-testid="reduced-child">No animation</div>
      </ProjectTemplate>,
    );
    expect(screen.getByTestId("reduced-child")).toBeInTheDocument();

    // With reduced motion, children render as a fragment — no intermediate wrapper div
    const child = screen.getByTestId("reduced-child");
    expect(child.parentElement).toBe(container);
  });
});
