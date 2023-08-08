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

^edit test subset$:
    user.vscode_with_plugin("workbench.action.tasks.runTask", "Edit test subset file")
