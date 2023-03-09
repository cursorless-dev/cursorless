/**
 * This file can be run from node to run tests in CI
 */

import { getCursorlessRepoRoot } from "@cursorless/common";
import * as path from "path";
import { launchVscodeAndRunTests } from "../util/launchVscodeAndRunTests";

async function main() {
  // Note that we run all tests, including unit tests, in VSCode, even though
  // unit tests could be run separately.  If we wanted to run unit tests
  // separately, we could instead use `../runners/endToEndOnly` instead of
  // `../runners/all` and then just call `await runUnitTests()` beforehand to
  // run the unit tests directly, instead of as part of VSCode runner.
  const extensionTestsPath = path.resolve(
    getCursorlessRepoRoot(),
    "packages/test-harness/out/runners/all",
  );

  await launchVscodeAndRunTests(extensionTestsPath);
}

main();
