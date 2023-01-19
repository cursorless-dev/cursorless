# Hat assignment

Every time you move your cursor, edit the document, or scroll, Cursorless assigns hats to the tokens in each visible editor. When selecting hats, Cursorless attempts to give "good" hats to tokens near your cursor, while keeping hats from moving around too much.

Hats are considered "good" that require fewer syllables to say, so for example, a gray dot is the best kind of hat, because you just say the letter it sits on, whereas a colored shape (eg `"blue fox"`) is the worst kind of hat, because you need to say both color and shape. Each hat style has a penalty associated with it that indicates how many syllables it requires to say:

| Hat Style     | Example spoken form | Penalty |
| ------------- | ------------------- | ------- |
| gray dot      | `"air"`             | 0       |
| colored dot   | `"blue air"`        | 1       |
| gray shape    | `"fox air"`         | 1       |
| colored shape | `"blue fox air"`    | 2       |

## The algorithm

Every time you move your cursor, edit the document, or scroll, Cursorless does a pass through all visible tokens, assigning them hats. It does so by walking through the tokens one by one in order of their "rank". A token's rank is determined by how close it is to your cursor: tokens near your cursor are considered higher rank and get to pick their hats first. For each token, Cursorless decides:

### 1. Should the token keep its hat?

If a token currently has a hat, and a higher ranked token hasn't already stolen it during this pass, we need to decide whether the token should keep its hat or pick a new one. To decide, Cursorless compares the token's current hat to the best available hat (ie not already taken by a higher ranked token in this pass). It consults the `cursorless.experimental.hatStability.keepingPolicy` setting:

| Setting value           | Behaviour                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `greedy`                | Only keep current hat if it is as good as best hat                                           |
| `floor`                 | Only keep current hat if its penalty's floor (integer part) is the same as floor of best hat |
| `round`                 | Only keep current hat if its rounded penalty is the same as best hat's rounded penalty       |
| `threshold` _(default)_ | Keep current hat unless token can drop its penalty below 2 by switching.                     |
| `stable`                | Always keep current hat if it is available.                                                  |

This setting tends to have a greater impact on how much hats move when you're just moving your cursor without editing or scrolling, as no new tokens are appearing, so there are fewer new tokens trying to steal hats from lower ranked tokens.

Now, if we have decided to keep our hat, we move on to the next token. Otherwise, we need to decide which new hat to use, the important question being:

### 2. Should we steal a hat from a lower ranked token?

If a token decides not to keep its hat, then it needs to decide whether it should steal a hat from a lower ranked token or use a hat that is not currently in use. To decide, Cursorless compares the best available hat to the best free hat (not currently in use by a lower ranked token). It consults the `cursorless.experimental.hatStability.stealingPolicy` setting:

| Setting value           | Behaviour                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `greedy`                | Use a free hat if it is as good as best hat                                           |
| `floor`                 | Use a free hat if its penalty's floor (integer part) is the same as floor of best hat |
| `round`                 | Use a free hat hat if its rounded penalty is the same as best hat's rounded penalty   |
| `threshold` _(default)_ | Use a free hat unless token can drop its penalty below 2 by stealing.                 |
| `stable`                | Always use a free hat if one is available.                                            |

This setting tends to have a greater impact on how much hats move when you're editing or scrolling, as new tokens are appearing that may want to steal hats from existing tokens.
