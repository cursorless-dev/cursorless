# Test case recorder

We use an automated test case recorder to generate test cases. To use it, you
set up a file the way you'd like (usually a minimal file containing something
like `hello world`), positioning your cursor where you want, tell cursorless to
start recording, and then issue one or more cursorless commands. It works by
recording the initial state of the file including cursor position(s), the
command run, and the final state, all in the form of a yaml document. See
[existing test cases](../../../../../data/fixtures/recorded) for example outputs.

## Recording new tests

1. Run the extension locally by saying `"debug extension"` (as described [in the
   inital setup
   documentation](https://www.cursorless.org/docs/contributing/#running--testing-extension-locally)).
1. Open an editor and fill it out with the content on which you'd like to
   operate. You can just use an untitled document, or open a real file; it
   doesn't matter. Please try to keep the file as small as possible, though.
1. Say `"cursorless record"`. Alternately, issue one of the special recording
   commands listed in [Test case recorder options](#test-case-recorder-options).
1. Pick a target directory, or create a new one by just typing the name of the
   new directory. Using `/` will create nested subdirectories.
1. Issue any cursorless voice command, eg `"take air"`. This will result in a
   new test case being generated in the Cursorless directory. You can verify by
   returning to the main VSCode window and looking at the source control
   sidebar to see the new yaml file.
1. Repeat as many cursorless voice commands as you want recorded. Each command
   you issue will generate a test case in the form of a new yaml file.
1. Issue `"cursorless record"` command again to stop recording

## Test case recorder options

The test case recorder has several additional configuration options. The default configuration works for most tests, but you may find the following useful. For a full list of supported configuration options, see [`RecordTestCaseCommandOptions`](../../../../../packages/cursorless-engine/src/testCaseRecorder/RecordTestCaseCommandOptions.ts).

### The options

#### Capturing errors

We support recording tests where the expected result is an error. This can be done using the command `"cursorless record error"`.

#### Testing decoration highlights

We support testing our decoration highlights, eg the flash of red when something is deleted. If you record tests into the `decorations/` directory, these will automatically be captured.

If you'd like to record decorations when recording into a different directory, you can say `"cursorless record highlights"`.

#### Testing the returned `that` mark

By default, we don't capture the `that` mark returned by a command, unless the test is being recorded in the `actions/` directory of the recorded tests. If you'd like to capture the returned `that` mark when recording a test somewhere else, you can say `"cursorless record that mark"`.

#### Testing the hat map

We have a way to test that the hats in the hat map update correctly during the course of a single phrase. These tests are also how we usually test our [range updating code](../../../../../packages/cursorless-engine/src/core/updateSelections/updateSelections.ts).

Any tests recorded in the `hatTokenMap` directory will automatically be treated as hat token map tests. To initiate a series of hat token map tests in another directory, say `"cursorless record navigation"`.

Then each time you record a test, you need to issue two commands. The second command should be of the form `"take air"` (or another decorated mark), and will tell the test case recorder which decorated mark you're checking.

### Default config per test case directory

Any test case directory that contains a `config.json` will set default configuration for all tests recorded in any descendant directory. For example, the file [`actions/config.json`](../../../../../data/fixtures/recorded/actions/config.json) makes it so that all our action tests will capture the final `that` mark. For a full list of keys supported in this json, see [`RecordTestCaseCommandOptions`](../../../../../packages/cursorless-engine/src/testCaseRecorder/RecordTestCaseCommandOptions.ts).

### Navigation map tests

If you want to check how the navigation map gets updated in response to changes, you can instead say "cursorless record navigation", and then you need to issue two commands in one phrase each time. The second command should be of the form "take air" (or another decorated mark), and will tell the test case recorder which decorated mark we're checking.

## Run recorded tests

Recorded tests will automatically be picked up and run with the normal tests.

## Changing recorded test cases in bulk

### Autoformatting

To clean up the formatting of all of the yaml test cases, run `pnpm transform-recorded-tests`

### Canonicalizing fixtures

To upgrade test fixtures to their canonical, latest form, run the command `pnpm transform-recorded-tests --canonicalize <paths>`. This command should be idempotent.

### Partially upgrading fixtures

We periodically upgrade test case fixtures to use the version of our command payload from one year ago. To do so, proceed as follows:

1. Look at the blame of the big switch statement in the `upgradeCommand` function in [`canonicalizeAndValidateCommand`](../../../../../packages/cursorless-engine/src/core/commandVersionUpgrades/canonicalizeAndValidateCommand.ts). You can do this on the web [here](https://github.com/cursorless-dev/cursorless/blame/main/packages/cursorless-engine/src/core/commandVersionUpgrades/canonicalizeAndValidateCommand.ts)
1. Find the newest `case` branch that is at least one year old
1. Look at the version number that is the guard of that case branch; the minimum number should be that + 1
1. Run `pnpm transform-recorded-tests --upgrade --minimum-version 5`, where 5 is the minimum version number you found
1. Open a PR with the changes

### Custom transformation

1. Add a new transformation to the [`transformRecordedTests` directory](../../../../../packages/cursorless-engine/src/scripts/transformRecordedTests). Look at the existing transformations in that directory for inspiration.
1. Change the value at the `custom` key in `AVAILABLE_TRANSFORMATIONS` at the top of
   [`transformRecordedTests/index.ts`](../../../../../packages/cursorless-engine/src/scripts/transformRecordedTests/index.ts) to
   point to your new transformation
1. Run `pnpm transform-recorded-tests --custom`

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
