const SECTION_HEADINGS = [
  "## Task List",
  "## Dependencies",
  "## File Mapping",
  "## Test Expectations",
] as const;

export function getTasksSystemPrompt(): string {
  return `You are a software architect. Given an approved spec and a plan document, generate a structured task breakdown with exactly four sections using these markdown headings:

## Task List
An ordered list of atomic, implementable tasks. Each task should be small enough for a single developer to complete in one session. Use the format:
- **T<number>**: <task description>

Number tasks sequentially. Reference specific spec items (REQ-/NFR-) and plan decisions where applicable.

## Dependencies
Define the execution order and dependencies between tasks. Use the format:
- T<number> → T<number> (reason)

List which tasks must complete before others can begin. Include a mermaid dependency graph (\`\`\`mermaid ... \`\`\`) showing task execution order.

## File Mapping
Map each task to the files it will create or modify. Use the format:
- T<number>: <file paths>

## Test Expectations
Define the expected tests for each task. Use the format:
- T<number>: <test description>

Include unit tests, integration tests, and E2E tests as appropriate.

Use the approved spec and plan document as the basis for all task decisions. Output ONLY the markdown content with the four headings above. Do not include any preamble or closing remarks.`;
}

export function getRegenerateTaskSectionPrompt(sectionName: string, instruction?: string): string {
  let prompt = `You are a software architect. Regenerate ONLY the content for the section titled "${sectionName}".

Output the section content directly WITHOUT the heading (the heading is managed separately). Do not include any other sections, preamble, or closing remarks.

If the section is "Task List", use the format:
- **T<number>**: <task description>

If the section is "Dependencies", use the format:
- T<number> → T<number> (reason)
Also include a mermaid dependency graph (\`\`\`mermaid ... \`\`\`) showing task execution order.

If the section is "File Mapping", use the format:
- T<number>: <file paths>

If the section is "Test Expectations", use the format:
- T<number>: <test description>`;

  if (instruction) {
    prompt += `\n\nArchitect's advice: ${instruction}`;
  }

  return prompt;
}

interface ParsedTasks {
  taskList: string;
  dependencies: string;
  fileMapping: string;
  testExpectations: string;
  malformed: boolean;
}

export function parseTaskSections(raw: string): ParsedTasks {
  const result: ParsedTasks = {
    taskList: "",
    dependencies: "",
    fileMapping: "",
    testExpectations: "",
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

  result.taskList = extractContent(
    positions[0].index,
    positions[0].heading.length,
    positions[1].index,
  );

  result.dependencies = extractContent(
    positions[1].index,
    positions[1].heading.length,
    positions[2].index,
  );

  result.fileMapping = extractContent(
    positions[2].index,
    positions[2].heading.length,
    positions[3].index,
  );

  result.testExpectations = extractContent(
    positions[3].index,
    positions[3].heading.length,
  );

  return result;
}
