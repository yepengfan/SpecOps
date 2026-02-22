import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock updateChatMessage
const mockUpdateChatMessage = jest.fn();
jest.mock("@/lib/db/chat-messages", () => ({
  updateChatMessage: (...args: unknown[]) => mockUpdateChatMessage(...args),
}));

// Mock project store
const mockUpdateSection = jest.fn();
jest.mock("@/lib/stores/project-store", () => ({
  useProjectStore: {
    getState: () => ({
      currentProject: {
        phases: {
          spec: { status: "draft" },
          plan: { status: "draft" },
          tasks: { status: "locked" },
        },
      },
      updateSection: mockUpdateSection,
    }),
  },
}));

import { SuggestedEdit } from "@/components/chat/suggested-edit";
import type { ChatMessage } from "@/lib/types/chat";

const TEST_PROJECT_ID = "proj-1";

function makeMessage(
  overrides: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    id: 10,
    projectId: TEST_PROJECT_ID,
    role: "assistant",
    content: "Here is a suggested edit for your requirements.",
    timestamp: Date.now(),
    suggestedEdit: {
      sectionId: "problem-statement",
      phaseType: "spec",
      proposedContent: "The system shall provide real-time analytics.",
      status: "pending",
    },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SuggestedEdit", () => {
  it("renders section title and content preview for a pending edit", () => {
    const message = makeMessage();
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    // Section title should be resolved from SPEC_SECTIONS
    expect(screen.getByText(/Problem Statement/)).toBeInTheDocument();
    // Content preview should show proposed content
    expect(
      screen.getByText(/The system shall provide real-time analytics/),
    ).toBeInTheDocument();
  });

  it("Apply button calls updateSection with correct phaseType, sectionId, proposedContent", async () => {
    const user = userEvent.setup();
    const message = makeMessage();
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    const applyButton = screen.getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    expect(mockUpdateSection).toHaveBeenCalledWith(
      "spec",
      "problem-statement",
      "The system shall provide real-time analytics.",
    );
  });

  it("Apply button calls updateChatMessage to set status to applied", async () => {
    const user = userEvent.setup();
    const message = makeMessage();
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    const applyButton = screen.getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    expect(mockUpdateChatMessage).toHaveBeenCalledWith(
      message.id,
      {
        suggestedEdit: {
          ...message.suggestedEdit,
          status: "applied",
        },
      },
    );
  });

  it("Dismiss button calls updateChatMessage to set status to dismissed", async () => {
    const user = userEvent.setup();
    const message = makeMessage();
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    await user.click(dismissButton);

    expect(mockUpdateChatMessage).toHaveBeenCalledWith(
      message.id,
      {
        suggestedEdit: {
          ...message.suggestedEdit,
          status: "dismissed",
        },
      },
    );
  });

  it("shows Applied badge when status is applied and hides action buttons", () => {
    const message = makeMessage({
      suggestedEdit: {
        sectionId: "problem-statement",
        phaseType: "spec",
        proposedContent: "The system shall provide real-time analytics.",
        status: "applied",
      },
    });
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    expect(screen.getByText(/applied/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it("shows Dismissed badge when status is dismissed and hides action buttons", () => {
    const message = makeMessage({
      suggestedEdit: {
        sectionId: "problem-statement",
        phaseType: "spec",
        proposedContent: "The system shall provide real-time analytics.",
        status: "dismissed",
      },
    });
    render(
      <SuggestedEdit message={message} projectId={TEST_PROJECT_ID} />,
    );

    expect(screen.getByText(/dismissed/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /dismiss/i })).not.toBeInTheDocument();
  });
});
