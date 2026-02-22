# Feature Specification: Spec Score

**Feature Branch**: `011-spec-score`
**Created**: 2026-02-22
**Status**: Draft
**Input**: User description: "Build a Spec Score feature that evaluates the quality of AI-generated content across all three SDD phases (spec, plan, and tasks). The evaluation uses a hybrid approach: instant rule-based checks followed by optional AI deep analysis."

## Clarifications

### Session 2026-02-22

- Q: Where should evaluation UI (buttons + results) appear in the phase view? → A: In a collapsible panel between the section editors and the Approve button
- Q: When should evaluation results be invalidated after content changes? → A: On debounced save (1000ms after user stops typing)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant Rule-Based Evaluation (Priority: P1)

A user has generated spec content and wants to quickly check if it meets structural quality standards before proceeding. They click an "Evaluate" button, and within a second a collapsible panel appears between the section editors and the Approve button, showing a checklist of passing and failing rules with specific explanations for each failure.

**Why this priority**: This is the core value proposition — instant, zero-cost feedback on content quality. It works offline, requires no API key, and provides actionable results immediately. Users can iterate on content quality without any friction.

**Independent Test**: Can be fully tested by generating spec content, clicking Evaluate, and verifying that rule results appear as a checklist with green/red indicators and explanations.

**Acceptance Scenarios**:

1. **Given** a spec phase with all sections filled, **When** the user clicks "Evaluate", **Then** rule-based checks run instantly and display a checklist showing pass/fail status for each rule with explanations for failures
2. **Given** a spec phase where requirements lack EARS keywords, **When** the user clicks "Evaluate", **Then** the checklist shows a red X for the EARS keyword check with a message identifying which requirements are missing keywords
3. **Given** a plan phase with all expected sections filled, **When** the user clicks "Evaluate", **Then** the checklist shows green checkmarks for section existence and non-empty content checks
4. **Given** a tasks phase where a task references a non-existent dependency, **When** the user clicks "Evaluate", **Then** the checklist shows a red X for dependency validation with the specific invalid reference identified
5. **Given** evaluation results already displayed, **When** the user edits the phase content and the debounced save fires, **Then** the existing evaluation results are cleared (invalidated)

---

### User Story 2 - AI Deep Analysis (Priority: P2)

A user wants a more thorough quality assessment beyond structural checks. They click a "Deep Analysis" button which sends the phase content to an AI model for evaluation across multiple quality dimensions. The results display as dimension scores with specific improvement suggestions.

**Why this priority**: Adds significant value by providing nuanced, context-aware feedback that rule-based checks cannot offer. Depends on US1's infrastructure (evaluation display, persistence). Requires an API call, so it is an opt-in enhancement.

**Independent Test**: Can be tested by clicking "Deep Analysis" on a phase with content, verifying that dimension scores (1-5) and actionable suggestions appear, and that the suggestions include quotes from the content.

**Acceptance Scenarios**:

1. **Given** a phase with content, **When** the user clicks "Deep Analysis", **Then** the system sends content to the AI model and displays scores (1-5) for completeness, testability, unambiguity, consistency, and actionability
2. **Given** a deep analysis is in progress, **When** the user is waiting, **Then** they see a loading indicator and the button is disabled
3. **Given** a completed deep analysis, **When** the user views the results, **Then** each dimension score is shown as a progress bar with a label, and specific improvement suggestions are listed with quoted content excerpts
4. **Given** a deep analysis has completed, **When** the user edits the phase content and the debounced save fires, **Then** the deep analysis results are cleared (invalidated)
5. **Given** the AI service is unavailable, **When** the user clicks "Deep Analysis", **Then** they see a user-friendly error message and can retry

---

### User Story 3 - Cross-Phase Analysis (Priority: P2)

A user wants to verify that their plan addresses all requirements from the spec, and that their tasks cover all plan components. The AI deep analysis includes cross-phase checks when upstream phase content is available.

**Why this priority**: Same priority as US2 since it is part of the deep analysis flow. Provides unique value that complements the traceability matrix by checking quality of coverage, not just presence.

**Independent Test**: Can be tested by having content in spec and plan phases, running deep analysis on the plan, and verifying that the results include cross-phase coverage findings.

**Acceptance Scenarios**:

1. **Given** spec and plan phases both have content, **When** the user runs deep analysis on the plan phase, **Then** the results include whether the plan addresses all requirements identified in the spec
2. **Given** plan and tasks phases both have content, **When** the user runs deep analysis on the tasks phase, **Then** the results include whether tasks cover all components from the plan
3. **Given** only the spec phase has content, **When** the user runs deep analysis on the spec, **Then** no cross-phase analysis is shown (no upstream phase content available)

---

### User Story 4 - Persisted Results and Project Health (Priority: P3)

Evaluation results are saved so users do not need to re-run evaluations on every visit. The project list shows an overall health score derived from rule-based evaluation results, giving users a quick glance at project quality.

**Why this priority**: Quality-of-life improvement. Persistence infrastructure is established in US1, but the project-level health summary on project cards is an additional enhancement that reduces friction by showing quality at a glance.

