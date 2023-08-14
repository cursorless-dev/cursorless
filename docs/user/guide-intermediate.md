# Guide to intermediate level Cursorless

This document will try to:

- Highlight the most useful actions and modifiers in Cursorless so you know which ones to focus on learning first.
- Bring together a few important concepts that underlie a lot of Cursorless behavior.
- Walk through some example editing operations that are common but perhaps tricky to a beginner.

This document assumes that you understand the very basics of cursorless, like what commands `"take air"` and `"chuck line"` do.
If you don't have the basics down, please read some of [the main documentation page](README.md) and/or watch [the Cursorless tutorial videos](https://www.youtube.com/watch?v=5mAzHGM2M0k&list=PLXv2sppxeoQZz49evjy4T0QJRIgc_JPqs).

It is planned for this guide to be expanded to both basic and advanced levels.

## Important actions

Here are some of the most useful actions.
Parts in square braces (`[]`) are optional.
Slashes (`/`) show alternatives.
Targets are represented by `T` with a possible digit.

- Selection Manipulation
  - `"take T"`: set selection.
  - `"pre/post T"`: set selection before/after T.
- Clipboard
  - `"paste to/before/after T"`.
  - `"carve/copy T"`: cut/copy T.
- Core Changers
  - `"bring T"`: insert a copy of T at the cursor/selection.
  - `"bring T1 to T2"`: replace T2 with T.
  - `"bring T1 before/after T2"`: insert a copy of T1 before/after T2, including appropriate delimiters.
  - `"move T1 [to/before/after T2]"`: like `"bring"`, but also deletes the source (ie it 'moves' T1 instead of copying it)
  - `"chuck T"`: delete T and appropriate delimiter.
  - `"change T"`: delete T and set cursor(s) to where T was; delimiters are unchanged.
  - `"drink/pour T"`: edit new line before/after T.
- IDE-related
  - `"follow T"`: open URL or go to definition of T.
  - `"quick fix T"`: show available quick fixes for T (eg rename, extract variable, etc).
  - `"reference T"`: show references to T.

## Important modifiers

Here are some very useful modifiers:

