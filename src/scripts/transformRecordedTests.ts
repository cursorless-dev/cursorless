import * as fs from "fs";
import update from "immutability-helper";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { TestCaseFixture } from "../testUtil/TestCase";

import { walkFilesSync } from "../testUtil/walkSync";
import serialize from "../testUtil/serialize";
import canonicalizeActionName from "../util/canonicalizeActionName";
import { transformPrimitiveTargets } from "../util/getPrimitiveTargets";
import { PartialPrimitiveTarget } from "../typings/Types";

/**
 * The transformation to run on all recorded test fixtures.  Change this
 * variable to do a custom bulk transformation.
 */
const FIXTURE_TRANSFORMATION: (
  originalFixture: TestCaseFixture
) => TestCaseFixture = updateSurroundingPairTest;

async function main() {
  const directory = path.join(
    __dirname,
    "../../src/test/suite/fixtures/recorded"
  );
  const files = walkFilesSync(directory);

  files.forEach(transformFile);
}

async function transformFile(file: string) {
  const buffer = await fsp.readFile(file);
  const inputFixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const outputFixture = FIXTURE_TRANSFORMATION(inputFixture);
  await fsp.writeFile(file, serialize(outputFixture));
}

// COMMON TRANSFORMATIONS
// ======================
// Below are some common transformations you might want to run.

function identity(fixture: TestCaseFixture) {
  return fixture;
}

function canonicalizeActionNames(fixture: TestCaseFixture) {
  return update(fixture, { command: { actionName: canonicalizeActionName } });
}

function reorderFields(fixture: TestCaseFixture) {
  return {
    spokenForm: fixture.spokenForm,
    languageId: fixture.languageId,
    command: fixture.command,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    returnValue: fixture.returnValue,
    fullTargets: fixture.fullTargets,
  };
}

function updateSurroundingPairTest(fixture: TestCaseFixture) {
  let foundSurroundingPair = false;
  fixture.command.partialTargets = transformPrimitiveTargets(
    fixture.command.partialTargets,
    (target: PartialPrimitiveTarget) => {
      if (target.modifier?.type === "surroundingPair") {
        target.modifier.delimiterInclusion =
          target.modifier.delimiterInclusion ??
          ((target.modifier as any).delimitersOnly
            ? "delimitersOnly"
            : fixture.command.actionName === "clearAndSetSelection"
            ? "excludeDelimiters"
            : "includeDelimiters");
        (target.modifier as any).delimitersOnly = undefined;
        foundSurroundingPair = true;
      }
      return target;
    }
  );

  if (foundSurroundingPair) {
    fixture.command.actionName = "clearAndSetSelection";

    const spokenWords = fixture.spokenForm.split(" ");
    spokenWords[0] = "clear";
    fixture.spokenForm = spokenWords.join(" ");
  }

  return fixture;
}

main();
