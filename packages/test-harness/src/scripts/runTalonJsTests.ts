/**
 * Runs all Talon everywhere/JS tests.
 */

process.env.CURSORLESS_MODE = "test";

void (async () => {
  const { TestType, runAllTests } = await import("../runAllTests");

  try {
    await runAllTests(TestType.talonJs);
  } catch (_ex) {
    process.exit(1);
  }
})();
