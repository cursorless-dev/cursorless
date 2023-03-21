# Hat assignment

Every time you move your cursor, edit a document, or scroll, Cursorless assigns hats to the tokens in each visible editor. When selecting hats, Cursorless attempts to give "good" hats to tokens near your cursor, while at the same time keeping hats from moving around too much.

Hats are considered "good" that require fewer syllables to say, so for example, a gray dot is the best kind of hat, because you just say the letter it sits on, whereas a colored shape (eg `"blue fox"`) is the worst kind of hat, because you need to say both color and shape. Each hat style has a penalty associated with it that indicates how many syllables it requires to say:

| Hat Style     | Example spoken form | Penalty |
| ------------- | ------------------- | ------- |
| gray dot      | `"air"`             | 0       |
| colored dot   | `"blue air"`        | 1       |
| gray shape    | `"fox air"`         | 1       |
| colored shape | `"blue fox air"`    | 2       |

## The algorithm

Every time you move your cursor, edit the document, or scroll, Cursorless does a pass through all visible tokens, assigning them hats. It does so by walking through the tokens one by one in order of their "rank". A token's rank is determined by how close it is to your cursor: tokens near your cursor are considered higher rank and get to pick their hats first. For each token, Cursorless proceeds as follows:

### 1. Discard any hats that are considered unacceptable

When a token is picking its hat, it will have a pool of available hats based on

- Which hats are enabled,
- What characters make up the token,
- Which hats have already been taken by a higher ranked hat.

One of these candidate hats might be the hat the token was already wearing before this pass started (if it had one), and some of them will be hats that lower ranked tokens were wearing before the pass started.

The token will start by figuring out the penalty of the best candidate hat (eg is there a gray dot? Are they all colored shapes? etc). Based on that penalty, it will consider only the candidate hats whose penalty is sufficiently close to the best hat. The definition of "sufficiently close" is determined by the user setting `cursorless.experimental.hatStability`:

| Setting value          | Behaviour                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `greedy`               | Only consider hats whose penalty is just as good as the best candidate hat. This setting will result in less stable hats, but ensure that tokens near the cursor always get the best hats.                                                                          |
| `balanced` _(default)_ | If the best candidate hat has a penalty below 2 (eg it is a gray shape or colored dot), then discard all hats whose penalty is 2 or greater. This setting results in fairly stable hats, while ensuring that all tokens near the cursor have a penalty less than 2. |
| `stable`               | Don't discard any hats. Always keep existing hat if it wasn't stolen, and don't steal hats unless there are no free hats left to this token. Note that if you have no shapes enabled, then this setting is equivalent to `balanced`.                                |

### 2. Select a hat from the remaining hat candidates

Once the "unacceptable" hats are discarded, then if the token's existing hat is amongst the remaining acceptable hats, it will keep it. If not, it will pick a hat that won't require it to steal from a lower ranked token if any such hats are left. If it can't keep its own hat or avoid stealing a hat, it will steal a hat from the lowest ranked token.
