import { render, screen, act } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import {
  GenerationStatus,
  statusMessages as MESSAGES,
} from "@/components/ui/generation-status";

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// T001: Core rendering behavior
describe("GenerationStatus — core rendering", () => {
  it("renders nothing when isActive is false", () => {
    const { container } = render(
      <GenerationStatus phase="spec" isActive={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a message from the shared set when active", () => {
    render(<GenerationStatus phase="spec" isActive={true} />);
    const status = screen.getByRole("status");
    const text = status.textContent;
    expect(MESSAGES.some((m) => text?.includes(m))).toBe(true);
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
  it("changes message after 3 seconds", () => {
    // First render picks index via Math.random() → 0 → message[0]
    (Math.random as jest.Mock).mockReturnValue(0);
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText(MESSAGES[0])).toBeInTheDocument();

    // Next rotation: Math.random() → 0.5 → floor(0.5 * 10) = 5
    (Math.random as jest.Mock).mockReturnValue(0.5);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(MESSAGES[5])).toBeInTheDocument();
  });

  it("avoids repeating the current message", () => {
    // Initial index from random: 0.3 → floor(0.3 * 10) = 3
    (Math.random as jest.Mock).mockReturnValue(0.3);
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText(MESSAGES[3])).toBeInTheDocument();

    // Next random also returns 0.3 → index 3 (same), then 0.5 → index 5
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.5);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(MESSAGES[5])).toBeInTheDocument();
  });

  it("resets to a random message when deactivated and reactivated", () => {
    (Math.random as jest.Mock).mockReturnValue(0.2);
    const { rerender } = render(
      <GenerationStatus phase="spec" isActive={true} />,
    );
    expect(screen.getByText(MESSAGES[2])).toBeInTheDocument();

    rerender(<GenerationStatus phase="spec" isActive={false} />);

    (Math.random as jest.Mock).mockReturnValue(0.7);
    rerender(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText(MESSAGES[7])).toBeInTheDocument();
  });
});

// T003: Shared messages across phases
describe("GenerationStatus — shared messages across phases", () => {
  it("uses the same message set regardless of phase", () => {
    (Math.random as jest.Mock).mockReturnValue(0);
    const { rerender } = render(
      <GenerationStatus phase="spec" isActive={true} />,
    );
    expect(screen.getByText(MESSAGES[0])).toBeInTheDocument();

    rerender(<GenerationStatus phase="plan" isActive={false} />);
    (Math.random as jest.Mock).mockReturnValue(0);
    rerender(<GenerationStatus phase="plan" isActive={true} />);
    expect(screen.getByText(MESSAGES[0])).toBeInTheDocument();

    rerender(<GenerationStatus phase="tasks" isActive={false} />);
    (Math.random as jest.Mock).mockReturnValue(0);
    rerender(<GenerationStatus phase="tasks" isActive={true} />);
    expect(screen.getByText(MESSAGES[0])).toBeInTheDocument();
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
    (Math.random as jest.Mock).mockReturnValue(0);
    render(<GenerationStatus phase="spec" isActive={true} />);
    expect(screen.getByText(MESSAGES[0])).toBeInTheDocument();
  });
});
