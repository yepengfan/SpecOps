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
    delta: { type: "text_delta", text: "Hello " },
  };
  yield {
    type: "content_block_delta",
    delta: { type: "text_delta", text: "world" },
  };
  yield { type: "message_stop" };
}

describe("POST /api/generate", () => {
  it("returns 401 when API key is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({ action: "generate-spec" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("API key not configured");
  });

  it("returns 400 for invalid action", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(makeRequest({ action: "invalid-action" }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it("forwards request to Anthropic SDK with stream: true", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-spec",
        projectDescription: "A todo app",
      }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ stream: true }),
    );
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("streams SSE content and done events", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate.mockReturnValue(mockStreamEvents());

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-spec",
        projectDescription: "A todo app",
      }),
    );

    const events = await readSSEStream(response);

    const contentEvents = events.filter((e) => e.type === "content");
    expect(contentEvents).toHaveLength(2);
    expect(contentEvents[0].text).toBe("Hello ");
    expect(contentEvents[1].text).toBe("world");

    const doneEvents = events.filter((e) => e.type === "done");
    expect(doneEvents).toHaveLength(1);
  });

  it("handles 401 SDK error with correct status and message", async () => {
    process.env.ANTHROPIC_API_KEY = "bad-key";

    const { APIError } = await import("@anthropic-ai/sdk");
    mockCreate.mockRejectedValue(
      new APIError(401, null, "Invalid API key", {}),
    );

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-spec",
        projectDescription: "test",
      }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid API key");
  });

  it("handles 429 SDK error with correct status and message", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const { APIError } = await import("@anthropic-ai/sdk");
    mockCreate.mockRejectedValue(
      new APIError(429, null, "Rate limit exceeded", {}),
    );

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-spec",
        projectDescription: "test",
      }),
    );

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Rate limit exceeded");
  });

  it("handles 500+ SDK error with correct status and message", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";

    const { APIError } = await import("@anthropic-ai/sdk");
    mockCreate.mockRejectedValue(new APIError(500, null, "API error", {}));

    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      makeRequest({
        action: "generate-spec",
        projectDescription: "test",
      }),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("API error");
  });
});
