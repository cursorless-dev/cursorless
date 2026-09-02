---
sidebar_group: Customization
sidebar_position: 5
---

# Public Talon API

Cursorless exposes Talon actions and captures that you can use to define custom command grammars with Cursorless targets.

## Public Talon captures

- `<user.cursorless_target>`
  Represents a Cursorless target, such as `"air"`, `"this"`, `"air past bat"`, `"air and bat"`, `"funk air past token bat and class cap"`, etc

- `<user.cursorless_destination>`
  Represents a Cursorless destination, such as `"to air"`, `"before this"`, `"after air and bat"`, etc

## Public Talon actions

- `user.cursorless_command(action_id: str, target: cursorless_target)`:
  Perform a Cursorless command on the given target
  eg: `user.cursorless_command("setSelection", cursorless_target)`.
  Note that for `"bring"` (`replaceWithTarget`), `cursorless_target` will be the source of the bring and the destination will be the current selection(s), as if you had said `"bring <target>"`
- `user.cursorless_ide_command(command_id: str, target: cursorless_target)`:
  Performs a built-in IDE command on the given target
  eg: `user.cursorless_ide_command("editor.action.addCommentLine", cursorless_target)`
- `user.cursorless_get_text(target: CursorlessTarget, hide_decorations: bool = False) -> str`
  Get text from target. If `hide_decorations` is `true`, will not show decorations.
- `user.cursorless_get_text_list(target: CursorlessTarget, hide_decorations: bool = False) -> list[str]`
  Get texts from multiple targets. If `hide_decorations` is `true`, will not show decorations.
- `user.cursorless_insert(destination: CursorlessDestination, text: Union[str, List[str]])`:
  Insert text at destination.
  eg: `user.cursorless_insert(cursorless_destination, "hello")`
- `user.cursorless_create_destination(target: CursorlessTarget, insertion_mode: Literal["to", "before", "after"] = "to") -> CursorlessDestination`:
  Create a destination from a target. The insertion mode can be `to`, `before`, or `after`, and defaults to `to`, which will replace the target. See [How do I run a custom Python transformation on a target?](./how-to.md#how-do-i-run-a-custom-python-transformation-on-a-target) for example usage.
- `user.cursorless_reformat(target: CursorlessTarget, formatters: str)`
  Reformat target with specified formatters.
  eg: `user.cursorless_reformat(cursorless_target, "ALL_CAPS")`

### Snippet actions

- `user.cursorless_insert_snippet(body: str, destination: Optional[CursorlessDestination], scope_type: Optional[Union[str, list[str]]])`: Insert a snippet with the given body. The body should be a single string, which could contain newline `\n` characters, rather than a list of strings as is expected in our snippet json representation. Destination is where the snippet will be inserted. If omitted will default to current selection. An optional scope type can be provided for the target to expand to. `"snip if after air"` for example could be desired to go after the statement containing `air` instead of the token.
- `user.cursorless_wrap_with_snippet(body, target, variable_name, scope)`: Wrap the given target with a snippet with the given body. The body should be a single string, which could contain newline `\n` characters, rather than a list of strings as is expected in our snippet json representation. Note that `variable_name` should be one of the variables defined in `body`. Eg, if `body` has a variable `$foo`, you can pass in `"foo"` for `variable_name`, and `target` will be inserted into the position of `$foo` in the given named snippet. The `scope` variable can be used to automatically expand the target to the given scope type, eg `"line"`.

## Example of combining capture and action

```talon
add dock string <user.cursorless_target>:
    user.cursorless_command("editNewLineAfter", cursorless_target)
    "\"\"\"\"\"\""
    key(left:3)

push <user.cursorless_target> down:
    user.cursorless_ide_command("editor.action.moveLinesDownAction", cursorless_target)
```

## Example of custom formatter command

The command below will allow you to say `camel form blue air`.
_You can disable the default Cursorless reformat command by prefixing the spoken form in `actions.csv` with a dash. `-format, applyFormatter`_

```talon
<user.formatters> form <user.cursorless_target>:
    user.cursorless_reformat(cursorless_target, formatters)
```

## Example of custom search engine command

The command below will allow you to say `"google scout <target>"`. It supports all search engines defined in your [`search_engine.talon-list`](https://github.com/talonhub/community/blob/cc8f13d5cb3be2501d35150b8bf2d1cdf60eaab6/core/websites_and_search_engines/search_engine.talon-list) in Talon Community repository.

```talon
{user.search_engine} scout <user.cursorless_target>:
    text = user.cursorless_get_text(cursorless_target)
    user.search_with_search_engine(search_engine, text)
```
