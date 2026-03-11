/**
 * Runs all tests that don't have to be run within VSCode.
 */
import { TestType, runAllTests } from "../runAllTests";

runAllTests(TestType.unit).catch((error) => {
  console.error(error);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
