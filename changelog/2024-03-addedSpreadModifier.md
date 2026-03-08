---
tags: [enhancement]
pullRequest: 2254
---

- Added every/spread ordinal/relative modifier. Turns relative and ordinal range modifiers into multiple target selections instead of contiguous range.

- `"take every two tokens"` selects two tokens as separate selections
- `"pre every first two lines"` puts a cursor before each of first two lines in block (results in multiple cursors)
