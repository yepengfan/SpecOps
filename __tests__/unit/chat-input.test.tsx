import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/chat-input";

describe("ChatInput", () => {
  it("renders textarea with placeholder", () => {
    render(<ChatInput onSend={jest.fn()} isStreaming={false} />);
    expect(
      screen.getByPlaceholderText("Ask about your project..."),
    ).toBeInTheDocument();
  });

  it("Enter sends message via onSend callback", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText("Ask about your project...");
    await user.type(textarea, "Hello world{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello world");
  });

  it("button click sends message", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText("Ask about your project...");
    await user.type(textarea, "Hello from button");

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith("Hello from button");
  });

  it("send button is disabled when isStreaming is true", () => {
    render(<ChatInput onSend={jest.fn()} isStreaming={true} />);
    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it("send button is disabled when input is empty", () => {
    render(<ChatInput onSend={jest.fn()} isStreaming={false} />);
    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it("Shift+Enter inserts newline without sending", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText("Ask about your project...");
    await user.type(textarea, "line one{Shift>}{Enter}{/Shift}line two");

    expect(onSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("input clears after sending via Enter", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText("Ask about your project...");
    await user.type(textarea, "will be cleared{Enter}");

    expect(onSend).toHaveBeenCalledWith("will be cleared");
    expect(textarea).toHaveValue("");
  });

  it("input clears after sending via button click", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText("Ask about your project...");
    await user.type(textarea, "will be cleared too");

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith("will be cleared too");
    expect(textarea).toHaveValue("");
  });
});
