import type {
  Command,
  CommandLatest,
  TestCaseFixtureLegacy,
} from "@cursorless/common";
import { asyncSafety, getRecordedTestPaths } from "@cursorless/common";
import * as assert from "assert";
import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";
import { canonicalizeAndValidateCommand } from "../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { getHatMapCommand } from "../generateSpokenForm/getHatMapCommand";
import { TalonRepl } from "../testUtil/TalonRepl";
import { synonymousSpokenFormsFixture } from "./fixtures/synonymousSpokenForms.fixture";
import { talonApiFixture } from "./fixtures/talonApi.fixture";
import { multiActionFixture } from "./fixtures/multiAction.fixture";

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

  // A few more spoken forms that we want to test
  [
    ...synonymousSpokenFormsFixture,
    ...talonApiFixture,
    ...multiActionFixture,
  ].forEach(({ spokenForm, commands, mockedGetValue }) =>
    test(spokenForm, () => runTest(repl, spokenForm, commands, mockedGetValue)),
  );
});

async function runRecordedFixture(repl: TalonRepl, file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;

  if (fixture.spokenFormError != null) {
    return;
  }

  const commands: Command[] = [fixture.command];

  if (fixture.marksToCheck != null) {
    commands.push(getHatMapCommand(fixture.marksToCheck));
  }

  assert(fixture.command.spokenForm != null);

  await runTest(repl, fixture.command.spokenForm, commands);
}

const alreadyRan: Record<
  string,
  { commands: CommandLatest[]; mockedGetValue: unknown | undefined }
> = {};

async function runTest(
  repl: TalonRepl,
  spokenForm: string,
  commandsLegacy: Command[],
  mockedGetValue?: unknown,
) {
  const commandsExpected = commandsLegacy.map((command) => ({
    ...canonicalizeAndValidateCommand(command),
    spokenForm,
    usePrePhraseSnapshot: true,
  }));

  const valueForCache = { commands: commandsExpected, mockedGetValue };

  // If we've already run this test, we don't need to run it again
  if (alreadyRan[spokenForm] != null) {
    assert.deepStrictEqual(alreadyRan[spokenForm], valueForCache);
    return;
  }

  alreadyRan[spokenForm] = valueForCache;

  // Note that we have to stringify twice here because the first time is to
  // convert it to a json string, and the second time is to take that string
  // and convert it to a python string literal
  const mockedGetValueString =
    mockedGetValue == null
      ? "None"
      : JSON.stringify(JSON.stringify(mockedGetValue));

  const result = await repl.action(
    `user.private_cursorless_spoken_form_test("${spokenForm}", ${mockedGetValueString})`,
  );

  const commandsActual = (() => {
    try {
      return JSON.parse(result);
    } catch (e) {
      throw Error(result);
    }
  })();

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
