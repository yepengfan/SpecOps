---
name: review-pr
description: Review a GitHub pull request and post review comments directly on the PR. Usage: /review-pr <number>
user-invokable: true
argument-hint: "<pr-number>"
---

## GitHub PR Review

Review pull request #$ARGUMENTS and post a structured review with inline comments.

### Steps

1. Run `gh pr view $ARGUMENTS` to get PR details
2. Run `gh pr diff $ARGUMENTS` to get the full diff
3. Run `gh pr diff $ARGUMENTS --name-only` to list changed files
4. Read modified files in full if needed for context

### Review Criteria

Analyze changes for:

- **Correctness**: Logic errors, off-by-one bugs, missing edge cases
- **Security**: Exposed secrets, injection vulnerabilities, unsafe inputs
- **Code quality**: Readability, naming, duplication, complexity
- **Performance**: Unnecessary computation, missing optimizations
- **Testing**: Are new changes covered by tests? Missing test cases?
- **Consistency**: Does the code follow existing project patterns?

### Posting the Review

After analyzing, post a review on the PR using `gh`:

```
gh pr review $ARGUMENTS --comment --body "<review body>"
```

Use `--approve` instead of `--comment` if there are no issues.
Use `--request-changes` instead of `--comment` if there are critical issues.

The review body should follow this format:

```
## Code Review

**Summary**: One-line description of what the changes do.

### Critical Issues (must fix)
- [ ] Description with file path and line reference

### Warnings (should fix)
- [ ] Description with file path and line reference

### Suggestions (optional)
- Description with file path and line reference

**Verdict**: APPROVE / REQUEST_CHANGES / COMMENT
```

If the diff is large, also add inline comments on specific lines using:
```
gh api "repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pulls/$ARGUMENTS/comments" -f body="<comment>" -f path="<file>" -f side="RIGHT" -F line=<line_number> -f commit_id="$(gh pr view $ARGUMENTS --json headRefOid -q .headRefOid)"
```
