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
import { DelimiterInclusion, PartialPrimitiveTarget } from "../typings/Types";
import { mkdir, rename, unlink } from "fs/promises";

/**
 * The transformation to run on all recorded test fixtures.  Change this
 * variable to do a custom bulk transformation.
 */
const FIXTURE_TRANSFORMATION: (
  originalFixture: TestCaseFixture
) => TestCaseFixture = identity;

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

/**
 * Can be used to organize files into directories based on eg language id
 * @param file The file to move
 */
async function moveFile(file: string) {
  const buffer = await fsp.readFile(file);
  const inputFixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const parent = path.dirname(file);
  if (path.basename(parent) !== "surroundingPair") {
    return;
  }
  const childDirName =
    inputFixture.languageId === "plaintext"
      ? "textual"
      : `parseTree/${inputFixture.languageId}`;
  const childDir = path.join(parent, childDirName);
  await mkdir(childDir, { recursive: true });
  const outputPath = path.join(childDir, path.basename(file));
  // console.log(`${file} => ${outputPath}`);
  await rename(file, outputPath);
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

// Leaving an example here in case it's helpful
function updateSurroundingPairTest(fixture: TestCaseFixture) {
  fixture.command.partialTargets = transformPrimitiveTargets(
    fixture.command.partialTargets,
    (target: PartialPrimitiveTarget) => {
      if (target.modifier?.type === "surroundingPair") {
        let delimiterInclusion: DelimiterInclusion;

        switch (target.modifier.delimiterInclusion as any) {
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

        target.modifier.delimiterInclusion = delimiterInclusion;
      }
      return target;
    }
  );

  return fixture;
}

main();
