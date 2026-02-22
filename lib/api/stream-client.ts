export class StreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamError";
  }
}

async function* parseSSEStream(
  response: Response,
): AsyncGenerator<string, void, undefined> {
  if (!response.body) {
    throw new StreamError("Response body is null");
  }

  const reader = response.body.getReader();
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
      if (!line.startsWith("data: ")) continue;

      let data;
      try {
        data = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (data.type === "content") {
        yield data.text;
      } else if (data.type === "error") {
        throw new StreamError(data.message);
      } else if (data.type === "done") {
        return;
      }
    }
  }
}

async function fetchSSE(
  url: string,
  body: unknown,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new StreamError("Network error");
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const json = await response.json();
      message = json.error || message;
    } catch {
      // ignore parse error
    }
    throw new StreamError(message);
  }

  return response;
}

export interface GenerateParams {
  action: string;
  projectDescription?: string;
  specContent?: string;
  planContent?: string;
  tasksContent?: string;
  sectionName?: string;
  phaseContext?: string;
  instruction?: string;
  phaseType?: string;
  phaseContent?: string;
  upstreamContent?: string;
}

export async function* streamGenerate(
  params: GenerateParams,
): AsyncGenerator<string, void, undefined> {
  const response = await fetchSSE("/api/generate", params);
  yield* parseSSEStream(response);
}

export interface ChatParams {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  projectContext: string;
  phaseType: string;
}

export async function* streamChat(
  params: ChatParams,
): AsyncGenerator<string, void, undefined> {
  const response = await fetchSSE("/api/chat", params);
  yield* parseSSEStream(response);
}
