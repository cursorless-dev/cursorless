# Test case recorder

We use an automated test case recorder to generate test cases. To use it, you
set up a file the way you'd like (usually a minimal file containing something
like `hello world`), positioning your cursor where you want, tell cursorless to
start recording, and then issue one or more cursorless commands. It works by
recording the initial state of the file including cursor position(s), the
command run, and the final state, all in the form of a yaml document. See
[existing test cases](../../src/test/suite/fixtures/recorded) for example outputs.

## Initial setup

1.  Add a voice command for recording to your personal talon files:
    - `cursorless record: user.vscode("cursorless.recordTestCase")`
    - We don't want to commit this so add it to your own repository.
1.  If you'd like to be able to do tests which check the navigation map, you should also add the following to your personal talon files:

    - https://github.com/pokey/pokey_talon/blob/9298c25dd6d28fd9fcf5ed39f305bc6b93e5f229/apps/vscode/vscode.talon#L468
    - https://github.com/pokey/pokey_talon/blob/49643bfa8f62cbec18b5ddad1658f5a28785eb01/apps/vscode/vscode.py#L203-L205

    It is quite unlikely you'll need this second step. Most tests don't check the navigation map.

## Recording new tests

1. Start debugging (F5)
1. Create a minimal file to use for recording tests. And position your cursor
   where you'd like. Check out the `initialState.documentContents` field of
   [existing test cases](../../src/test/suite/fixtures/recorded) for examples.
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

### Autoformatting

To clean up the formatting of all of the yaml test cases, run `yarn run compile && node ./out/scripts/transformRecordedTests/index.js`

### Upgrading fixtures

To upgrade all the test fixtures to the latest command version, run the command `yarn run compile && node ./out/scripts/transformRecordedTests/index.js upgrade`. This command should be idempotent.

### Custom transformation

1. Add a new transformation to the `src/scripts/transformRecordedTests/transformations` directory. Look at the existing transformations in that directory for inspiration.
1. Change the value at the `custom` key in `AVAILABLE_TRANSFORMATIONS` at the top of
   [`transformRecordedTests/index.ts`](../../src/scripts/transformRecordedTests/index.ts) to
   point to your new transformation
1. Run `yarn run compile && node ./out/scripts/transformRecordedTests/index.js custom`

Example of a custom transformation

```typescript
export function updateSurroundingPairTest(fixture: TestCaseFixture) {
  fixture.command.targets = transformPartialPrimitiveTargets(
    fixture.command.targets,
    (target: PartialPrimitiveTargetDesc) => {
      target.modifiers?.forEach((modifier) => {
        if (modifier?.type === "surroundingPair") {
          let delimiterInclusion: DelimiterInclusion;
          switch (modifier.delimiterInclusion as any) {
            case "includeDelimiters":
              delimiterInclusion = undefined;
              break;
            case "excludeDelimiters":
              delimiterInclusion = "interiorOnly";
              break;
            case "delimitersOnly":
              delimiterInclusion = "excludeInterior";
              break;
          }
          modifier.delimiterInclusion = delimiterInclusion;
        }
      });
```
