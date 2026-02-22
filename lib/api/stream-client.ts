export class StreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamError";
  }
}

export interface GenerateParams {
  action: string;
  projectDescription?: string;
  requirementsContent?: string;
  sectionName?: string;
  phaseContext?: string;
}

export async function* streamGenerate(
  params: GenerateParams,
): AsyncGenerator<string, void, undefined> {
  let response: Response;
  try {
    response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    throw new StreamError("Network error");
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // ignore parse error
    }
    throw new StreamError(message);
  }

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
