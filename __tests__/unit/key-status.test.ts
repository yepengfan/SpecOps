/**
 * @jest-environment node
 */
import { GET } from "@/app/api/key-status/route";

let originalKey: string | undefined;

beforeEach(() => {
  originalKey = process.env.ANTHROPIC_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = originalKey;
  }
});

describe("GET /api/key-status", () => {
  it("returns configured: true when env var is set", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test-key-123";

    const response = GET();
    const body = await response.json();

    expect(body).toEqual({ configured: true });
  });

  it("returns configured: false when env var is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = GET();
    const body = await response.json();

    expect(body).toEqual({ configured: false });
  });

  it("never returns the key value itself", async () => {
    const secretKey = "sk-ant-secret-value-xyz";
    process.env.ANTHROPIC_API_KEY = secretKey;

    const response = GET();
    const text = await response.text();

    expect(text).not.toContain(secretKey);
  });
});
