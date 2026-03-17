/**
 * Runs all Talon everywhere/JS tests.
 */

void (async () => {
  const { TestType, runAllTests } = await import("../runAllTests");

  await runAllTests(TestType.talonJs);
})();
