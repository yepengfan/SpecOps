import { render, screen, act } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { GenerationStatus } from "@/components/ui/generation-status";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// T001: Core rendering behavior
describe("GenerationStatus — core rendering", () => {
  it("renders nothing when isActive is false", () => {
    const { container } = render(
      <GenerationStatus phase="spec" isActive={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the first message when active", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();
  });

  it("renders a progress bar when active", () => {
    const { container } = render(
      <GenerationStatus phase="spec" isActive={true} />,
    );
    const bar = container.querySelector(".animate-pulse");
    expect(bar).toBeInTheDocument();
  });
});

// T002: Rotation behavior
describe("GenerationStatus — rotation", () => {
  it("rotates messages every 3 seconds", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText("📋 Crafting requirements...")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText("🔍 Analyzing constraints...")).toBeInTheDocument();
  });

  it("wraps around to the first message after all 5 shown", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);

    // Advance through all 5 messages (5 * 3000ms = 15000ms)
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();
  });

  it("resets to the first message when deactivated and reactivated", () => {
    const { rerender } = render(
      <GenerationStatus phase="spec" isActive={true} />,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText("📋 Crafting requirements...")).toBeInTheDocument();

    rerender(<GenerationStatus phase="spec" isActive={false} />);
    rerender(<GenerationStatus phase="spec" isActive={true} />);

    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();
  });
});

// T003: Phase-specific messages
describe("GenerationStatus — phase-specific messages", () => {
  it("shows spec-themed first message for spec phase", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();
  });

  it("shows plan-themed first message for plan phase", () => {
    render(<GenerationStatus phase="plan" isActive={true} />);
    expect(
      screen.getByText("🏗️ Architecting the plan..."),
    ).toBeInTheDocument();
  });

  it("shows tasks-themed first message for tasks phase", () => {
    render(<GenerationStatus phase="tasks" isActive={true} />);
    expect(screen.getByText("📝 Breaking down tasks...")).toBeInTheDocument();
  });
});

// T005: Accessibility
describe("GenerationStatus — accessibility", () => {
  it("has role=status for screen reader announcements", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders static message without animation when reduced motion is preferred", () => {
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText("🧠 Thinking deeply...")).toBeInTheDocument();
  });
});
