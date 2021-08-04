# Test case recorder

## Record new tests
1. Add voice command
    - `cursorless record: user.vscode("cursorless.recordTestCase")`
    - We don't want to commit this so add it to your own repository.
1. Start debugging (F5)
1. `"cursorless record"`
    - List of target directories is shown
1. Select existing directory or create new one
    - Select `Create new folder`
    - Use `/` to create subdirectories.
1. `Recording test cases for following commands` is shown
1. Issue any cursorless voice command
    - `"take air"`
1. `Cursorless test case saved` is shown
    - File created on disk using spoken words as file name
1. Repeat as many voice commands as you want recorded
1. `"cursorless record"`
    - `Stopped recording test cases` is shown
    - You can also just stop the debugger or close the debug window

## Run recorded tests
Recorded tests are run with the normal test and can be run in vscode or via yarn in terminal.
