import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { getChatSystemPrompt } from "@/lib/prompts/chat";

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  projectContext: string;
  phaseType: string;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 401 });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  if (!body.phaseType || !["spec", "plan", "tasks"].includes(body.phaseType)) {
    return Response.json({ error: "Invalid phaseType" }, { status: 400 });
  }

  const system = getChatSystemPrompt(body.projectContext || "", body.phaseType);
  const client = new Anthropic({ apiKey });

  let stream: AsyncIterable<Anthropic.MessageStreamEvent>;
  try {
    stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      stream: true,
      system,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof APIError) {
      const messages: Record<number, string> = {
        401: "Invalid API key",
        429: "Rate limit exceeded",
      };
      const status = error.status;
      const message = messages[status] || "API error";
      return Response.json({ error: message }, { status });
    }
    return Response.json({ error: "API error" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({
              type: "content",
              text: event.delta.text,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        const done = JSON.stringify({ type: "done" });
        controller.enqueue(encoder.encode(`data: ${done}\n\n`));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Stream error";
        const errorData = JSON.stringify({ type: "error", message });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
