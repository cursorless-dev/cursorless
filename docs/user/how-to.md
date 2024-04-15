# How-to guides

This section contains some how-to guides for common tasks.

## How do I paste to a target?

`"paste to air"`

To replace a target with the contents of the clipboard, say `"paste to <target>"`.

:::info

`"to <target>"` is an example of a Destination. See [Destinations](reference/destinations.md) for more information.

:::

## How do I run a VSCode task / bash shell command on a target?

1. Add a [VSCode task](https://code.visualstudio.com/docs/editor/variables-reference) to your `tasks.json` (say `"please open tasks"`):

   ```json
   {
     "label": "Echo",
     "type": "shell",
     "command": "echo",
     "args": ["${selectedText}"]
   }
   ```

   (replace `echo` / `Echo` with your actual command name)

2. Add a spoken form to your `vscode.talon`:

   ```talon
   echo <user.cursorless_target>:
     user.cursorless_command("setSelection", cursorless_target)
     user.run_rpc_command("workbench.action.tasks.runTask", "Echo")
   ```

   (replace `echo` / `Echo` with your actual command name)

You can now say eg `"echo air past bat"`.

:::info

See the [Talon-side api docs](./customization.md#cursorless-public-api) for more on creating custom Cursorless commands

:::
