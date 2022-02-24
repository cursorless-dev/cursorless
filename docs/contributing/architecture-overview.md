The journey the voice command takes to reach cursorless.


* [cursorless-talon][cursorless-talon] grammar captures one or more commands. For example `take air bring this to bat` contains two commands. Each command gets encoded into something similar to [CommandArgument][CommandArgument]. Finally `talon.actions.user.vscode_with_plugin("cursorless.command", ...commands)` transfers control to `command_client.py`.
* [command_client.py][command_client]
  * Writes commands to request.json file in a prearranged directory.
  * Issues a prearranged key press that gets captured by current vscode window.
  * This key press is picked up by command-runner extension.
* [command-runner][command-runner] reads and parses request.json, involves vscode command(s), which just happens to be `cursorless.command`. If multiple commands are received they will be run one after another.
* Finally control has reached cursorless-vscode (this repo).[CommandRunner.runCommand][CommandRunner.runCommand] is now up. Read linked documentation.

[Graph][Graph] is lazy loading dependency container. During runtime it will hold all global dependencies most notably Actions, HadTokenMap and RangeUpdater. It is passed around everywhere and is pretty much required to get any work done.


[cursorless-talon]: https://github.com/pokey/cursorless-talon
[command_client]: https://github.com/knausj85/knausj_talon/blob/master/apps/vscode/command_client/command_client.py
[command-runner]: https://github.com/pokey/command-server

[Graph]: https://bra1ndump.github.io/cursorless-vscode/contributing/api/interfaces/typings_Types.Graph.html
[CommandRunner.runCommand]: https://bra1ndump.github.io/cursorless-vscode/contributing/api/classes/core_commandRunner_CommandRunner.CommandRunner.html#runCommand

TODO: replace with pokey
https://pokey.github.io/cursorless-vscode/