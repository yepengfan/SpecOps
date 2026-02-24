import { render, screen, fireEvent, act } from "@testing-library/react";
import { ChatResizeHandle } from "@/components/chat/chat-resize-handle";

// JSDOM doesn't implement setPointerCapture
beforeAll(() => {
  Element.prototype.setPointerCapture = jest.fn();
  Element.prototype.releasePointerCapture = jest.fn();
});

// Helper to dispatch pointer events with clientX (JSDOM PointerEvent doesn't inherit clientX)
function dispatchPointer(el: Element, type: string, clientX: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
  });
  // Patch to make React's event system recognize it
  Object.defineProperty(event, "pointerId", { value: 1 });
  el.dispatchEvent(event);
}

describe("ChatResizeHandle", () => {
  const defaultProps = {
    panelWidth: 384,
    onWidthChange: jest.fn(),
    onDragEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a resize handle element", () => {
    render(<ChatResizeHandle {...defaultProps} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("calls onWidthChange during pointermove after pointerdown", () => {
    const onWidthChange = jest.fn();
    render(
      <ChatResizeHandle
        {...defaultProps}
        onWidthChange={onWidthChange}
      />
    );

    const handle = screen.getByRole("separator");

    act(() => {
      dispatchPointer(handle, "pointerdown", 500);
      dispatchPointer(handle, "pointermove", 480);
    });

    // Moving left by 20px should increase width by 20px
    expect(onWidthChange).toHaveBeenCalledWith(404);
  });

  it("clamps width to minimum 320px", () => {
    const onWidthChange = jest.fn();
    render(
      <ChatResizeHandle
        {...defaultProps}
        panelWidth={330}
        onWidthChange={onWidthChange}
      />
    );

    const handle = screen.getByRole("separator");

    act(() => {
      dispatchPointer(handle, "pointerdown", 500);
      dispatchPointer(handle, "pointermove", 600);
    });

    expect(onWidthChange).toHaveBeenCalledWith(320);
  });

  it("clamps width to maximum 640px", () => {
    const onWidthChange = jest.fn();
    render(
      <ChatResizeHandle
        {...defaultProps}
        panelWidth={600}
        onWidthChange={onWidthChange}
      />
    );

    const handle = screen.getByRole("separator");

    act(() => {
      dispatchPointer(handle, "pointerdown", 500);
      dispatchPointer(handle, "pointermove", 400);
    });

    expect(onWidthChange).toHaveBeenCalledWith(640);
  });

  it("calls onDragEnd with final width on pointerup", () => {
    const onWidthChange = jest.fn();
    const onDragEnd = jest.fn();
    render(
      <ChatResizeHandle
        {...defaultProps}
        onWidthChange={onWidthChange}
        onDragEnd={onDragEnd}
      />
    );

    const handle = screen.getByRole("separator");

    act(() => {
      dispatchPointer(handle, "pointerdown", 500);
      dispatchPointer(handle, "pointermove", 480);
      dispatchPointer(handle, "pointerup", 480);
    });

    expect(onDragEnd).toHaveBeenCalledWith(404);
  });

  it("supports keyboard arrow keys for width adjustment", () => {
    const onWidthChange = jest.fn();
    const onDragEnd = jest.fn();
    render(
      <ChatResizeHandle
        {...defaultProps}
        onWidthChange={onWidthChange}
        onDragEnd={onDragEnd}
      />
    );

    const handle = screen.getByRole("separator");

    // Left arrow increases width by 10px
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(onWidthChange).toHaveBeenCalledWith(394);
    expect(onDragEnd).toHaveBeenCalledWith(394);

    // Right arrow decreases width by 10px
    onWidthChange.mockClear();
    onDragEnd.mockClear();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onWidthChange).toHaveBeenCalledWith(374);
    expect(onDragEnd).toHaveBeenCalledWith(374);
  });

  it("is hidden on mobile via md: breakpoint class", () => {
    const { container } = render(<ChatResizeHandle {...defaultProps} />);
    const handle = container.firstChild as HTMLElement;
    expect(handle.className).toContain("hidden");
    expect(handle.className).toContain("md:flex");
  });
});
