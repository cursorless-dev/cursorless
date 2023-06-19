# Introduction

This document will try to explicitly bring together a few concepts that underlie a lot of cursorless behavior, then walk through some example editing operations that are common but perhaps tricky to a beginner.

## Some Important Concepts

### Commands Have An Action And A Target Or Two

Commands have an action and a target or two. `"chuck air"` has the action `"chuck"` and one target (the `"air"` token).
`"bring air to bat"` has the action `"bring"` and two targets (the `"air"` and `"bat"` tokens).

A target can be more than a single token or line. A target can be a range, like `"air past bat"` that spans from the `"air"` token to the `"bat"` token, and that is still considered _one_ target.
A target can even be a vertical slice or list, like the list `"air and bat"`.
Doing `"take air and bat"` will result in multiple selections and multiple cursors, but it is still one target.

Commands with two targets often require a separator word between the two targets, like the `"to"` in `"move air to bat"`.
The separator may seem trivial now, but it is easier to forget it when you start using fancy targets.

### Targets Can Be Modified

A target starts as a mark (`"this"`, `"row ten"`, `"green curve air"`, etc) and target modifiers can be applied to suit your needs.
A big part of feeling comfortable and productive with Cursorless is getting familiar with the most useful mark types and target modifiers.
All of the [mark types](README.md#Marks) are worth knowing.
While there are many target modifiers, this document will help you get started fast by focusing on the most important modifiers to learn first.

The big difference between a simple command `"bring air to bat"` and the intimidating `"bring next three tokens air to after just line bat"` is the addition of target modifiers.
Target modifiers are often chained. `"after just line"` is a chain of three modifiers and they are applied in reverse order (`"line"`, then `"just"`, then `"after"`).

### Targets Sometimes Include Their Delimiter Depending On The Action And Modifiers

Some actions will operate on the specified target, and some actions will additionally operate on a delimiter that leads/trails the target.

The command `"take air"` will select a token.
The command `"chuck air"` will delete a token _and_ a leading/trailing space (if there is an appropriate one).
Likewise, `"chuck block air"` will delete a block _and_ a leading/trailing empty line (if appropriate).

These default behaviors usually do what you want.
If you have the sentence `apple banana cherry` and run the command `"chuck bat"`, you usually don't want to end up with `apple  cherry` (note the two spaces), so the command deletes a token and an appropriate token delimiter.

Here are some target types and their delimiters...

- Character or word within a token: nothing
- Token: space
- Argument and item: comma and space
- Line: line ending
- Block: empty line

Whether a command operates on delimiters can be changed by a target modifier.
`"chuck just bat"` will not delete any spaces; the `"just"` causes the command to ignore delimiters.
`"take just just just bat"` does the same as `"take bat"`.

Special positional target modifiers `"before"` and `"after"` try to work with delimiters.
`"bring line after row ten"` will bring a copy of the current line content _with line delimiter_ after line 10, meaning there will be an additional line (a new line 11).

Special positional target modifiers `"start of"` and `"end of"` do not use delimiters.
`"bring line to end of row ten"` will bring a copy of the current line content _without line delimiter_ to the end of line 10, meaning line 10 will get content added to it.

## Some Of The More Useful Actions

Here are some of the most useful actions.
Parts in square braces (`[]`) are optional.
Targets are represented by `T` with a possible digit.

- Core Changers
  - `"bring T1 [to T2]"`: replace selection/T2 with T
  - `"move T1 [to T2]"`
  - `"chuck T"`: delete T
  - `"change T"`: delete T and set cursor(s) to where T was
  - `"drink/pour T"`: edit new line before/after T
- Selection Manipulation
  - `"take T"`: set selection
  - `"give T"`: deselect
  - `"pre/post T"`: set selection before/after T
- Clipboard
  - `"paste to T"`
  - `"carve/copy T"`: cut/copy T

## Examples With Walkthroughs

TODO
