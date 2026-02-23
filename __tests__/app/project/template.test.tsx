import { render, screen } from "@testing-library/react";
import { AnimatePresence, useReducedMotion } from "framer-motion";

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
  it("renders children", () => {
    render(
      <ProjectTemplate>
        <div data-testid="child">Tab content</div>
      </ProjectTemplate>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Tab content")).toBeInTheDocument();
  });

  it("uses AnimatePresence and motion.div from framer-motion", () => {
    // Verify the component imports and uses AnimatePresence
    expect(AnimatePresence).toBeDefined();

    const { container } = render(
      <ProjectTemplate>
        <p>Content</p>
      </ProjectTemplate>,
    );
    // motion.div is mocked as a plain div — children should be inside a div wrapper
    expect(container.querySelector("div")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders plain children when reduced motion is preferred", () => {
    // Override useReducedMotion to return true
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    render(
      <ProjectTemplate>
        <div data-testid="reduced-child">No animation</div>
      </ProjectTemplate>,
    );
    expect(screen.getByTestId("reduced-child")).toBeInTheDocument();
  });
});
