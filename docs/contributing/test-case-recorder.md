# Test case recorder

We use an automated test case recorder to generate test cases. To use it, you
set up a file the way you'd like (usually a minimal file containing something
like `hello world`), positioning your cursor where you want, tell cursorless to
start recording, and then issue one or more cursorless commands. It works by
recording the initial state of the file including cursor position(s), the
command run, and the final state, all in the form of a yaml document. See
[existing test cases](../../packages/cursorless-vscode-e2e/src/suite/fixtures/recorded) for example outputs.

## Recording new tests

1. Start debugging (F5)
1. Create a minimal file to use for recording tests. And position your cursor
   where you'd like. Check out the `initialState.documentContents` field of
   [existing test cases](../../packages/cursorless-vscode-e2e/src/suite/fixtures/recorded) for examples.
1. Issue the `"cursorless record"` command. Alternately, issue one of the special recording commands listed in
   - List of target directories is shown. All test cases will be put into the
     given subdirectory of `packages/cursorless-vscode-e2e/src/suite/fixtures/recorded`
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

## Test case recorder options

The test case recorder has several additional configuration options. The default configuration works for most tests, but you may find the following useful. For a full list of supported configuration options, see [the api docs](../api/interfaces/cursorless_engine_testCaseRecorder_TestCaseRecorder.internal.RecordTestCaseCommandArg/).

### The options

#### Capturing errors

We support recording tests where the expected result is an error. This can be done using the command `"cursorless record error"`.

#### Testing decoration highlights

We support testing our decoration highlights, eg the flash of red when something is deleted. If you record tests into the `decorations/` directory, these will automatically be captured.

If you'd like to record decorations when recording into a different directory, you can say `"cursorless record highlights"`.

#### Testing the returned `that` mark

By default, we don't capture the `that` mark returned by a command, unless the test is being recorded in the `actions/` directory of the recorded tests. If you'd like to capture the returned `that` mark when recording a test somewhere else, you can say `"cursorless record that mark"`.

#### Testing the hat map

We have a way to test that the hats in the hat map update correctly during the course of a single phrase. These tests are also how we usually test our [range updating code](../api/modules/cursorless_engine_core_updateSelections_updateSelections).

Any tests recorded in the `hatTokenMap` directory will automatically be treated as hat token map tests. To initiate a series of hat token map tests in another directory, say `"cursorless record navigation"`.

Then each time you record a test, you need to issue two commands. The second command should be of the form `"take air"` (or another decorated mark), and will tell the test case recorder which decorated mark you're checking.

### Default config per test case directory

Any test case directory that contains a `config.json` will set default configuration for all tests recorded in any descendant directory. For example, the file [`actions/config.json`](../../packages/cursorless-vscode-e2e/src/suite/fixtures/recorded/actions/config.json) makes it so that all our action tests will capture the final `that` mark. For a full list of keys supported in this json, see [the api docs](../api/interfaces/cursorless_engine_testCaseRecorder_TestCaseRecorder.internal.RecordTestCaseCommandArg/).

### Navigation map tests

If you want to check how the navigation map gets updated in response to changes, you can instead say "cursorless record navigation", and then you need to issue two commands in one phrase each time. The second command should be of the form "take air" (or another decorated mark), and will tell the test case recorder which decorated mark we're checking.

## Run recorded tests

Recorded tests will automatically be picked up and run with the normal tests,
and can be run in vscode or via yarn in terminal.

## Changing recorded test cases in bulk

### Autoformatting

To clean up the formatting of all of the yaml test cases, run `yarn compile && yarn transform-recorded-tests`

### Upgrading fixtures

To upgrade all the test fixtures to the latest command version, run the command `yarn compile && yarn transform-recorded-tests upgrade`. This command should be idempotent.

### Custom transformation

1. Add a new transformation to the [`transformRecordedTests` directory](../../packages/common/src/scripts/transformRecordedTests). Look at the existing transformations in that directory for inspiration.
1. Change the value at the `custom` key in `AVAILABLE_TRANSFORMATIONS` at the top of
   [`transformRecordedTests/index.ts`](../../packages/common/src/scripts/transformRecordedTests/index.ts) to
   point to your new transformation
1. Run `yarn compile && yarn transform-recorded-tests custom`

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
