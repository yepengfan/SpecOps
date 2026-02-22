---
name: review
description: Review local changes (staged and unstaged) before pushing. Analyzes code quality, security, and correctness.
user-invokable: true
---

## Local Code Review

Review the current local changes (both staged and unstaged) against the base branch.

### Steps

1. Run `git status` to see what files have changed
2. Run `git diff` to see unstaged changes
3. Run `git diff --cached` to see staged changes
4. Run `git log --oneline -5` for recent commit context
5. Read any modified files in full if needed for context

### Review Criteria

Analyze changes for:

- **Correctness**: Logic errors, off-by-one bugs, missing edge cases
- **Security**: Exposed secrets, injection vulnerabilities, unsafe inputs
- **Code quality**: Readability, naming, duplication, complexity
- **Performance**: Unnecessary computation, missing optimizations
- **Testing**: Are new changes covered by tests? Missing test cases?
- **Consistency**: Does the code follow existing project patterns?

### Output Format

Provide a structured review:

**Summary**: One-line description of what the changes do.

**Critical Issues** (must fix before pushing):
- List with file paths and line numbers

**Warnings** (should fix):
- List with file paths and line numbers

**Suggestions** (optional improvements):
- List with file paths and line numbers

**Verdict**: APPROVE, REQUEST_CHANGES, or NEEDS_DISCUSSION

If there are no issues, say so clearly and approve.
