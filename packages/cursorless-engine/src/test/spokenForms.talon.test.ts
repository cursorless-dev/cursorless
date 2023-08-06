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
  const alreadyUsed = new Map<string, CommandComplete[]>();

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
    test(name, () => runRecordedFixture(repl, alreadyUsed, path)),
  );

  // A few more spoken forms that we want to test, mostly due to having multiple
  // ways to say them so being forced to pick one in our recorded tests so that
  // our spoken form generator can be deterministic
  spokenFormsFixture.forEach((command) =>
    test(command.spokenForm, () =>
      runCommandFixture(repl, alreadyUsed, command),
    ),
  );
});

async function runRecordedFixture(
  repl: TalonRepl,
  alreadyUsed: Map<string, CommandComplete[]>,
  file: string,
) {
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

  await runTest(repl, alreadyUsed, fixture.command.spokenForm, ...commands);
}

async function runCommandFixture(
  repl: TalonRepl,
  alreadyUsed: Map<string, CommandComplete[]>,
  command: Command,
) {
  const commandComplete = canonicalizeAndValidateCommand(command);

  assert(commandComplete.spokenForm != null);

  await runTest(repl, alreadyUsed, commandComplete.spokenForm, commandComplete);
}

async function runTest(
  repl: TalonRepl,
  alreadyUsed: Map<string, CommandComplete[]>,
  spokenForm: string,
  ...commands: CommandComplete[]
) {
  const commandsActual = await getCommandsActual(repl, alreadyUsed, spokenForm);

  const commandsExpected = commands.map((command) => ({
    ...command,
    spokenForm,
    usePrePhraseSnapshot: true,
  }));

  assert.deepStrictEqual(commandsActual, commandsExpected);
}

async function getCommandsActual(
  repl: TalonRepl,
  alreadyUsed: Map<string, CommandComplete[]>,
  spokenForm: string,
): Promise<CommandComplete[]> {
  if (alreadyUsed.has(spokenForm)) {
    return alreadyUsed.get(spokenForm)!;
  }

  const result = await repl.action(
    `user.private_cursorless_spoken_form_test("${spokenForm}")`,
  );

  const commandsActualLegacy = (() => {
    try {
      return JSON.parse(result);
    } catch (e) {
      throw Error(result);
    }
  })();

  // TODO: Remove once Talon side is on latest version
  const commandsActual = commandsActualLegacy.map(
    canonicalizeAndValidateCommand,
  );

  alreadyUsed.set(spokenForm, commandsActual);

  return commandsActual;
}

async function setTestMode(repl: TalonRepl, enabled: boolean) {
  const arg = enabled ? "True" : "False";
  await repl.action(`user.private_cursorless_spoken_form_test_mode(${arg})`);

  // If you have warnings in your talon user files, they will be printed to the
  // repl when you run the above action. We need to eat them so that they don't
  // interfere with our tests
  await repl.eatOutput();
}
