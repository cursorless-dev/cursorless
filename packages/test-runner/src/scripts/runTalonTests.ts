/**
 * Runs all Talon tests.
 */

import { TestType, runAllTests } from "../runAllTests";

try {
  await runAllTests(TestType.talon);
} catch (error) {
  console.error(error);
  process.exit(1);
}
