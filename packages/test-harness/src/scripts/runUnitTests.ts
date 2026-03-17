/**
 * Runs all tests that don't have to be run within a particular environment.
 */

void (async () => {
  const { TestType, runAllTests } = await import("../runAllTests");

  await runAllTests(TestType.unit);
})();
