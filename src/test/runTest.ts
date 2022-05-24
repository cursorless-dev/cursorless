import * as path from "path";
import * as cp from "child_process";

import {
  runTests,
  resolveCliPathFromVSCodeExecutablePath,
  downloadAndUnzipVSCode,
} from "vscode-test";
import { extensionDependencies } from "./extensionDependencies";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    const cliPath =
      resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    cp.spawnSync(
      cliPath,
      extensionDependencies.flatMap((dependency) => [
        "--install-extension",
        dependency,
      ]),
      {
        encoding: "utf-8",
        stdio: "inherit",
      }
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

main();
