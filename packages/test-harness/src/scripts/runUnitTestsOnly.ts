/**
 * Runs all tests that don't have to be run within VSCode.
 */
import { TestType, runTests } from "../util/runAllTestsInDir";

runTests(TestType.unit);
