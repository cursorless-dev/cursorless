/**
 * Runs all Talon tests.
 */

import { TestType, runAllTests } from "../runAllTests";

runAllTests(TestType.talon).catch((error) => {
  console.error(error);
  process.exit(1);
});
