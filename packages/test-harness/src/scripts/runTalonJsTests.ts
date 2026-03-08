/**
 * Runs all Talon everywhere/JS tests.
 */
import { TestType, runAllTests } from "../runAllTests";

void (async () => {
  try {
    await runAllTests(TestType.talonJs);
  } catch (_ex) {
    process.exit(1);
  }
})();
