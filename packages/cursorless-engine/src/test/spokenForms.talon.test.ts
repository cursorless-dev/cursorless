import {
  Command,
  CommandComplete,
  TestCaseFixtureLegacy,
  asyncSafety,
  getRecordedTestPaths,
} from "@cursorless/common";
import * as assert from "assert";
import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";
import { canonicalizeAndValidateCommand } from "../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { getHatMapCommand } from "../generateSpokenForm/getHatMapCommand";
import { TalonRepl } from "../testUtil/TalonRepl";
import { spokenFormsFixture } from "./fixtures/spokenForms.fixture";

suite("Talon spoken forms", async function () {
  const repl = new TalonRepl();

  suiteSetup(
    asyncSafety(async () => {
      await repl.start();
      await setTestMode(repl, true);
    }),
  );

  suiteTeardown(
    asyncSafety(async () => {
      await setTestMode(repl, false);
      await repl.stop();
    }),
  );

  // Test spoken forms in all of our recorded test fixtures
  getRecordedTestPaths().forEach(({ name, path }) =>
    test(name, () => runRecordedFixture(repl, path)),
  );

  // A few more spoken forms that we want to test, mostly due to having multiple
  // ways to say them so being forced to pick one in our recorded tests so that
  // our spoken form generator can be deterministic
  spokenFormsFixture.forEach((command) =>
    test(command.spokenForm, () => runCommandFixture(repl, command)),
  );
});

async function runRecordedFixture(repl: TalonRepl, file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;

  if (fixture.spokenFormError != null) {
    return;
  }

  const commands: CommandComplete[] = [
    canonicalizeAndValidateCommand(fixture.command),
  ];

  if (fixture.marksToCheck != null) {
    commands.push(getHatMapCommand(fixture.marksToCheck));
  }

  assert(fixture.command.spokenForm != null);

  await runTest(repl, fixture.command.spokenForm, ...commands);
}

async function runCommandFixture(repl: TalonRepl, command: Command) {
  const commandComplete = canonicalizeAndValidateCommand(command);

  assert(commandComplete.spokenForm != null);

  await runTest(repl, commandComplete.spokenForm, commandComplete);
}

async function runTest(
  repl: TalonRepl,
  spokenForm: string,
  ...commands: CommandComplete[]
) {
  const result = await repl.action(
    `user.private_cursorless_spoken_form_test("${spokenForm}")`,
  );

  const commandsActual = (() => {
    try {
      return JSON.parse(result);
    } catch (e) {
      throw Error(result);
    }
  })();

  const commandsExpected = commands.map((command) => ({
    ...command,
    spokenForm,
    usePrePhraseSnapshot: true,
  }));

  assert.deepStrictEqual(commandsActual, commandsExpected);
}

async function setTestMode(repl: TalonRepl, enabled: boolean) {
  const arg = enabled ? "True" : "False";
  await repl.action(`user.private_cursorless_spoken_form_test_mode(${arg})`);

  // If you have warnings in your talon user files, they will be printed to the
  // repl when you run the above action. We need to eat them so that they don't
  // interfere with our tests
  await repl.eatOutput();
}
