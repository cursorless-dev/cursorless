/**
 * Runs all Talon everywhere/JS tests.
 */

import { exit } from "node:process";
import { TestType, runAllTests } from "../runAllTests";

try {
  await runAllTests(TestType.talonJs);
} catch (error) {
  console.error(error);
  exit(1);
}
