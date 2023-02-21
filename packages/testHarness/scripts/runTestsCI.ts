/**
 * This file can be run from node to run tests in CI
 */

// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active
import "module-alias/register";

import * as path from "path";
import { launchVscodeAndRunTests } from "../util/launchVscodeAndRunTests";

async function main() {
  // Note that we run all tests, including unit tests, in VSCode, even though
  // unit tests could be run separately.  If we wanted to run unit tests
  // separately, we could instead use `../runners/endToEndOnly` instead of
  // `../runners/all` and then just call `await runUnitTests()` beforehand to
  // run the unit tests directly, instead of as part of VSCode runner.
  const extensionTestsPath = path.resolve(__dirname, "../runners/all");

  await launchVscodeAndRunTests(extensionTestsPath);
}

main();
