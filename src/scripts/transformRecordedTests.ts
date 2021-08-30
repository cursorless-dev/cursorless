import * as fs from "fs";
import update from "immutability-helper";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { TestCaseFixture } from "../testUtil/TestCase";

import { walkFilesSync } from "../testUtil/walkSync";
import serialize from "../testUtil/serialize";
import canonicalizeActionName from "../canonicalizeActionName";

const FIXTURE_TRANSFORMATION = identity;

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

main();
