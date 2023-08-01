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

  const commandComplete = {
    ...canonicalizeAndValidateCommand(fixture.command),
    spokenForm: getSpokenFormFromFixture(fixture),
  };

  await runTest(repl, commandComplete);
}

async function runCommandFixture(repl: TalonRepl, command: Command) {
  const commandComplete = canonicalizeAndValidateCommand(command);

  await runTest(repl, commandComplete);
}

async function runTest(repl: TalonRepl, command: CommandComplete) {
  assert.ok(command.spokenForm != null);

  const result = await repl.action(
    `user.private_cursorless_spoken_form_test("${command.spokenForm}")`,
  );

  const commandActualLegacy = (() => {
    try {
      return JSON.parse(result);
    } catch (e) {
      throw Error(result);
    }
  })();

  // TODO: Remove once Talon side is on latest version
  const commandActual = canonicalizeAndValidateCommand(commandActualLegacy);

  const commandExpected = {
    ...command,
    usePrePhraseSnapshot: true,
  };

  assert.deepStrictEqual(commandActual, commandExpected);
}

function getSpokenFormFromFixture(
  fixture: TestCaseFixtureLegacy,
): string | undefined {
  if (fixture.command.spokenForm == null) {
    return undefined;
  }
  if (fixture.marksToCheck != null) {
    const parts = fixture.command.spokenForm.split(" ");
    return parts.slice(0, parts.length - 2).join(" ");
  }
  return fixture.command.spokenForm;
}

function toggleTestMode(repl: TalonRepl, enabled: boolean) {
  const arg = enabled ? "True" : "False";
  return repl.action(`user.private_cursorless_spoken_form_test_mode(${arg})`);
}
