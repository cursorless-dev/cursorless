/**
 * Runs all tests that don't have to be run within VSCode.
 */
import { TestType, runAllTests } from "../runAllTests";

void runAllTests(TestType.unit);
