/**
 * Runs all Talon everywhere/JS tests.
 */

void (async () => {
  process.env.CURSORLESS_MODE = "test";

  const { TestType, runAllTests } = await import("../runAllTests");

  try {
    await runAllTests(TestType.talonJs);
  } catch (_ex) {
    process.exit(1);
  }
})();
