/**
 * Runs all Talon everywhere/JS tests in CI.
 */
import { TestType, runAllTests } from "../runAllTests";

void runAllTests(TestType.talonJs);
