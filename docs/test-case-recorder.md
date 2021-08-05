# Test case recorder

We use an automated test case recorder to generate test cases. To use it, you
set up a file the way you'd like (usually a minimal file containing something
like `hello world`), positioning your cursor where you want, tell cursorless to
start recording, and then issue one or more cursorless commands. It works by
recording the initial state of the file including cursor position(s), the
command run, and the final state, all in the form of a yaml document. See
[existing test cases](../src/test/suite/fixtures/recorded) for example outputs.

## Initial setup

1. Add voice command
   - `cursorless record: user.vscode("cursorless.recordTestCase")`
   - We don't want to commit this so add it to your own repository.

## Recording new tests

1. Start debugging (F5)
1. Create a minimal file to use for recording tests. And position your cursor
   where you'd like. Check out the `initialState.documentContents` field of
   [existing test cases](../src/test/suite/fixtures/recorded) for examples.
1. Issue the `"cursorless record"` command
   - List of target directories is shown. All test cases will be put into the
     given subdirectory of `src/test/suite/fixtures/recorded`
1. Select existing directory or create new one
   - Select `Create new folder`
   - If the new directory name contains any `/`, it will create nested
     subdirectories.
1. `Recording test cases for following commands` is shown
1. Issue any cursorless voice command
   - `"take air"`
1. `Cursorless test case saved` is shown
   - File created on disk using spoken words as file name
1. Repeat as many voice commands as you want recorded
1. Issue `"cursorless record"` command again to stop recording
   - `Stopped recording test cases` is shown
   - You can also just stop the debugger or close the debug window

## Run recorded tests

Recorded tests will automatically be picked up and run with the normal tests,
and can be run in vscode or via yarn in terminal.
