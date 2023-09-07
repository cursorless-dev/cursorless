This directory contains hat allocation fixtures.

For any given fixture, it also contains:

- A .golden output file indicating hat allocations and ranges. The cursor is at the beginning of the file. The line below the content has the token ranges. The line(s) above the content are the hats. An underscore indicates a default hat, any other single character is a "color" (letter) or a "shape" (number), and two stacked characters are a color and a shape. This layout lets you see at a glance the penalty associated with a token by looking at the hat's height. Tabs are replaced by a ␉ character so that fixed-width ASCII alignment works.

- A .stats output file providing a summary of the hat allocation within the file. It contains a sparkline showing the hat penalty per token, when the cursor is at the beginning of the file. (You can think of it as a concise summary of the golden hat heights.) And for a variety of metrics, it contains distribution information about hat allocations, as sampled with the cursor in several different locations in the file. For example, nHats is the percentage of tokens that have a hat at all. The distribution information includes min, max, mean, and a sparkline.

If these files have changed, you have changed something about the hat allocator. You should make sure that you are happy with the change.
