/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// Mock Anthropic SDK before importing route
const mockCreate = jest.fn();
jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
    })),
    APIError: class APIError extends Error {
      status: number;
      constructor(
        status: number,
        _error: unknown,
        message: string,
        _headers: Record<string, string>,  // eslint-disable-line @typescript-eslint/no-unused-vars
      ) {
        super(message);
        this.status = status;
        this.name = "APIError";
      }
    },
  };
});

// Save/restore env
const originalEnv = process.env.ANTHROPIC_API_KEY;

afterEach(() => {
  if (originalEnv !== undefined) {
    process.env.ANTHROPIC_API_KEY = originalEnv;
  } else {
    delete process.env.ANTHROPIC_API_KEY;
  }
  mockCreate.mockReset();
});

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readSSEStream(
  response: Response,
): Promise<Array<{ type: string; [key: string]: unknown }>> {
  const events: Array<{ type: string; [key: string]: unknown }> = [];
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith("data: ")) {
        events.push(JSON.parse(line.slice(6)));
      }
    }
  }

  return events;
}

// Helper: create async iterable mimicking Anthropic SDK streaming
async function* mockStreamEvents() {
  yield {
    type: "content_block_delta",
    delta: { type: "text_delta", text: "## Architecture\nPlan content" },
  };
  yield { type: "message_stop" };
}

describe("POST /api/generate — generate-plan", () => {
  it("accepts generate-plan as a valid action", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-plan",
        specContent: "## Problem Statement\nBuild a todo app.",
      }),
    );

    expect(response.status).not.toBe(400);
  });

  it("forwards to Anthropic SDK with plan system prompt", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    await POST(
      makeRequest({
        action: "generate-plan",
        specContent: "## Problem Statement\nBuild a todo app.",
      }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        stream: true,
        system: expect.stringContaining("## Architecture"),
      }),
    );
  });

  it("streams SSE response correctly", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-plan",
        specContent: "Spec content",
      }),
    );

    const events = await readSSEStream(response);

    const contentEvents = events.filter((e) => e.type === "content");
    expect(contentEvents.length).toBeGreaterThan(0);

    const doneEvents = events.filter((e) => e.type === "done");
    expect(doneEvents).toHaveLength(1);
  });
});

describe("POST /api/generate — regenerate-plan-section", () => {
  it("accepts regenerate-plan-section as a valid action", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "regenerate-plan-section",
        sectionName: "Architecture",
        phaseContext: "## Architecture\nExisting content",
      }),
    );

    expect(response.status).not.toBe(400);
  });

  it("forwards to Anthropic SDK with plan regeneration prompt", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    await POST(
      makeRequest({
        action: "regenerate-plan-section",
        sectionName: "Architecture",
        phaseContext: "## Architecture\nExisting content",
      }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        stream: true,
        system: expect.stringContaining("software architect"),
      }),
    );
  });

  it("forwards instruction to prompt when provided", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    await POST(
      makeRequest({
        action: "regenerate-plan-section",
        sectionName: "Architecture",
        phaseContext: "## Architecture\nExisting content",
        instruction: "Use event-driven architecture",
      }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("Architect's advice"),
      }),
    );
  });
});
