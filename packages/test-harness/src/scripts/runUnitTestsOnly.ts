/**
 * Runs all tests that don't have to be run within VSCode.
 */

const supportedArgs = new Set(["--subset", "--update"]);

const args = new Set(process.argv.slice(2));
const unsupportedArgs = [...args].filter((arg) => !supportedArgs.has(arg));

if (unsupportedArgs.length > 0) {
  throw new Error(`Unsupported arguments: ${unsupportedArgs.join(", ")}`);
}

process.env.CURSORLESS_MODE = "test";

if (args.has("--subset")) {
  process.env.CURSORLESS_RUN_TEST_SUBSET = "true";
}

if (args.has("--update")) {
  process.env.CURSORLESS_TEST_UPDATE_FIXTURES = "true";
}

void (async () => {
  const { TestType, runAllTests } = await import("../runAllTests");

  await runAllTests(TestType.unit);
})();
