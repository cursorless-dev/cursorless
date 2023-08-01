import {
  CommandLatest,
  PartialPrimitiveTargetDescriptor,
  TestCaseFixtureLegacy,
  getRecordedTestPaths,
  getRecordedTestsDirPath,
  serializeTestFixture,
  shouldUpdateFixtures,
  splitKey,
} from "@cursorless/common";
import * as yaml from "js-yaml";
import * as assert from "node:assert";
import { promises as fsp } from "node:fs";
import * as path from "node:path";
import { canonicalizeAndValidateCommand } from "../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { generateSpokenForm } from "./generateSpokenForm";

suite("Generate spoken forms", () => {
  const relativeDir = path.dirname(getRecordedTestsDirPath());

  getRecordedTestPaths().forEach((testPath) =>
    test(path.relative(relativeDir, testPath.split(".")[0]), () =>
      runTest(testPath),
    ),
  );
});

async function runTest(file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;

  const generatedSpokenForm = generateSpokenForm(
    canonicalizeAndValidateCommand(fixture.command),
  );

  if (fixture.marksToCheck != null && generatedSpokenForm.type === "success") {
    // If the test has marks to check (eg a hat token map test), it will end in
    // "take <mark>" as a way to indicate which mark to check
    const hatMapSpokenForm = generateSpokenForm(
      getHatMapCommand(fixture.marksToCheck),
    );
    assert(hatMapSpokenForm.type === "success");
    generatedSpokenForm.value += " " + hatMapSpokenForm.value;
  }

  if (shouldUpdateFixtures()) {
    if (generatedSpokenForm.type === "success") {
      fixture.command.spokenForm = generatedSpokenForm.value;
      fixture.spokenFormError = undefined;
    } else {
      fixture.spokenFormError = generatedSpokenForm.reason;
      // Leave spoken form itself in case it's helpful
    }

    await fsp.writeFile(file, serializeTestFixture(fixture));
  } else {
    if (generatedSpokenForm.type === "success") {
      assert.equal(fixture.command.spokenForm, generatedSpokenForm.value);
      assert.equal(fixture.spokenFormError, undefined);
    } else {
      assert.equal(fixture.spokenFormError, generatedSpokenForm.reason);
      // Don't care what the spoken form is in the test case if we don't know
      // how to generate it
    }
  }
}

/**
 * Constructs the command that would have been used as the second command when
 * recording a hat token map test. Eg if the fixture has `marksToCheck:
 * ["blue.a"]`, we'd return the command corresponding to `"take blue air"`.
 * @param marks The marks that the fixture was checking
 * @returns A command that would select the marks
 */
function getHatMapCommand(marks: string[]): CommandLatest {
  const primitiveTargets = marks.map<PartialPrimitiveTargetDescriptor>(
    (mark) => {
      const { hatStyle, character } = splitKey(mark);

      return {
        type: "primitive",
        mark: { type: "decoratedSymbol", character, symbolColor: hatStyle },
      };
    },
  );

  return {
    action: {
      name: "setSelection",
      target:
        primitiveTargets.length === 1
          ? primitiveTargets[0]
          : {
              type: "list",
              elements: primitiveTargets,
            },
    },
    version: 6,
    usePrePhraseSnapshot: false,
  };
}
