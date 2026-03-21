/**
 * Runs all tests that don't have to be run within a particular environment.
 */

import { TestType, runAllTests } from "../runAllTests";

runAllTests(TestType.unit).catch((error) => {
  console.error(error);
  process.exit(1);
});
