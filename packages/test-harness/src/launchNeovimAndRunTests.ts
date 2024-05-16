import * as cp from "child_process";
// import * as path from "path";
// import * as os from "os";
import { copyFile, exists, unlinkSync } from "fs";
import { Tail } from "tail";
// import {
//   downloadAndUnzipVSCode,
//   resolveCliArgsFromVSCodeExecutablePath,
//   runTests,
// } from "@vscode/test-electron";
import {
  //   extensionDependencies,
  getCursorlessRepoRoot,
} from "@cursorless/common";
import { getEnvironmentVariableStrict } from "@cursorless/common";

// https://stackoverflow.com/questions/37764665/how-to-implement-sleep-function-in-typescript
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Launches neovim, instructing it to run the test runner
 * specified in {@link extensionTestsPath}.
 * @param extensionTestsPath The path to test runner, passed to
 * `--extensionTestsPath`
 */
export async function launchNeovimAndRunTests(extensionTestsPath: string) {
  let code = 1; // failure
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
    // Installed executable: C:\Users\runneradmin\nvim-stable\bin\nvim.exe
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

    // console.log(`Starting nvim for creating config directories...`);
    // const { status, signal, error } = cp.spawnSync(
    //   cli,
    //   [
    //     "-l",
    //     `${getCursorlessRepoRoot()}\\packages\\test-harness\\src\\config\\empty.lua`,
    //   ],
    //   {
    //     encoding: "utf-8",
    //     stdio: "inherit",
    //   },
    // );
    // console.log(`status: ${status}`);
    // console.log(`signal: ${signal}`);
    // console.log(`error: ${error}`);

    // C:\Users\runneradmin\AppData\Local\nvim\init.lua
    // C:\Users\runneradmin\AppData\Local\nvim-data\lazy\{cursorless.nvim,lazy.nvim,talon.nvim}
    // C:\Users\runneradmin\AppData\Local\nvim-data\log
    copyFile(
      `${getCursorlessRepoRoot()}\\packages\\test-harness\\src\\config\\init.lua`,
      "C:\\Users\\runneradmin\\AppData\\Local\\nvim\\init.lua",
      (err) => {
        if (err) {
          console.error(err);
        }
      },
    );
    console.log("init.lua copying done");

    const logName = `${getCursorlessRepoRoot()}/packages/cursorless-neovim/out/nvim_node.log`;

    // temporary, to delete old log when testing
    exists(logName, function (exists) {
      if (exists) {
        console.log("nvim_node.log exists. Deleting now ...");
        unlinkSync(logName);
      } else {
        console.log("nvim_node.log not found, so not deleting.");
      }
    });

    // const nvim_process = cp.spawn(cli); // this works
    const nvim_process = cp.spawn(cli, [], {
      // encoding: "utf-8",
      // stdio: "inherit",
      env: {
        ...process.env,
        // "NVIM_NODE_HOST_DEBUG": "1",
        NVIM_NODE_LOG_FILE: logName,
        NVIM_NODE_LOG_LEVEL: "info",
        CURSORLESS_MODE: "test",
      },
    });
    console.log("nvim started done");

    // do not wait for nvim to exit to avoid any blocking
    nvim_process.unref();

    console.log(`pid: ${nvim_process.pid}`);

    await delay(10000);

    const tail = new Tail(logName, {
      // separator: "\n",
      fromBeginning: true,
    });
    /*
      Test run threw exception:
      Error: ENOENT: no such file or directory, access 'D:\a\cursorless\cursorless\packages\cursorless-neovim\out\nvim_node.log'
          at Object.accessSync (node:fs:254:11)
          at Tail2 (D:\a\cursorless\cursorless\node_modules\.pnpm\tail@2.2.6\node_modules\tail\lib\tail.js:33:16)
      Returned code: 1
          at launchNeovimAndRunTests (D:\a\cursorless\cursorless\packages\test-harness\src\launchNeovimAndRunTests.ts:124:18)
          at <anonymous> (D:\a\cursorless\cursorless\packages\test-harness\src\scripts\runNeovimTestsCI.ts:18:3) {
        errno: -4058,
        code: 'ENOENT',
        syscall: 'access',
        path: 'D:\\a\\cursorless\\cursorless\\packages\\cursorless-neovim\\out\\nvim_node.log'
      }
    */

    // const tail = new Tail("C:\\Users\\runneradmin\\AppData\\Local\\nvim-data\\log", {
    //   // separator: "\n",
    //   fromBeginning: true,
    // });
    tail.on("line", function (data: string) {
      console.log(data);
    });
    tail.on("error", function (error) {
      console.log("ERROR: ", error);
    });
    console.log("tail started done");

    await delay(20000);

    nvim_process.kill("SIGTERM");
    console.log(`killed: ${nvim_process.killed}`);

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
    code = 0; // success
  } catch (err) {
    console.error("Test run threw exception:");
    console.error(err);
  }
  console.log(`Returned code: ${code}`);
  process.exit(code);
}
