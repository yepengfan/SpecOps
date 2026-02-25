# Research: Claude Code-Style Loading Messages

**Branch**: `022-claude-code-loading-messages` | **Date**: 2026-02-25

## R1: Random Selection Strategy

**Decision**: `Math.floor(Math.random() * length)` in a do-while loop that excludes the current index

**Rationale**:
- Simple and well-understood pattern for random selection with exclusion
- The do-while loop ensures the next message is always different from the current one
- With 10 messages, the probability of a re-roll is only 10%, so performance is not a concern
- Passing `-1` as the exclusion value for initial selection allows any message to be chosen

**Alternatives considered**:
- **Fisher-Yates shuffle**: Over-engineered for selecting one random item. Shuffle is useful when you need a full permutation, not a single pick.
- **Weighted random with recency decay**: Unnecessarily complex. Simple exclusion of the current message is sufficient to prevent repetition.
- **Pre-computed random sequence**: Would add complexity for marginal benefit. Real-time random selection is simpler and equally effective.

## R2: Shared vs Phase-Specific Messages

**Decision**: Single shared `string[]` replacing `Record<Phase, string[]>`

**Rationale**:
- User explicitly requested Claude Code-style thinking verbs — these are generic by nature (thinking, analyzing, reasoning) and not phase-specific
- Simplifies the component — fewer data structures, no phase-based lookup
- The `phase` prop is retained in the interface for API compatibility but is unused for message selection
- This avoids modifying the 3 page files that pass the `phase` prop

**Alternatives considered**:
- **Keep phase-specific with Claude Code verbs**: Would require 3x the messages with artificial phase differentiation. Doesn't match the "Claude Code style" which uses generic thinking verbs.
- **Remove `phase` prop entirely**: Would require modifying all 3 page files. Keeping it unused is simpler.

## R3: Initial Message Selection

**Decision**: Random initial message via `randomIndex(-1)` instead of always starting at index 0

**Rationale**:
- Matches the random selection philosophy — if messages are random during rotation, the initial message should also be random
- Passing `-1` as the exclude parameter means no message is excluded, allowing any of the 10 to be chosen
- Makes the experience feel more varied across multiple generation sessions

## R4: Test Strategy for Random Behavior

**Decision**: Mock `Math.random` with `jest.spyOn(Math, "random")` for deterministic test assertions

**Rationale**:
- `Math.random` is the only source of randomness in the component
- Mocking it allows tests to predict exactly which message will be selected
- Multiple mock return values can be chained to test the repeat-avoidance logic (first call returns same index → triggers re-roll → second call returns different index)
- This is a standard Jest pattern for testing random behavior
