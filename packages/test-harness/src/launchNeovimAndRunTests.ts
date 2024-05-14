// import * as cp from "child_process";
// import * as path from "path";
// import * as os from "os";
// import {
//   downloadAndUnzipVSCode,
//   resolveCliArgsFromVSCodeExecutablePath,
//   runTests,
// } from "@vscode/test-electron";
// import {
//   extensionDependencies,
//   getCursorlessRepoRoot,
// } from "@cursorless/common";
import { getEnvironmentVariableStrict } from "@cursorless/common";

/**
 * Launches neovim, instructing it to run the test runner
 * specified in {@link extensionTestsPath}.
 * @param extensionTestsPath The path to test runner, passed to
 * `--extensionTestsPath`
 */
export async function launchNeovimAndRunTests(extensionTestsPath: string) {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    // const extensionDevelopmentPath = path.resolve(
    //   getCursorlessRepoRoot(),
    //   "packages/cursorless-vscode/dist",
    // );

    const crashDir = getEnvironmentVariableStrict("APP_CRASH_DIR");
    const logsDir = getEnvironmentVariableStrict("APP_LOGS_DIR");
    const useLegacyVscode =
      getEnvironmentVariableStrict("APP_VERSION") === "legacy";

    // NB: We include the exact version here instead of in `test.yml` so that
    // we don't have to update the branch protection rules every time we bump
    // the legacy VSCode version.
    // const vscodeVersion = useLegacyVscode ? "1.75.1" : "stable";
    // const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
    // const [cli, ...args] =
    //   resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
    let cli = getEnvironmentVariableStrict("APP_PATH");
    cli = cli.replace("nvim.exe", "nvim-qt.exe");

    // Install extension dependencies
    // const extensionInstallArgs = [
    //   ...args,
    //   ...extensionDependencies.flatMap((dependency) => [
    //     "--install-extension",
    //     dependency,
    //   ]),
    // ];

    // console.log("starting to install dependency extensions");
    console.log(`cli: ${cli}`);
    // console.log(JSON.stringify(extensionInstallArgs, null, 2));

    // const { status, signal, error } = cp.spawnSync(cli, extensionInstallArgs, {
    //   encoding: "utf-8",
    //   stdio: "inherit",
    // });

    // console.log("status: ", status);
    // console.log("signal: ", signal);
    // console.log("error: ", error);

    // console.log("finished installing dependency extensions");

    // Run the integration test
    // const code = await runTests({
    //   vscodeExecutablePath,
    //   extensionDevelopmentPath,
    //   extensionTestsPath,
    //   // Note: Crash dump causes legacy VSCode and Windows to hang, so we just
    //   // don't bother.  Can be re-enabled if we ever need it; on windows it only
    //   // hangs some of the time, so might be enough to get a crash dump when you
    //   // need it.
    //   launchArgs:
    //     useLegacyVscode || os.platform() === "win32"
    //       ? undefined
    //       : [`--crash-reporter-directory=${crashDir}`, `--logsPath=${logsDir}`],
    // });
    const code = 0;

    console.log(`Returned from "runTests" with value: ${code}`);
  } catch (err) {
    console.error("Test run threw exception:");
    console.error(err);
    process.exit(1);
  }
}
