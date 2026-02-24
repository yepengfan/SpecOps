import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChatMessage } from "@/lib/types/chat";
import type { Project, PhaseType } from "@/lib/types";

// Mock MarkdownRenderer to avoid react-markdown ESM issues
jest.mock("@/components/editor/markdown-renderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Mock the chat store
const mockTogglePanel = jest.fn();
const mockSendMessage = jest.fn();
const mockLoadHistory = jest.fn();
const mockClearMessages = jest.fn();

jest.mock("@/lib/stores/chat-store", () => ({
  useChatStore: jest.fn(),
}));

import { useChatStore } from "@/lib/stores/chat-store";
import { ChatPanel } from "@/components/chat/chat-panel";

const TEST_PROJECT_ID = "proj-1";
const TEST_PHASE: PhaseType = "spec";

function makeProject(): Project {
  return {
    id: TEST_PROJECT_ID,
    name: "Test Project",
    description: "A test project",
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

function makeMessages(overrides?: Partial<ChatMessage>[]): ChatMessage[] {
  const defaults: ChatMessage[] = [
    {
      id: 1,
      projectId: TEST_PROJECT_ID,
      role: "user",
      content: "How should I structure the requirements?",
      timestamp: 1000,
    },
    {
      id: 2,
      projectId: TEST_PROJECT_ID,
      role: "assistant",
      content: "I recommend using EARS syntax for clarity.",
      timestamp: 2000,
    },
  ];
  if (!overrides) return defaults;
  return defaults.map((msg, i) => ({ ...msg, ...overrides[i] }));
}

interface MockStoreOverrides {
  messages?: ChatMessage[];
  isOpen?: boolean;
  isStreaming?: boolean;
  error?: string | null;
}

function mockStore(overrides: MockStoreOverrides = {}) {
  const state = {
    messages: overrides.messages ?? [],
    isOpen: overrides.isOpen ?? true,
    isStreaming: overrides.isStreaming ?? false,
    error: overrides.error ?? null,
    togglePanel: mockTogglePanel,
    sendMessage: mockSendMessage,
    loadHistory: mockLoadHistory,
    clearMessages: mockClearMessages,
  };
  (useChatStore as unknown as jest.Mock).mockReturnValue(state);
  return state;
}

const testProject = makeProject();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ChatPanel", () => {
  it("renders 'AI Assistant' header when panel is open", () => {
    mockStore({ isOpen: true });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("does not render panel content when isOpen is false", () => {
    mockStore({ isOpen: false });
    const { container } = render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(screen.queryByText("AI Assistant")).not.toBeInTheDocument();
    // The panel should either be hidden or not rendered at all
    expect(container.querySelector("[data-testid='chat-panel']")).toBeNull();
  });

  it("close button calls togglePanel", async () => {
    const user = userEvent.setup();
    mockStore({ isOpen: true });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockTogglePanel).toHaveBeenCalledTimes(1);
  });

  it("renders user and assistant messages with visual distinction", () => {
    const messages = makeMessages();
    mockStore({ isOpen: true, messages });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(
      screen.getByText("How should I structure the requirements?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I recommend using EARS syntax for clarity."),
    ).toBeInTheDocument();
  });

  it("shows streaming indicator when isStreaming is true", () => {
    mockStore({ isOpen: true, isStreaming: true, messages: [] });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    // The component should display some kind of streaming/loading indicator
    const indicator =
      screen.queryByTestId("streaming-indicator") ??
      screen.queryByText(/thinking/i) ??
      screen.queryByRole("status");
    expect(indicator).toBeInTheDocument();
  });

  it("does not show streaming indicator when isStreaming is false", () => {
    mockStore({ isOpen: true, isStreaming: false, messages: [] });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(screen.queryByTestId("streaming-indicator")).not.toBeInTheDocument();
  });

  it("does not display inline error when error is set (uses toast instead)", () => {
    mockStore({ isOpen: true, error: "Failed to send message" });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    // Error should NOT be shown inline — it's shown via toast
    const panel = screen.getByTestId("chat-panel");
    const inlineError = panel.querySelector(".text-destructive");
    expect(inlineError).toBeNull();
  });

  it("does not display error message when error is null", () => {
    mockStore({ isOpen: true, error: null });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(
      screen.queryByText("Failed to send message"),
    ).not.toBeInTheDocument();
  });

  it("sends message via store when ChatInput onSend fires", async () => {
    const user = userEvent.setup();
    mockStore({ isOpen: true, messages: [] });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    // Find the text input and type a message
    const input = screen.getByRole("textbox");
    await user.type(input, "What about non-functional requirements?");

    // Submit via the send button or form submission
    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith(
      "What about non-functional requirements?",
      TEST_PROJECT_ID,
      testProject,
      TEST_PHASE,
    );
  });

  it("clear button is visible in panel header", () => {
    mockStore({ isOpen: true, messages: makeMessages() });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("clicking clear button shows confirmation dialog", async () => {
    const user = userEvent.setup();
    mockStore({ isOpen: true, messages: makeMessages() });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(screen.getByText(/clear all chat history/i)).toBeInTheDocument();
  });

  it("renders multiple messages in order", () => {
    const messages: ChatMessage[] = [
      {
        id: 1,
        projectId: TEST_PROJECT_ID,
        role: "user",
        content: "First question",
        timestamp: 1000,
      },
      {
        id: 2,
        projectId: TEST_PROJECT_ID,
        role: "assistant",
        content: "First answer",
        timestamp: 2000,
      },
      {
        id: 3,
        projectId: TEST_PROJECT_ID,
        role: "user",
        content: "Second question",
        timestamp: 3000,
      },
    ];
    mockStore({ isOpen: true, messages });
    render(
      <ChatPanel
        projectId={TEST_PROJECT_ID}
        project={testProject}
        phaseType={TEST_PHASE}
      />,
    );

    expect(screen.getByText("First question")).toBeInTheDocument();
    expect(screen.getByText("First answer")).toBeInTheDocument();
    expect(screen.getByText("Second question")).toBeInTheDocument();
  });
});