**Independent Test**: Can be tested by running an evaluation, navigating away and back, and verifying results are still displayed. Can also be tested by checking that project cards show a health summary.

**Acceptance Scenarios**:

1. **Given** a user has run rule-based evaluation on a phase, **When** they navigate away and return, **Then** the evaluation results are still displayed without re-running
2. **Given** a user has run evaluation on multiple phases, **When** they view the project list, **Then** each project card shows an overall health score summarizing rule-based check results
3. **Given** a project with no evaluations run, **When** the user views the project list, **Then** no health score is shown on that project card
4. **Given** persisted evaluation results exist, **When** the phase content changes, **Then** the persisted results are cleared and the health score updates accordingly

---

### Edge Cases

- What happens when a phase has no content and the user clicks Evaluate? The system shows a message indicating there is nothing to evaluate.
- What happens when a phase has partial content (some sections empty)? Rule-based checks evaluate whatever content exists and flag empty sections as failures.
- What happens when the AI deep analysis returns malformed output? The system shows an error message and allows retry, preserving any existing rule-based results.
- What happens when the user clicks "Deep Analysis" without an API key configured? The system shows the same configuration prompt used by the generation features.
- What happens when evaluation results exist and the user regenerates content via AI? The results are invalidated since content has changed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST perform rule-based evaluation of spec phase content by checking that every requirement contains at least one EARS keyword (WHEN, THEN, SHALL, WHERE, IF), that all required sub-sections are present (Priority, Rationale, Main Flow, Validation Rules, Error Handling), and that at least one performance target exists
- **FR-002**: System MUST perform rule-based evaluation of plan phase content by checking that all expected sections exist (Architecture, API Contracts, Data Model, Tech Decisions, Security & Edge Cases) and that each section has non-empty content
- **FR-003**: System MUST perform rule-based evaluation of tasks phase content by checking that each task has a number, title, dependencies, file mapping, and test expectations, and that all dependency references point to existing tasks
- **FR-004**: System MUST display rule-based evaluation results in a collapsible panel positioned between the section editors and the Approve button, showing a checklist with green checkmarks for passing rules and red X marks for failing rules, with a specific explanation for each failure
- **FR-005**: System MUST provide an AI deep analysis capability that evaluates phase content across five dimensions: completeness, testability, unambiguity, consistency, and actionability, returning a score from 1 to 5 for each dimension
- **FR-006**: System MUST display AI deep analysis results as progress bars for each dimension score, along with specific improvement suggestions that include quoted excerpts from the evaluated content
- **FR-007**: System MUST perform cross-phase analysis during AI deep analysis: when analyzing the plan phase, check if it addresses all spec requirements; when analyzing the tasks phase, check if tasks cover all plan components
- **FR-008**: System MUST persist evaluation results (both rule-based and AI deep analysis) so they are available without re-running on subsequent visits
- **FR-009**: System MUST invalidate (clear) persisted evaluation results for a phase when the debounced save fires after content changes (1000ms after the user stops typing)
- **FR-010**: System MUST display an overall health score on each project card in the project list, derived from the most recent rule-based evaluation results across all phases
- **FR-011**: System MUST show a loading state while AI deep analysis is in progress and disable the Deep Analysis button to prevent duplicate requests
- **FR-012**: System MUST display a user-friendly error message if AI deep analysis fails and allow the user to retry

### Key Entities

- **RuleCheckResult**: Represents the outcome of a single rule-based check — includes rule name, pass/fail status, and failure explanation
- **PhaseEvaluation**: Represents the complete evaluation results for a single phase — includes a list of rule check results, an optional AI deep analysis result, and a content hash used for invalidation
- **DeepAnalysisResult**: Represents AI analysis output — includes dimension scores (completeness, testability, unambiguity, consistency, actionability each scored 1-5), improvement suggestions with content quotes, and optional cross-phase findings
- **ProjectHealthScore** *(derived, not stored)*: A computed summary representing overall project quality — calculated at render time from rule-based pass rates across evaluated phases

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Rule-based evaluation results appear within 1 second of clicking "Evaluate"
- **SC-002**: Users can identify and fix content quality issues without leaving the phase view
- **SC-003**: AI deep analysis completes and displays results within the same timeframe as content generation (under 30 seconds)
- **SC-004**: Evaluation results persist across page navigations and browser sessions — returning to a previously evaluated phase shows results immediately
- **SC-005**: Content changes automatically invalidate stale evaluation results so users never see outdated scores
- **SC-006**: Project list health scores give users an at-a-glance understanding of quality across all projects without opening each one

## Assumptions

- The existing content generation prompts produce output in a consistent enough format for rule-based parsing (EARS keywords in spec, section headers in plan, numbered tasks in tasks phase)
- Progress bars are used for AI dimension scores instead of a radar chart, as they are simpler, more accessible, and consistent with the existing component library
- The content hash for invalidation is computed from the concatenated section content of each phase — any change to any section invalidates all results for that phase
- Cross-phase analysis is bundled into the AI deep analysis call rather than being a separate action, to minimize API costs
- The health score on project cards uses a simple pass-rate display (e.g., "8/10 checks passing") rather than a numeric score, to be immediately understandable
