# Experimental custom command action

:::warning

This feature is experimental! Not as thoroughly tested as the rest of Cursorless and might change in the future. Early adopters should subscribe to this [discussion](https://github.com/cursorless-dev/cursorless/discussions/2942) to get updates about breaking changes\_

:::

`user.cursorless_x_custom_command(command: string, *args)`

Run a custom Cursorless command by parsing the specified command string. Supports a subset of the Cursorless grammar, with **default** spoken forms (not your custom spoken forms). See https://www.cursorless.org/custom-command-railroad to see the subset of our grammar that we support today.

- Utilizes default Cursorless spoken forms in the command string.
- Optional target arguments can be interpolated in the command string. (see examples below)

## Examples

In order to map `"scratch"` to perform `"chuck block"`:

```talon
scratch: user.cursorless_x_custom_command("chuck block")
```

To map `"scratch air"` => `"chuck block air"`

```talon
scratch <user.cursorless_target>:
    user.cursorless_x_custom_command("chuck block <target>", cursorless_target)
```

To map `"combine air plus bat"` => `"bring block air after bat"`

```talon
combine <user.cursorless_target> plus <user.cursorless_target>:
    user.cursorless_x_custom_command("bring block <target1> after <target2>", cursorless_target_1, cursorless_target_2)
```
