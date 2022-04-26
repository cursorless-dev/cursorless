# Customization

Many of the spoken forms used in cursorless can be easily customized without
needing to fork cursorless or modify the talon / python files contained
therein. If you find that your customization needs cannot be met without making
changes to cursorless files, please [file an
issue](https://github.com/cursorless-dev/cursorless/issues/new) so we can
improve customization.

## Cursorless settings csvs

The spoken forms for actions, scope types, colors, etc can be customized using the
csvs found in the `cursorless-settings` subdirectory of your user folder. On
Linux and Mac, the directory is `~/.talon/user/cursorless-settings`. On
Windows, it is `%AppData%\Talon\user\cursorless-settings`.

The directory location can be customized using the `user.cursorless_settings_directory` Talon setting. If the path is relative, it will be taken relative to your Talon user directory.

Note that these csv's:

- support empty lines,
- supports multiple spoken forms for a single action
- support comment lines beginning with `#`, and
- ignore any leading / trailing whitespace on spoken forms and cursorless
  identifiers

If the spoken form begins with a `-`, it will be disabled. Please do not remove
these lines, because that will trigger cursorless to add them back on next
reload, as cursorless uses these lines to track disabled spoken forms.

### Changing a spoken form

Simply modify the spoken form in the first column of any of the csvs in the
directory above to change the spoken you'd like to use. The new spoken form will be usable immediately.

Multiple spoken forms can be used for the same action using the pipe operator
`remove|delete`

### New features

When new actions, scope types, etc are added, Cursorless will detect that they're missing from your csvs and append the default term to the end. You can then feel free to modify the spoken form if you'd like to change it.

### Removing a term

If you'd like to remove an action, scope type, etc, you can simply set the
spoken form in the first column to any thing starting with `-`. Please don't
delete any lines, as that will trigger cursorless to automatically add the
spoken form back on talon restart.

## \[Experimental\] Cursorless custom VSCode actions

You can use Cursorless to run any built-in VSCode command on a specific target.

Just add your custom commands to: `experimental/actions_custom.csv`. For example, if you wanted to be able to say `"push down <T>"` to move the line(s) containing target `<T>` downwards, you could do the following:

```csv
Spoken form, VSCode command
push down, editor.action.moveLinesDownAction
```

Now when you say eg "push down air and bat", cursorless will first select the two tokens with a gray hat over the `a` and `b`, then issue the VSCode command `editor.action.moveLinesDownAction`, and then restore your original selection.

## Cursorless public API

Cursorless exposes a couple talon actions and captures that you can use to define your own custom command grammar leveraging cursorless targets.

### Public Talon captures

- `<user.cursorless_target>`
  Represents a cursorless target, such as `"air"`, `"this"`, `"air past bat"`, `"air and bat"`, `"funk air past token bat and class cap"`, etc

### Public Talon actions

- `user.cursorless_command(action_id: str, target: cursorless_target)`
  Perform a Cursorless command on the given target
  eg: `user.cursorless_command("setSelection", cursorless_target)`
- `user.cursorless_vscode_command(command_id: str, target: cursorless_target)`
  Performs a VSCode command on the given target
  eg: `user.cursorless_vscode_command("editor.action.addCommentLine", cursorless_target)`

### Example of combining capture and action

```talon
add dock string <user.cursorless_target>:
    user.cursorless_command("editNewLineAfter", cursorless_target)
    "\"\"\"\"\"\""
    key(left:3)

push <user.cursorless_target> down:
    user.cursorless_vscode_command("editor.action.moveLinesDownAction", cursorless_target)
```