- Syntactic scopes ([reference](README.md#syntactic-scopes)) are great for expanding the target to what you want to operate on, like the containing function.
  - `"arg"` and `"item"`: for items in a comma-separated list, like `"chuck item air"` or `"bring air after arg bat"`. Commas are inserted / removed as necessary to keep things syntactically valid. `"item"` works for all comma-separated items; `"arg"` only targets function arguments / parameters
  - `"funk"` for function.
  - `"state"` for statement (which might span multiple lines or only part of a line).
- Other modifiers that are like syntactic scopes in that they expand the target.
  - [`"file"`](README.md#file) for the whole file.
  - [`"block"`](README.md#block) for a contiguous block of non-empty lines.
  - [`"line"`](README.md#line), often used in commands like `"chuck line"`.
  - [`"paint"`](README.md#paint) for contiguous sequence of non-white space characters.
  - [`"token"`](README.md#token).
  - [`"word"`](README.md#word) allows you to refer to words within a snake_case or camelCase token.
  - [`"char"`](README.md#char) for individual characters.

And you can reuse the above scopes when using [relative/ordinal modifiers](README.md#previous--next--ordinal--number).
Some examples:

- `"[number] [scope]s"`, like `"chuck three lines row 12"` to delete rows 12-14.
- `"[number] [scope]s backward"`, like `"chuck three lines backward row 12"` to delete rows 10-12.
- `"[nth] [scope]"`, like `"chuck second word air"` to delete "Banana" from "appleBananaCherry".
- `"[nth] last [scope]"`, like `"chuck last char air"` to delete "s" from "apples".
- `"next/previous [scope]"`, like `"chuck until next token"` to delete everything from the cursor/selection to the next token, or `"copy next funk"` to copy the next function after your cursor

`"past"`, `"until"`, and `"and"` are good ways to build up targets.

- `"chuck row 7 past row 9"` to delete rows 7 through 9.
- `"chuck air until bat"` to delete tokens starting at the air token ending just before the bat token.
- `"chuck row 7 and row 10"` to delete rows 7 and 10.

There is also `"head"` and `"tail"` to expand a target through to the beginning or end of the line.
`"take head air"` selects the air token through to the beginning of air's line.
When followed by a modifier, they will expand their input to the start or end of the given modifier range.
`"take head funk"` will select from the cursor to the start of the containing function.

## Important concepts

### Command structure

Commands have an action and a target or two. `"chuck air"` has the action `"chuck"` and one target (the `"air"` token).
`"bring air to bat"` has the action `"bring"` and two targets (the `"air"` and `"bat"` tokens).

A target can be more than a single token or line. A target can be a [range](README.md#range-targets), like `"air past bat"` that spans from the `"air"` token to the `"bat"` token, and that is still considered _one_ target.
A target can even be a vertical slice or list, like the list `"air and bat"`.
Doing `"take air and bat"` will result in multiple selections and multiple cursors, but it is still one target.

### Marks and modifiers

A target contains a mark (ex: `"this"`, `"row ten"`, `"green curve air"`, etc) and target modifiers can be prefixed to suit your needs.
A big part of feeling comfortable and productive with Cursorless is getting familiar with the most useful mark types and target modifiers.
All of the [mark types](README.md#Marks) are worth knowing.
While there are many target modifiers, this document will help you get started fast by focusing on the most important modifiers to learn first.

The biggest difference between the simple `"bring air after bat"` and the intimidating `"bring next three lines air after block state bat"` is the addition of target modifiers.
Target modifiers are often chained. `"block state"` is a chain of two modifiers and they are applied in reverse order (`"state"`, then `"block"`).

Modifier chains can be applied to each [primitive target](README.md#primitive-targets) in a [compound target](README.md#compound-targets).
For instance, `"take air and bat"` could be changed to have independent modifiers in front of `"air"` and/or `"bat"`, such as `"take line air and block bat"`

### Destinations

The `"paste"` commands has a single target that is a destination.
The second targets of `"bring"` and `"move"` commands are destinations.

In `"bring air before bat"`, `"air"` is the non-destination first target and `"before bat"` is a destination (and second target).

Targets are converted into destinations using a destination converter (`"to"`, `"before"`, `"after"`); that is why you have to say commands like `"bring air to bat"` or `"bring air after bat"`.
The `"to"` might seem like cursorless is trying to resemble a sentence, but `"to"` actually serves a technical purpose of explicitly converting to a destination.

`"to"` generally means you are replacing the destination.
Ex: `"paste to air"` will replace the air token.

`"before"` and `"after"` generally mean you are inserting before/after the destination with proper attention to delimiters.
Ex: `"paste after air"` will insert a space followed by the clipboard contents after the air token.
More details in the next section.

### Delimiters

Some actions will operate on the specified target, and some actions will additionally operate on a delimiter that leads/trails the target.

The command `"take air"` will select a token.
The command `"chuck air"` will delete a token _and_ leading/trailing spaces (if appropriate ones exist).
Likewise, `"chuck block air"` will delete a block _and_ leading/trailing empty lines (if appropriate ones exist).

These default behaviors usually do what you want.
If you have the sentence `apple banana cherry` and run the command `"chuck bat"`, you usually don't want to end up with `apple  cherry` (note the two spaces), so the command deletes a token and appropriate token delimiter.

Here are some target types and their delimiters...

- Character or word within a token: nothing.
- Token: space.
- Argument or item: comma and space.
- Line: line ending.
- Block: empty line.

Destination converters `"before"` and `"after"` try to work with delimiters.
`"bring air before bat"` will bring a copy of the `"air"` token _with token delimiter (space)_ before the `"bat"` token giving you something like `"aaa bbb"`.

Special positional target modifiers `"start of"` and `"end of"` do not use delimiters.
`"bring air to start of bat"` will bring a copy of the `"air"` token _without token delimiter (space)_ before the `"bat"` token, giving you something like `"aaabbb"`.

## Examples of some common operations

The below examples are supposed to show you how to do some of the most common text editing operations, especially the
operations that might not be initially obvious how to do because of their use of multiple concepts in combination.

### Line operations

Cursorless might feel token oriented at the beginning, but line operations can feel very natural, especially with use of `"before"` and `"after"`.
Also, a lot of the line-based examples can be adapted to tokens, blocks, and so on.

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

`"clone"` commands on a line also bring the existing hats to the new line, so you can chain commands to operate on the new line without waiting for the clone to complete and see the new hats.
Sidenote: `"clone"` can operate on many types of targets, but lines, blocks, functions, and statements are the most common.

#### Operating on multiple lines

You can operate on multiple lines at a time:

- `"chuck 3 lines row 7"` will delete three lines starting at row 7.
  - The command uses a [relative scope modifier](README.md#previous--next--ordinal--number) (`"3 lines"`) to expand the target to be three lines (proceeding forward).
- `"bring 3 lines row 7 to 2 lines row 12"` replaces the two lines starting at row 12 with the three lines starting at row 7.
  Both destinations and sources can be multiple lines.
- `"chuck 3 lines air"` will delete three full lines starting at the line that contains the `"air"` token.
  - This command shows that you should not think of these commands as having a length and a start point; think of them as a mark and zero or more modifiers that expand or shift the target.
- `"chuck row 7 past row 9"` uses the `"past"` modifier to delete row 7 through row 9.

#### Joining lines

It is common to want to join lines.
For example, to go from...

```markdown
apple
banana
```

to...

```markdown
apple banana
```

There are a few ways to join lines.
Remember, not everything needs to be done in Cursorless.
Talon's community config repo [has](https://github.com/talonhub/community/blob/468fb16392e6a9907cb98e2526c1e5cbf3b5fc8d/apps/vscode/vscode.talon#L265) `join lines: user.vscode("editor.action.joinLines")`.
Using that command will join the current line with the line below it.
Or, if you have a multi-line selection, then it will join all the selected lines.

Also, you can [customize Cursorless](customization.md##experimental-cursorless-custom-ide-actions) so you can invoke the vscode operation `editor.action.joinLines` with a Cursorless command and target.
In your Cursorless settings `experimental/actions_custom.csv` file, if you add `join, editor.action.joinLines`, then you can do Cursorless commands like `"join row 7"` to join row 7 and row 8 or `"join 5 lines row 7"` to join 5 lines starting at row 7.

vscode's `editor.action.joinLines` puts a space between joined lines.
If you want to join lines without a space, `"move <BottomLineTarget> to end of <TopLineTarget>"` or `"move <TopLineTarget> to start of <BottomLineTarget>"` are an approach you could take.

- `"move down 1 to end of line"` if your cursor is on the top line.
- `"move row 7 to start of row 8"` for any two lines regardless or cursor position.

#### Splitting lines

Sometimes you want to split a line into multiple lines.
For instance, for this...

```typescript
someCode(); // some comment
```

to become this...

```typescript
// some comment
someCode();
```

`"move tail <mark> before its line"` will do the split starting at `"<mark>"` (`"slash"` for the example above).
First, the `"tail <mark>"` expands the target from the mark to everything until the end of the line.
The `"its line"` makes Cursorless re-use the previous mark (from `"tail <mark>"`) and expand to the corresponding line.
The overall `"move ... before ..."` structure moves the tail portion to before the line.

Or, you might want to do the other split, where the tail goes below.
Where this...

```typescript
apple banana cherry date
```

becomes this...

```typescript
apple banana
cherry date
```

`"move tail <mark> after its line"` will do the above split.

Pokey has streamlined the operation by [adding a Talon Voice command](https://github.com/pokey/pokey_talon/blob/3a7ccd407be7b97104b99c7288f9771ce0c0db4e/apps/vscode/vscode.talon#L613-L616):

```talon
break <user.cursorless_target>:
    user.cursorless_command("setSelectionBefore", cursorless_target)
    user.vscode("hideSuggestWidget")
    key("enter")
```

This is another example that not every text editing operation should be done with only the existing Cursorless system.
Customization and extension are very handy.

### Subtoken changes

Cursorless also has good support for operating on parts of a token.
Cursorless can recognize and operate on words within a snake_case, camelCase, or PascalCase token.

- `"chuck third word air"` or `"chuck last word air"` to delete `"_cherry"` from `"apple_banana_cherry"`.
- `"change second word past third word air"` to delete `"BananaCherry"` from `"AppleBananaCherryDate"`.
- `"chuck last 2 words air"` to delete the last two words of the air token.
- `"chuck tail token third word air"` to delete from the third word to the last word of the air token.
  It is probably easier to do `"chuck third word past last word air"`.
- `"bring 2 words third word air to last word bat"` will replace the last word of the bat token with some words from the air token.

Similar things can be done on characters, like `"chuck last char air"` to delete `"s"` from `"apples"`.

### Arg and item changes

The `"arg"` (argument to a function call) and `"item"` (item in a list, map, or object) modifiers are often helpful because they are comma-aware.

- `"chuck arg bat"` is a good way to go from `someFunction(apple, banana + otherStuff, cherry)` to `someFunction(apple, cherry)`.
  The command deletes the argument and the appropriate delimiters (comma and a space).
- `"bring bat after arg air"` lets you go from `someFunction(apple, cherry)` to `someFunction(apple, banana, cherry)`, again taking care of commas and spaces.
- `"chuck item air"` can go from `someMap = { key1: "apple", key2: "banana" }` to `someMap = { key2: "banana" }`.

### Delimeter-only changes

You can use `"leading"` and `"trailing"` to target delimiters themselves.

- `"chuck leading and trailing air"` to delete the spaces around the air token.
- `"chuck leading block` will delete the empty lines before the current block.

But `"leading"` and `"trailing"` are not always needed to mess with delimiters.

- `"chuck until next token"` will delete spaces from the cursor to the next token.

## What's next

Eventually there will be more guide-like documentation on the more advanced concepts.
In the meantime, here are a few more useful concepts to look into.

- [pair operations](README.md#surrounding-pair), with [list of paired delimiters](README.md#paired-delimiters)
- [snippets](experimental/snippets.md)
- [`"every"`](README.md#every)
- [`"instance"`](README.md#instance)
- [`"just"`](README.md#just)
