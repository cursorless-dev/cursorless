---
sidebar_group: Customization
sidebar_position: 3
---

# Custom IDE actions

You can use Cursorless to run any built-in IDE command on a specific target.

Just add your custom commands to `user/cursorless-settings/experimental/actions_custom.csv`. For example, if you wanted to be able to say `"push down <T>"` to move the line(s) containing target `<T>` downwards, you could do the following:

```csv
Spoken form, VSCode command
push down, editor.action.moveLinesDownAction
```

Now when you say eg `"push down air and bat"`, Cursorless will first select the two tokens with a gray hat over the `a` and `b`, then issue the VS Code command `editor.action.moveLinesDownAction`, and then restore your original selection.

See this [video on finding VS Code command IDs 🎬](https://youtu.be/oWUJyDgz63k?si=mw-KPhjFoqbcgGOp) for commands you use.

## Examples

```csv
Spoken form, VSCode command
join, editor.action.joinLines
git revert, git.revertSelectedRanges
git stage, git.stageSelectedRanges
git unstage, git.unstageSelectedRanges
bubble, editor.action.moveLinesUpAction
sink, editor.action.moveLinesDownAction
accept, merge-conflict.accept.selection
accept both, merge-conflict.accept.both
reflow, rewrap.rewrapComment
```

### Calva `"slurp"` / `"barf"`

```csv
slurp,paredit.slurpSexpForward
barf,paredit.barfSexpForward
```
