# Troubleshooting

Here is a list of common issues you might encounter, along with possible solutions:

## Typing a letter after a command without a mark

Due to the way that Cursorless allows you to omit marks (eg `"take funk"` instead of `"take funk this"`), the grammar can be slightly ambiguous to parse. The most common example will be if you omit the mark (eg `"change funk"`), and then try to type a letter (`"air"`). In that case, when you say `"change funk air"`, Talon will parse it as a single command to change the function with a gray hat over an `a`, which is usually what you mean. However, if you did want to change the function containing the cursor, and then type `"a"`, then the parse will be incorrect. To work around this limitation, there are a few options:

- **Option 1**: pause after `"change funk"` so that it is broken into two separate command phrases `"change funk"`, then `"air"`
- **Option 2**: say `"change funk this air"` instead, so that you make the mark explicit
- **Option 3**: add the command `then: skip()` to a Talon file, which makes a command called `"then"` that does nothing, but can be used to break up the command phrase. Then you can say `"change funk then air"`

## `"red"`

A similar ambiguity can arise if you use the default color name for `red` and the default letter name for `r` defined in community, both of which are `"red"`. In this case, if you say `"change red air"`, it could be interpreted as either of the following:

- `"change red"` (referring to token with a gray hat over `r`), followed by `"air"` (to type the letter `a`), or
- `"change red air"` (referring to the red hat over an `a`).

Most of the time you’ll mean the latter, and that is how Talon will interpret the command. But occasionally you’ll want the former. As above, you have a few options:

- **Option 1**: pause after `"change red"` so that it is broken into two separate command phrases `"change red"`, then `"air"`
- **Option 2**: change `r` to be eg `"risk"` or `"ram"` in your [Talon alphabet](https://github.com/talonhub/community/blob/f4cab180efc41bfd4be073079df716130967349e/core/keys/letter.talon-list#L23) to avoid the conflict
- **Option 3**: map a `then: skip()` command as above. Then when you actually want the first behaviour, you’ll say `"change red then air"`

## When a variable is grayed out, the red hat looks pink

When you have an unused variable, VS Code will make it semi-transparent. Unfortunately, this transparency also applies to any Cursorless hats over the variable, so if you are using a light background, then any red hat on the variable will be blended with the light background and look pink. We have filed [an issue](https://github.com/microsoft/vscode/issues/138986) with VS Code to fix this one, but it might be a while.

In the meantime, your best bet is probably to disable the pink hat and instead enable `userColor1`, which has a default voice command of `"navy"`. To do so, search for `cursorless.hatEnablement.colors` in your VS Code settings, and uncheck the box next to `pink` and check the one next to `userColor1`. Then when you pull up the cheatsheet you should see that `"pink"` has been replaced by `"navy"`, and a new navy hat color should show up in your editor instead of pink.

## Decorations don't scale with editor zoom

There are two relevant types of zoom actions in VS Code.

- `workbench.action.zoomIn` scales all UI. Cursorless deals with this as expected.
- `editor.action.fontZoomIn` scales only the editor font. _This will trigger the issue._ This action does not have a keybinding by default. `Ctrl` + mouse wheel also triggers it when the `editor.mouseWheelZoom` setting is enabled.

To avoid the issue, use `workbench.action.zoomIn` to zoom the entire UI instead of changing only the editor font size.
