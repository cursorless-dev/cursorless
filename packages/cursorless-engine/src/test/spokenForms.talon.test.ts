import {
  Command,
  CommandComplete,
  TestCaseFixtureLegacy,
  getRecordedTestPaths,
  getRecordedTestsDirPath,
} from "@cursorless/common";
import * as assert from "assert";
import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";
import * as path from "node:path";
import { canonicalizeAndValidateCommand } from "../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { TalonRepl } from "../testUtil/TalonRepl";
import { spokenFormsFixture } from "./fixtures/spokenForms.fixture";
import { getHatMapCommand } from "../generateSpokenForm/getHatMapCommand";

suite("Talon spoken forms", async function () {
  const repl = new TalonRepl();

  suiteSetup(async () => {
    await repl.start();
    await toggleTestMode(repl, true);
  });

  suiteTeardown(async () => {
    await toggleTestMode(repl, false);
    await repl.stop();
  });

  const relativeDir = path.dirname(getRecordedTestsDirPath());

  getRecordedTestPaths().forEach((testPath) =>
    test(path.relative(relativeDir, testPath.split(".")[0]), () =>
      runRecordedFixture(repl, testPath),
    ),
  );

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

  const commandsExpected = commands.map((command) => ({
    ...command,
    spokenForm,
    usePrePhraseSnapshot: true,
  }));

  assert.deepStrictEqual(commandsActual, commandsExpected);
}

function toggleTestMode(repl: TalonRepl, enabled: boolean) {
  const arg = enabled ? "True" : "False";
  return repl.action(`user.private_cursorless_spoken_form_test_mode(${arg})`);
}
