export function skipIfWindowsCi() {
  suiteSetup(function () {
    if (process.env.RUNNER_OS === "Windows" && process.env.CI === "true") {
      this.skip();
    }
  });
}
