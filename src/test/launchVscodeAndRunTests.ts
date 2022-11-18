import * as cp from "child_process";
import * as path from "path";
import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests,
} from "@vscode/test-electron";
import { env } from "process";
import { extensionDependencies } from "./extensionDependencies";

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
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // NB: We include the exact version here instead of in `test.yml` so that
    // we don't have to update the branch protection rules every time we bump
    // the legacy VSCode version.
    const vscodeVersion = env.VSCODE_VERSION === "legacy" ? "1.66.0" : "stable";
    const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
    const [cli, ...args] =
      resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    cp.spawnSync(
      cli,
      [
        ...args,
        ...extensionDependencies.flatMap((dependency) => [
          "--install-extension",
          dependency,
        ]),
      ],
      {
        encoding: "utf-8",
        stdio: "inherit",
      },
    );

    // Run the integration test
    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}
