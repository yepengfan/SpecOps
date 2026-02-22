import { computePhaseHash } from "@/lib/eval/hash";
import type { Section } from "@/lib/types";

function makeSection(content: string): Section {
  return { id: "s1", title: "Test", content };
}

describe("computePhaseHash", () => {
  it("returns deterministic output for the same content", () => {
    const sections = [makeSection("hello"), makeSection("world")];
    const hash1 = computePhaseHash(sections);
    const hash2 = computePhaseHash(sections);
    expect(hash1).toBe(hash2);
  });

  it("returns a hex string", () => {
    const hash = computePhaseHash([makeSection("test")]);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("produces different hashes for different content", () => {
    const hash1 = computePhaseHash([makeSection("aaa")]);
    const hash2 = computePhaseHash([makeSection("bbb")]);
    expect(hash1).not.toBe(hash2);
  });

  it("uses \\x00 delimiter to prevent adjacent-section collisions", () => {
    // "ab" + "cd" vs "a" + "bcd" should produce different hashes
    const hash1 = computePhaseHash([makeSection("ab"), makeSection("cd")]);
    const hash2 = computePhaseHash([makeSection("a"), makeSection("bcd")]);
    expect(hash1).not.toBe(hash2);
  });

  it("handles empty sections", () => {
    const hash = computePhaseHash([makeSection("")]);
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("handles no sections", () => {
    const hash = computePhaseHash([]);
    expect(typeof hash).toBe("string");
  });
});
