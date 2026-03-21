/**
 * Runs all Talon tests.
 */

import { TestType, runAllTests } from "../runAllTests";

runAllTests(TestType.talon).catch(() => {
  process.exit(1);
});
