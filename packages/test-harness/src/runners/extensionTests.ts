import { TestType, runAllTests } from "../util/runAllTests";

/**
 * Runs all extension tests.  This function should only be called via the
 * --extensionDevelopmentPath VSCode mechanism, as it includes tests that can
 * only run in VSCode.  We use this runner for both the local test launch config
 * and the CI test runner action.
 * @returns A promise that resolves when tests have finished running
 */
export function run(): Promise<void> {
  return runAllTests(TestType.vscode, TestType.unit);
}
