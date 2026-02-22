import Anthropic, { APIError } from "@anthropic-ai/sdk";
import {
  getRequirementsSystemPrompt,
  getRegenerateSectionPrompt,
} from "@/lib/prompts/requirements";

const VALID_ACTIONS = ["generate-requirements", "regenerate-section"] as const;
type ValidAction = (typeof VALID_ACTIONS)[number];

interface GenerateRequest {
  action: string;
  projectDescription?: string;
  sectionName?: string;
  phaseContext?: string;
}

function isValidAction(action: string): action is ValidAction {
  return (VALID_ACTIONS as readonly string[]).includes(action);
}

function buildPrompt(action: ValidAction, body: GenerateRequest): {
  system: string;
  userMessage: string;
} {
  switch (action) {
    case "generate-requirements":
      return {
        system: getRequirementsSystemPrompt(),
        userMessage: `Generate requirements for the following project:\n\n${body.projectDescription || ""}`,
      };
    case "regenerate-section":
      return {
        system: getRegenerateSectionPrompt(body.sectionName || ""),
        userMessage: `Regenerate this section based on the following context:\n\n${body.phaseContext || ""}`,
      };
  }
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 401 });
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.action || !isValidAction(body.action)) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const { system, userMessage } = buildPrompt(body.action, body);
  const client = new Anthropic({ apiKey });

  let stream: AsyncIterable<Anthropic.MessageStreamEvent>;
  try {
    stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      stream: true,
      system,
      messages: [{ role: "user", content: userMessage }],
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

        const done = JSON.stringify({
          type: "done",
          traceabilityMappings: [],
        });
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
