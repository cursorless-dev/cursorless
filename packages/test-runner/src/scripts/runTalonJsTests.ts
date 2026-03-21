/**
 * Runs all Talon everywhere/JS tests.
 */

import { TestType, runAllTests } from "../runAllTests";

runAllTests(TestType.talonJs).catch((error) => {
  console.error(error);
  process.exit(1);
});
