app: vscode
win.title: /cursorless/
-
^install local$:
    user.run_rpc_command("workbench.action.tasks.runTask", "Install local")
^uninstall local$:
    user.run_rpc_command("workbench.action.tasks.runTask", "Uninstall local")
^pre commit run$:
    user.run_rpc_command("workbench.action.tasks.runTask", "Run pre commit")

^serve start$:
    user.run_rpc_command("workbench.action.tasks.runTask", "Serve cursorless.org")
^serve stop$:
    user.run_rpc_command("workbench.action.tasks.terminate")
    insert("Serve")
    key(enter)

^debug generate subset$:
    user.run_rpc_command("workbench.action.tasks.runTask", "Generate test subset file")
^debug edit subset$:
    user.run_rpc_command("commands.openFolder", "./packages/test-harness/testSubsetGrep.properties")

debug {user.cursorless_launch_configuration}:
    user.run_rpc_command("commands.startDebugging", cursorless_launch_configuration)
    user.run_rpc_command("workbench.debug.action.focusRepl")
