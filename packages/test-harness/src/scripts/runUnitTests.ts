/**
 * Runs all tests that don't have to be run within a particular environment.
 */

import { TestType, runAllTests } from "../runAllTests";

void runAllTests(TestType.unit);
