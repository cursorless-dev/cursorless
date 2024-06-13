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

## How do I run a custom Python transformation on a target?

1. Add the transformation to a Python file in your Talon user directory:

   ```python
    from talon import Module, actions

    mod = Module()

    @mod.action_class
    class Actions:
        def hello(text: str):
            return f"Hello, {text}!"
   ```

2. Add a spoken form to your `vscode.talon`:

   ```talon
   hello <user.cursorless_target>:
       old = user.cursorless_get_text(cursorless_target, 1)
       new = user.hello(old)
       destination = user.cursorless_create_destination(cursorless_target)
       user.cursorless_insert(destination, new)
   ```

Now, for example if you have a target `aardvark` with a hat over the `a`, you can say `"hello air"` to replace it with `Hello, aardvark!`.

:::info

See the [Talon-side api docs](./customization.md#cursorless-public-api) for more on creating custom Cursorless commands

:::
