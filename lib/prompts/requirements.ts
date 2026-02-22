const SECTION_HEADINGS = [
  "## Problem Statement",
  "## EARS Requirements",
  "## Non-Functional Requirements",
] as const;

export function getRequirementsSystemPrompt(): string {
  return `You are a requirements engineer. Given a project description, generate a structured requirements document with exactly three sections using these markdown headings:

## Problem Statement
A clear, concise description of the problem being solved.

## EARS Requirements
Functional requirements using the EARS (Easy Approach to Requirements Syntax) format. Each requirement MUST use one or more of these keywords: WHEN, THEN, SHALL, WHERE, IF.

Format each requirement as:
- **REQ-<number>**: <EARS-formatted requirement>

Example:
- **REQ-1**: WHEN the user clicks the login button, the system SHALL display the authentication dialog.
- **REQ-2**: IF the session has expired, THEN the system SHALL redirect to the login page.

## Non-Functional Requirements
Non-functional requirements covering performance, security, usability, reliability, etc.

Format each as:
- **NFR-<number>**: <requirement>

Output ONLY the markdown content with the three headings above. Do not include any preamble or closing remarks.`;
}

export function getRegenerateSectionPrompt(sectionName: string): string {
  return `You are a requirements engineer. Regenerate ONLY the content for the section titled "${sectionName}".

Output the section content directly WITHOUT the heading (the heading is managed separately). Do not include any other sections, preamble, or closing remarks.

If the section is "EARS Requirements", use the EARS format with WHEN/THEN/SHALL/WHERE/IF keywords:
- **REQ-<number>**: <EARS-formatted requirement>

If the section is "Non-Functional Requirements", format as:
- **NFR-<number>**: <requirement>`;
}

interface ParsedRequirements {
  problemStatement: string;
  earsRequirements: string;
  nonFunctionalRequirements: string;
  malformed: boolean;
}

export function parseRequirementsSections(raw: string): ParsedRequirements {
  const result: ParsedRequirements = {
    problemStatement: "",
    earsRequirements: "",
    nonFunctionalRequirements: "",
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

  result.problemStatement = extractContent(
    positions[0].index,
    positions[0].heading.length,
    positions[1].index,
  );

  result.earsRequirements = extractContent(
    positions[1].index,
    positions[1].heading.length,
    positions[2].index,
  );

  result.nonFunctionalRequirements = extractContent(
    positions[2].index,
    positions[2].heading.length,
  );

  return result;
}
