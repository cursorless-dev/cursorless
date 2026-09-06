/**
 * Runs all Talon tests.
 */

import { exit } from "node:process";
import { TestType, runAllTests } from "../runAllTests";

try {
  await runAllTests(TestType.talon);
} catch (error) {
  console.error(error);
  exit(1);
}
