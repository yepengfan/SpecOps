/**
 * @jest-environment node
 */

function mockSSEResponse(lines: string[]): Response {
  const encoded = new TextEncoder().encode(lines.join("\n\n") + "\n\n");
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("streamGenerate", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("parses SSE content events and yields text chunks", async () => {
    mockFetch.mockResolvedValue(
      mockSSEResponse([
        'data: {"type":"content","text":"Hello "}',
        'data: {"type":"content","text":"world"}',
        'data: {"type":"done","traceabilityMappings":[]}',
      ]),
    );

    const { streamGenerate } = await import("@/lib/api/stream-client");
    const chunks: string[] = [];

    for await (const chunk of streamGenerate({
      action: "generate-spec",
      projectDescription: "test",
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Hello ", "world"]);
  });

  it("throws StreamError on SSE error event", async () => {
    mockFetch.mockResolvedValue(
      mockSSEResponse([
        'data: {"type":"error","message":"Something went wrong"}',
      ]),
    );

    const { streamGenerate, StreamError } = await import(
      "@/lib/api/stream-client"
    );

    await expect(async () => {
      for await (const _ of streamGenerate({
        action: "generate-spec",
        projectDescription: "test",
      })) {
        void _;
      }
    }).rejects.toThrow(StreamError);
  });

  it("throws StreamError on network failure", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const { streamGenerate, StreamError } = await import(
      "@/lib/api/stream-client"
    );

    await expect(async () => {
      for await (const _ of streamGenerate({
        action: "generate-spec",
        projectDescription: "test",
      })) {
        void _;
      }
    }).rejects.toThrow(StreamError);
  });

  it("returns an async iterator via Symbol.asyncIterator", async () => {
    mockFetch.mockResolvedValue(
      mockSSEResponse([
        'data: {"type":"content","text":"chunk"}',
        'data: {"type":"done","traceabilityMappings":[]}',
      ]),
    );

    const { streamGenerate } = await import("@/lib/api/stream-client");

    const iter = streamGenerate({
      action: "generate-spec",
      projectDescription: "test",
    });

    expect(iter[Symbol.asyncIterator]).toBeDefined();

    const result = await iter.next();
    expect(result.value).toBe("chunk");
  });
});
