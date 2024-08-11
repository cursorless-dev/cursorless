---
tags: [enhancement]
pullRequest: 2652
---

If no scope is specified for head/tail instead of defaulting to just line we now use the smallest of line or surrounding pair interior. This means that "take head" would be bounded by the surrounding pair just like "short paint". If there is no surrounding pair the line is used just like today. You can also override this behavior by specifying line. "take head line" would always use the line regardless if you are in a surrounding pair or not.
