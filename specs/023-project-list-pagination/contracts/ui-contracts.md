# 023: UI Contracts

## ProjectList Component

No new props or component contracts. Changes are internal to `ProjectList`:

- **State**: `showAll: boolean` — toggles between truncated and full project list
- **Constant**: `PAGE_SIZE = 4` — max projects shown before "View All"
- **Derived**: `visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)`
- **UI**: `<Button variant="outline">` — "View All (N projects)" button, shown only when `!showAll && filtered.length > PAGE_SIZE`
