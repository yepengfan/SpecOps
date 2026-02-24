import { render, screen } from "@testing-library/react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useChatStore } from "@/lib/stores/chat-store";
import type { Project } from "@/lib/types";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/components/chat/chat-message", () => ({
  ChatMessage: () => <div data-testid="chat-message" />,
}));

jest.mock("@/components/chat/chat-input", () => ({
  ChatInput: ({ onSend }: { onSend: (text: string) => void }) => (
    <button onClick={() => onSend("test")}>Send</button>
  ),
}));

function makeProject(): Project {
  return {
    id: "test-123",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: { type: "spec", status: "draft", sections: [] },
      plan: { type: "plan", status: "locked", sections: [] },
      tasks: { type: "tasks", status: "locked", sections: [] },
    },
    traceabilityMappings: [],
  };
}

describe("ChatPanel toast for errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render inline error text when there is an error", () => {
    // Set store to open with an error
    useChatStore.setState({
      isOpen: true,
      error: "Something went wrong",
      messages: [],
      isStreaming: false,
    });

    render(
      <ChatPanel
        projectId="test-123"
        project={makeProject()}
        phaseType="spec"
      />
    );

    // After migration, error should be shown via toast, not inline
    // The inline error element with border-t should not exist
    const panel = screen.getByTestId("chat-panel");
    const inlineError = panel.querySelector(".border-t.text-destructive, .text-destructive");
    expect(inlineError).toBeNull();
  });
});
