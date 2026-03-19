# Destinations

Some actions expect a destination, rather than a target. Destinations combine a preposition and a target, to define a place and behavior for a Cursorless action.

## `"to <target>"`

Replaces the target.

For example, `"paste to air"` replaces the token with a hat over the `a` with the contents of the clipboard.

## `"after <target>"`

Inserts after the target, adding delimiters as appropriate.

For example, `"paste after air"` inserts a space after the token with a hat over the `a`, followed by the contents of the clipboard.

## `"before <target>"`

Inserts before the target, adding delimiters as appropriate.

For example, `"paste before air"` inserts a space before the token with a hat over the `a`, then places the contents of the clipboard before the space.
