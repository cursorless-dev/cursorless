import * as fs from "fs";
import update from "immutability-helper";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { TestCaseFixture } from "../testUtil/TestCase";

import { walkFilesSync } from "../testUtil/walkSync";
import serialize from "../testUtil/serialize";
import canonicalizeActionName from "../canonicalizeActionName";

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
  const outputFixture = fixtureTransformation(inputFixture);
  await fsp.writeFile(file, serialize(outputFixture));
}

/**
 * Performs a particular transformation on a text fixture
 *
 * NOTE: Change this function to perform a transformation
 * @param fixture The test fixture to transform
 * @returns The transformed text fixture
 */
function fixtureTransformation(fixture: TestCaseFixture) {
  return update(fixture, { command: { actionName: canonicalizeActionName } });
}

main();
