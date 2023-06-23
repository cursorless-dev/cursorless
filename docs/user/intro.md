# Guide to intermediate level Cursorless

This document will try to explicitly bring together a few concepts that underlie a lot of cursorless behavior, then walk through some example editing operations that are common but perhaps tricky to a beginner.
This document assumes that you understand the very basics of cursorless, like what commands `"take air"` and `"chuck line"` do.
If you don't have the basics down, please read some of [the main documentation page](README.md) and/or watch [the Cursorless tutorial videos](https://www.youtube.com/watch?v=5mAzHGM2M0k&list=PLXv2sppxeoQZz49evjy4T0QJRIgc_JPqs).

It is planned for this guide to be expanded to both basic and advanced levels.

## Some important concepts

### Commands have an action and a target or two

Commands have an action and a target or two. `"chuck air"` has the action `"chuck"` and one target (the `"air"` token).
`"bring air to bat"` has the action `"bring"` and two targets (the `"air"` and `"bat"` tokens).

A target can be more than a single token or line. A target can be a [range](README.md#range-targets), like `"air past bat"` that spans from the `"air"` token to the `"bat"` token, and that is still considered _one_ target.
A target can even be a vertical slice or list, like the list `"air and bat"`.
Doing `"take air and bat"` will result in multiple selections and multiple cursors, but it is still one target.

### Targets can be modified

A target contains a mark (ex: `"this"`, `"row ten"`, `"green curve air"`, etc) and target modifiers can be prefixed to suit your needs.
A big part of feeling comfortable and productive with Cursorless is getting familiar with the most useful mark types and target modifiers.
All of the [mark types](README.md#Marks) are worth knowing.
While there are many target modifiers, this document will help you get started fast by focusing on the most important modifiers to learn first.

The biggest difference between the simple `"bring air to bat"` and the intimidating `"bring next three lines air to tail block bat"` is the addition of target modifiers.
Target modifiers are often chained. `"tail block"` is a chain of two modifiers and they are applied in reverse order (`"block"`, then `"tail"`).

Modifier chains can be applied to each [primitive target](README.md#primitive-targets) in a [compound target](README.md#compound-targets).
For instance, `"take tail line air and head block bat"` has chain `"tail line"` applied to `"air"` and chain `"head block"` applied to `"bat"`.

### Some targets are destinations

Commands like `"paste"`, `"bring"`, and `"move"` have a target that is a destination.
Destinations are special.
Targets are converted into destinations using a destination converter (`"to"`, `"before"`, `"after"`); that is why you have to say commands like `"bring air to bat"` or `"bring air before bat"`.
The `"to"` might seem like cursorless is trying to resemble a sentence, but `"to"` actually serves a technical purpose of explicitly converting to a destination.

Your destinations should start with a single destination converter before you add modifiers and/or a mark.

### Targets sometimes include a delimiter

Some actions will operate on the specified target, and some actions will additionally operate on a delimiter that leads/trails the target.

The command `"take air"` will select a token.
The command `"chuck air"` will delete a token _and_ leading/trailing spaces (if appropriate ones exist).
Likewise, `"chuck block air"` will delete a block _and_ leading/trailing empty lines (if appropriate ones exist).

These default behaviors usually do what you want.
If you have the sentence `apple banana cherry` and run the command `"chuck bat"`, you usually don't want to end up with `apple  cherry` (note the two spaces), so the command deletes a token and appropriate token delimiter.

Here are some target types and their delimiters...

- Character or word within a token: nothing.
- Token: space.
- Argument and item: comma and space.
- Line: line ending.
- Block: empty line.

Destination converters `"before"` and `"after"` try to work with delimiters.
`"bring air before bat"` will bring a copy of the `"air"` token _with token delimiter (space)_ before the `"bat"` token giving you something like `"aaa bbb"`.

Special positional target modifiers `"start of"` and `"end of"` do not use delimiters.
`"bring air to start of bat"` will bring a copy of the `"air"` token _without token delimiter (space)_ before the `"bat"` token, giving you something like `"aaabbb"`.

## Some of the more useful actions

Here are some of the most useful actions.
Parts in square braces (`[]`) are optional.
Targets are represented by `T` with a possible digit.

- Core Changers
  - `"bring T1 [to T2]"`: replace selection/T2 with T
    - `"bring T1 before/after T2"`:
  - `"move T1 [to T2]"`
  - `"chuck T"`: delete T and appropriate delimiter
  - `"change T"`: delete T and set cursor(s) to where T was
  - `"drink/pour T"`: edit new line before/after T
- Selection Manipulation
  - `"take T"`: set selection
  - `"pre/post T"`: set selection before/after T
- Clipboard
  - `"paste to/before/after T"`
  - `"carve/copy T"`: cut/copy T

## Examples with walkthroughs

### TO BE CATEGORIZED

### Simple line operations

Cursorless might feel token oriented at the beginning, but line operations and feel very natural, especially with use of `"before"` and `"after"`.

#### Bringing a copy of a line to another line

Here is a detailed example:

- `"bring row 7 after line"` to bring a copy of [row](README.md#row-number) 7 to after the current line (or after the last selected line if you have a selection).
  - The following will assume that before the command, nothing was selected and there was only one cursor.
  - The command is using a [`"row"` mark](README.md#row-number) as a source.
    `"row"` marks are especially useful for lines far away from your cursor.
  - The destination has the mark `"line"`, which is more explicitly `"line this"`.
    The [`"this"` mark](README.md#this) starts the target as the cursor (remember that we are assuming no selections).
    The [`"line"` modifier](README.md#line) expands the target to the line containing the cursor.
    The `"after"` converts the line-based target to a line-based destination that is after the target.
  - Because the destination was an `"after"`, the `"bring"` command also inserts a delimiter that is appropriate for the destination when bringing a copy of the source to the destination.

And some more examples:

- `"bring row 7 to line"`, unlike the previous command, uses `"to"` instead of `"after"` for the destination converter.
  The command will replace the current line (or line-expanded selection if you had a selection) with the contents of row 7.
- `"bring line air to line"` will replace the current line with the contents of the line that contains the `"air"` token.
- `"bring row 7"`.
  If you have a selection, the selection is replaced with the contents of row 7.
  If you don't have a selection, the contents of row 7 are inserted at your cursor.
- `"bring up 2"` is similar to the previous command, but uses the `"down <number>"` and `"up <number>"` [mark type](README.md#up-number--down-number).

Copying a line to an adjacent line has some specialized command support:

- `"clone row 7"` will put a copy of row 7 after the original row 7.
- `"clone line"` is very common and will move your cursor to the new line.
- `"clone up line"` puts the copy before the original.
  - The useful difference from `"clone line"` is that your cursor moves up to the new line so that you are editing the "top" line rather than the "bottom" line.
  - `"clone up row 7"` only differs from `"clone row 7"` if your cursor is on row 7.

#### Operating on multiple lines

You can operate on multiple lines at a time:

- `"chuck 3 lines row 7"` will delete three lines starting at row 7.
  - The command uses a [relative scope modifier](README.md#previous--next--ordinal--number) (`"3 lines"`) to expand the target to be three lines (proceeding forward).
- `"bring 3 lines row 7 to 2 lines row 12"` replaces the two lines starting at row 12 with the three lines starting at row 7.
  Both destinations and sources can be multiple lines.
- `"chuck 3 lines air"` will delete three full lines starting at the line that contains the `"air"` token.
  - This command shows that you should not think of these commands as having a length and a start point; think of them as a mark and zero or more modifiers that expand or shift the target.
- TODO MAYBE: <number> lines backwards & next & previous & next <number> lines

## Some reminders for the author about advanced level content

Whether a command operates on delimiters can be changed by a target modifier.
`"chuck just bat"` will not delete any spaces; the `"just"` causes the command to ignore delimiters.
`"take just just just bat"` does the same as `"take bat"`.
