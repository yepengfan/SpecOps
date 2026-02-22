const SECTION_HEADINGS = [
  "## Architecture",
  "## API Contracts",
  "## Data Model",
  "## Tech Decisions",
  "## Security & Edge Cases",
] as const;

export function getPlanSystemPrompt(): string {
  return `You are a software architect. Given an approved spec, generate a structured plan document with exactly five sections using these markdown headings:

## Architecture
High-level system architecture including components, their responsibilities, and how they interact. Include diagrams using mermaid fenced code blocks (\`\`\`mermaid ... \`\`\`) where helpful — for example, component interaction diagrams or data flow diagrams. Do NOT use ASCII art or plain text diagrams.

## API Contracts
Define the API endpoints, request/response schemas, and communication protocols between system components.

## Data Model
Database schema, entity relationships, and data flow. Include table definitions and key constraints.

## Tech Decisions
Technology choices and their rationale. Cover frameworks, libraries, infrastructure, and deployment strategy.

## Security & Edge Cases
Security considerations, authentication/authorization approach, input validation, error handling, and edge cases to address.

Use the approved spec as the basis for all plan decisions. Output ONLY the markdown content with the five headings above. Do not include any preamble or closing remarks.

After the five sections, output a traceability comment in this exact format:
<!-- TRACEABILITY: [{"sectionId":"architecture","requirementIds":["req-1"]},{"sectionId":"api-contracts","requirementIds":["req-2"]},...] -->
Map each section to the requirement IDs (e.g. "req-1", "req-2") from the spec that it addresses. Use the "## Req N:" headings in the spec to identify requirement IDs.`;
}

export function getRegeneratePlanSectionPrompt(sectionName: string, instruction?: string): string {
  let prompt = `You are a software architect. Regenerate ONLY the content for the section titled "${sectionName}".

Output the section content directly WITHOUT the heading (the heading is managed separately). Do not include any other sections, preamble, or closing remarks.

Any diagrams MUST use mermaid fenced code blocks. Do NOT use ASCII art or plain text diagrams.`;

  if (instruction) {
    prompt += `\n\nArchitect's advice: ${instruction}`;
  }

  return prompt;
}

interface ParsedPlan {
  architecture: string;
  apiContracts: string;
  dataModel: string;
  techDecisions: string;
  securityEdgeCases: string;
  malformed: boolean;
}

export function parsePlanSections(raw: string): ParsedPlan {
  const result: ParsedPlan = {
    architecture: "",
    apiContracts: "",
    dataModel: "",
    techDecisions: "",
    securityEdgeCases: "",
    malformed: false,
  };

  // Find positions of each heading
  const positions: Array<{ heading: string; index: number }> = [];
  for (const heading of SECTION_HEADINGS) {
    const index = raw.indexOf(heading);
    if (index === -1) {
      result.malformed = true;
      return result;
    }
    positions.push({ heading, index });
  }

  // Verify headings appear in order
  for (let i = 1; i < positions.length; i++) {
    if (positions[i].index <= positions[i - 1].index) {
      result.malformed = true;
      return result;
    }
  }

  // Extract content between headings
  const extractContent = (startPos: number, headingLen: number, endPos?: number): string => {
    const start = startPos + headingLen;
    const content = endPos !== undefined ? raw.slice(start, endPos) : raw.slice(start);
    return content.trim();
  };

  result.architecture = extractContent(
    positions[0].index,
    positions[0].heading.length,
    positions[1].index,
  );

  result.apiContracts = extractContent(
    positions[1].index,
    positions[1].heading.length,
    positions[2].index,
  );

  result.dataModel = extractContent(
    positions[2].index,
    positions[2].heading.length,
    positions[3].index,
  );

  result.techDecisions = extractContent(
    positions[3].index,
    positions[3].heading.length,
    positions[4].index,
  );

  result.securityEdgeCases = extractContent(
    positions[4].index,
    positions[4].heading.length,
  );

  return result;
}
