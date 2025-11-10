---
tags: [enhancement]
pullRequest: 3099
---

- Interior domain is now same as content range (before shrinking to text content). `"take inside"` with the cursor on a function name will not select function body anymore.
- Interior of typed target now utilities every scope. `"take inside funk"` will select function body. `"take inside state"` will select all branch bodies in an if statement.
