app: vscode
-
^install local$:
    user.vscode_with_plugin("workbench.action.tasks.runTask", "Install local")
^pre commit run$:
    user.vscode_with_plugin("workbench.action.tasks.runTask", "Run pre commit")

^serve start$:
    user.vscode_with_plugin("workbench.action.tasks.runTask", "Serve cursorless.org")
^serve stop$:
    user.vscode("workbench.action.tasks.terminate")
    insert("Serve")
    key(enter)

^debug generate subset$:
    user.vscode_with_plugin("workbench.action.tasks.runTask", "Generate test subset file")
^debug edit subset$:
    user.vscode_with_plugin("commands.openFolder", "./packages/test-harness/testSubsetGrep.properties")
