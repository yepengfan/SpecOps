const SECTION_HEADINGS = [
  "## Architecture",
  "## API Contracts",
  "## Data Model",
  "## Tech Decisions",
  "## Security & Edge Cases",
] as const;

export function getDesignSystemPrompt(): string {
  return `You are a software architect. Given approved requirements, generate a structured design document with exactly five sections using these markdown headings:

## Architecture
High-level system architecture including components, their responsibilities, and how they interact. Include diagrams in text form where helpful.

## API Contracts
Define the API endpoints, request/response schemas, and communication protocols between system components.

## Data Model
Database schema, entity relationships, and data flow. Include table definitions and key constraints.

## Tech Decisions
Technology choices and their rationale. Cover frameworks, libraries, infrastructure, and deployment strategy.

## Security & Edge Cases
Security considerations, authentication/authorization approach, input validation, error handling, and edge cases to address.

Use the approved requirements as the basis for all design decisions. Output ONLY the markdown content with the five headings above. Do not include any preamble or closing remarks.`;
}

export function getRegenerateDesignSectionPrompt(sectionName: string): string {
  return `You are a software architect. Regenerate ONLY the content for the section titled "${sectionName}".

Output the section content directly WITHOUT the heading (the heading is managed separately). Do not include any other sections, preamble, or closing remarks.`;
}

interface ParsedDesign {
  architecture: string;
  apiContracts: string;
  dataModel: string;
  techDecisions: string;
  securityEdgeCases: string;
  malformed: boolean;
}

export function parseDesignSections(raw: string): ParsedDesign {
  const result: ParsedDesign = {
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
