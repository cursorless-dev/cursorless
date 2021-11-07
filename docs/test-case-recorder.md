# Test case recorder

We use an automated test case recorder to generate test cases. To use it, you
set up a file the way you'd like (usually a minimal file containing something
like `hello world`), positioning your cursor where you want, tell cursorless to
start recording, and then issue one or more cursorless commands. It works by
recording the initial state of the file including cursor position(s), the
command run, and the final state, all in the form of a yaml document. See
[existing test cases](../src/test/suite/fixtures/recorded) for example outputs.

## Initial setup

1.  Add a voice command for recording to your personal talon files:
    - `cursorless record: user.vscode("cursorless.recordTestCase")`
    - We don't want to commit this so add it to your own repository.
1.  If you'd like to be able to do tests which check the navigation map, you should also add the following to your personal talon files:

         cursorless record navigation:
             user.vscode_with_plugin("cursorless.recordTestCase", 1)

    It is quite unlikely you'll need this second step. Most tests don't check the navigation map.

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
1. Repeat as many cursorless voice commands as you want recorded. Each command
   you
   issue will generate a test case in the form of a yaml file.
1. Issue `"cursorless record"` command again to stop recording
   - `Stopped recording test cases` is shown
   - You can also just stop the debugger or close the debug window

### Navigation map tests

If you want to check how the navigation map gets updated in response to changes, you can instead say "cursorless record navigation", and then you need to issue two commands in one phrase each time. The second command should be of the form "take air" (or another decorated mark), and will tell the test case recorder which decorated mark we're checking.

## Run recorded tests

Recorded tests will automatically be picked up and run with the normal tests,
and can be run in vscode or via yarn in terminal.

## Changing recorded test cases in bulk

1. Change the `FIXTURE_TRANSFORMATION` function at the top of
   [`transformRecordedTests.ts`](../src/scripts/transformRecordedTests.ts) to
   perform the transformation you'd like
2. Run `yarn run compile && node ./out/scripts/transformRecordedTests.js`

You might find the `transformPrimitiveTargets` function useful for this purpose.
