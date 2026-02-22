import { parseEditSuggestion } from "@/lib/chat/edit-parser";

describe("parseEditSuggestion", () => {
  it("parses a single [EDIT] marker into a SuggestedEdit object", () => {
    const input = [
      "Here's my suggestion for the problem statement:",
      "",
      "[EDIT problem-statement spec]",
      "The system shall provide real-time analytics...",
      "[/EDIT]",
      "",
      "Let me know if you'd like changes.",
    ].join("\n");

    const result = parseEditSuggestion(input);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      sectionId: "problem-statement",
      phaseType: "spec",
      proposedContent: "The system shall provide real-time analytics...",
      status: "pending",
    });
  });

  it("returns null when no markers are present", () => {
    const input = "This is just a regular message with no edit markers.";

    const result = parseEditSuggestion(input);

    expect(result).toBeNull();
  });

  it("extracts sectionId, phaseType, and proposedContent correctly", () => {
    const input = "[EDIT auth-module plan]\nDesign an OAuth2 flow.\n[/EDIT]";

    const result = parseEditSuggestion(input);

    expect(result).not.toBeNull();
    expect(result!.sectionId).toBe("auth-module");
    expect(result!.phaseType).toBe("plan");
    expect(result!.proposedContent).toBe("Design an OAuth2 flow.");
    expect(result!.status).toBe("pending");
  });

  it("handles multiline proposed content", () => {
    const input = [
      "[EDIT ears-requirements spec]",
      "- **FR-001**: WHEN user logs in, the system SHALL create a session.",
      "- **FR-002**: WHEN session expires, the system SHALL redirect to login.",
      "- **FR-003**: The system SHALL support OAuth2 authentication.",
      "[/EDIT]",
    ].join("\n");

    const result = parseEditSuggestion(input);

    expect(result).not.toBeNull();
    expect(result!.proposedContent).toBe(
      [
        "- **FR-001**: WHEN user logs in, the system SHALL create a session.",
        "- **FR-002**: WHEN session expires, the system SHALL redirect to login.",
        "- **FR-003**: The system SHALL support OAuth2 authentication.",
      ].join("\n"),
    );
  });

  it("trims whitespace from proposed content", () => {
    const input = [
      "[EDIT nfr-section spec]",
      "",
      "  The system shall respond within 200ms.  ",
      "",
      "[/EDIT]",
    ].join("\n");

    const result = parseEditSuggestion(input);

    expect(result).not.toBeNull();
    expect(result!.proposedContent).toBe(
      "The system shall respond within 200ms.",
    );
  });

  describe("handles malformed markers gracefully", () => {
    it("returns null when closing tag is missing", () => {
      const input = "[EDIT problem-statement spec]\nSome content without end.";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });

    it("returns null when section-id is missing", () => {
      const input = "[EDIT spec]\nContent here.\n[/EDIT]";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });

    it("returns null when phaseType is invalid", () => {
      const input = "[EDIT problem-statement invalid]\nContent here.\n[/EDIT]";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });

    it("returns null for empty opening tag", () => {
      const input = "[EDIT]\nContent here.\n[/EDIT]";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });

    it("returns null when opening tag is missing", () => {
      const input = "Some content.\n[/EDIT]";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });

    it("returns null when header contains newlines", () => {
      const input = "[EDIT problem-statement\nspec]\nContent here.\n[/EDIT]";

      const result = parseEditSuggestion(input);

      expect(result).toBeNull();
    });
  });

  it("returns the first marker if multiple exist", () => {
    const input = [
      "[EDIT problem-statement spec]",
      "First suggestion content.",
      "[/EDIT]",
      "",
      "[EDIT task-breakdown tasks]",
      "Second suggestion content.",
      "[/EDIT]",
    ].join("\n");

    const result = parseEditSuggestion(input);

    expect(result).not.toBeNull();
    expect(result!.sectionId).toBe("problem-statement");
    expect(result!.phaseType).toBe("spec");
    expect(result!.proposedContent).toBe("First suggestion content.");
  });
});
