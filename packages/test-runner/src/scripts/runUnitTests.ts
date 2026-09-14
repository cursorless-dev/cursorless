/**
 * Runs all tests that don't have to be run within a particular environment.
 */

import { exit } from "node:process";
import { TestType, runAllTests } from "../runAllTests";
import { setupWebTests } from "../setupWebTests";

try {
  setupWebTests();

  await runAllTests(TestType.unit);
} catch (error) {
  console.error(error);
  exit(1);
}
