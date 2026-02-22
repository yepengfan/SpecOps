import type { Section } from "@/lib/types";

/**
 * Compute a fast, non-cryptographic hash of phase content sections.
 * Uses djb2 algorithm. Sections are joined with \x00 delimiter to prevent
 * adjacent-section collisions.
 */
export function computePhaseHash(sections: Section[]): string {
  const input = sections.map((s) => s.content).join("\x00");
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}
