---
tags: [enhancement]
pullRequest: 2094
---

- Added `visible` modifier. This modifier returns all visible ranges. In most cases this will just be a single range starting from the first visible line and ending at the last visible line. If there are visible folded regions these break the visible range into po multiple ranges.
