/**
 * Runs all tests that don't have to be run within VSCode.
 */
import { TestType, runAllTests } from "../util/runAllTests";

runAllTests(TestType.unit);
