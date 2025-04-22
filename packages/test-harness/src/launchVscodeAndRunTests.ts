import {
  extensionDependencies,
  getEnvironmentVariableStrict,
} from "@cursorless/common";
import { getCursorlessRepoRoot } from "@cursorless/node-common";
import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests,
} from "@vscode/test-electron";
import { sync } from "cross-spawn";
import * as os from "node:os";
import * as path from "node:path";

/**
 * Downloads and launches VSCode, instructing it to run the test runner
 * specified in {@link extensionTestsPath}.
 * @param extensionTestsPath The path to test runner, passed to
 * `--extensionTestsPath`
 */
export async function launchVscodeAndRunTests(extensionTestsPath: string) {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(
      getCursorlessRepoRoot(),
      "packages/cursorless-vscode/dist",
    );

    const crashDir = getEnvironmentVariableStrict("VSCODE_CRASH_DIR");
    const logsDir = getEnvironmentVariableStrict("VSCODE_LOGS_DIR");
    const useLegacyVscode =
      getEnvironmentVariableStrict("APP_VERSION") === "legacy";

    // NB: We include the exact version here instead of in `test.yml` so that
    // we don't have to update the branch protection rules every time we bump
    // the legacy VSCode version.

    // NB: Because of a CI crashing issue the vscode version is pinned.
    // https://github.com/cursorless-dev/cursorless/issues/2878

    const vscodeVersion = useLegacyVscode
      ? "1.82.0"
      : os.platform() === "win32"
        ? "stable"
        : "1.97.2";
    const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
    const [cli, ...args] =
      resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    const extensionInstallArgs = [
      ...args,
      ...extensionDependencies.flatMap((dependency) => [
        "--install-extension",
        dependency,
      ]),
    ];

    console.log("starting to install dependency extensions");
    console.log(`cli: ${cli}`);
    console.log(JSON.stringify(extensionInstallArgs, null, 2));

    const { status, signal, error } = sync(cli, extensionInstallArgs, {
      encoding: "utf-8",
      stdio: "inherit",
    });

    console.log("status: ", status);
    console.log("signal: ", signal);
    console.log("error: ", error);

    console.log("finished installing dependency extensions");

    // Run the integration test
    const code = await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      // Note: Crash dump causes legacy VSCode and Windows to hang, so we just
      // don't bother.  Can be re-enabled if we ever need it; on windows it only
      // hangs some of the time, so might be enough to get a crash dump when you
      // need it.
      launchArgs:
        useLegacyVscode || os.platform() === "win32"
          ? undefined
          : [`--crash-reporter-directory=${crashDir}`, `--logsPath=${logsDir}`],
    });

    console.log(`Returned from "runTests" with value: ${code}`);
  } catch (err) {
    console.error("Test run threw exception:");
    console.error(err);
    process.exit(1);
  }
}
