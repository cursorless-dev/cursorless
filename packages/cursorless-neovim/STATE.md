Quick summary of what is supported atm.

Supported:

- cursorless commands generally available from all the modes: normal (n), insert (i), normal terminal (nt), terminal (t), visual (v)
- marks (row, this, that, source)
- scopes (line, paint, short paint, token, file, char, block, identifier, round, curly, box, diamond, twin, quad, skis, pair, etc)
- modifiers (previous, next, first, second, etc, two, three, etc, last, backward, sub, past, tail, head, just, inside, its, start of, end of, before, after, until, etc)
- edition actions in n, i, v (chuck, bring, change, clone etc)
- limited support for "and" modifier if result in no or single cursor
- selection/moving actions in any mode (take, pre, post)
- copy to clipboard action from any mode (copy)
- fallback bring action in terminal (t, nt) always brings to command prompt current position (bring)

Not supported:

- decorated symbols marks (no coloured hats are drawn)
- syntactic scopes (no treesitter)
- multiple cursors (no modifiers: every, instance, from, bounds, slice) (no action: give)
- scope visualizer
- search commands (scout, etc)

Todo/test as should work:

- actions: move, pre, post, paste, carve, swap, indent, dedent, increment, decrement, drink, pour, phones, wrap, repack, join, break
- marks: up, down
- from line take next instance this

Not sure if supported:

- crown, center, bottom
