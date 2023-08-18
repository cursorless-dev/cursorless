This directory contains hat allocation fixtures.

For any given fixture, it also contains:

- A .golden output file indicating hat allocations and ranges, assuming the cursor is at the beginning of the file. An underscore indicates a default hat, any other single character is a color or a shape, and two stacked characters are a color and a shape. See hatStats.test.ts for the mapping from colors and shapes to characters. This layout lets you see at a glance the penalty associated with a token by looking at the hat's height.

- A .stats output file providing a summary of the hat allocation within the file.

If these files have changed, you have changed something about the hat allocator. You should make sure that you are happy with the change.
