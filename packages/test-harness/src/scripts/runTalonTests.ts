/**
 * Runs all Talon tests.
 */

void (async () => {
  const { TestType, runAllTests } = await import("../runAllTests");

  await runAllTests(TestType.talon);
})();
