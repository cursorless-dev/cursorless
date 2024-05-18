import * as cp from "child_process";
// import * as path from "path";
// import * as os from "os";
import { exists, readdirSync, mkdirSync, unlinkSync, copyFile } from "fs";
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
    const cli = getEnvironmentVariableStrict("APP_PATH");
    // Installed executable: C:\Users\runneradmin\nvim-stable\bin\nvim.exe
    // nvim-qt.exe does not allow logging into file using -V9
    //cli = cli.replace("nvim.exe", "nvim-qt.exe");
    /*
      node:events:496
            throw er; // Unhandled 'error' event
            ^
      Error: spawn C:\Users\runneradmin\nvim-stable\bin\nvim-qt.exe ENOENT
          at ChildProcess._handle.onexit (node:internal/child_process:286:19)
          at onErrorNT (node:internal/child_process:484:16)
          at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
      Emitted 'error' event on ChildProcess instance at:
          at ChildProcess._handle.onexit (node:internal/child_process:292:12)
          at onErrorNT (node:internal/child_process:484:16)
          at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
        errno: -4058,
        code: 'ENOENT',
        syscall: 'spawn C:\\Users\\runneradmin\\nvim-stable\\bin\\nvim-qt.exe',
        path: 'C:\\Users\\runneradmin\\nvim-stable\\bin\\nvim-qt.exe',
        spawnargs: []
      }
      Node.js v20.12.1
    */

    console.log(`cli: ${cli}`);

    mkdirSync('/home/runner/.config/nvim/lua', { recursive: true });
    
    //~/.config/nvim/init.lua?
    // C:\Users\runneradmin\AppData\Local\nvim\init.lua
    // C:\Users\runneradmin\AppData\Local\nvim-data\lazy\{cursorless.nvim,lazy.nvim,talon.nvim}
    // C:\Users\runneradmin\AppData\Local\nvim-data\log
    //xxx commenting for now to avoid loading any config since nvim hangs anyway atm
    copyFile(
      //`${getCursorlessRepoRoot()}\\packages\\test-harness\\src\\config\\init.lua`,
      `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init.lua`,
      //"C:\\Users\\runneradmin\\AppData\\Local\\nvim\\init.lua",
      "/home/runner/.config/nvim/lua/init.lua",
      (err: any) => {
        if (err) {
          console.error(err);
        }
      },
    );
    console.log("init.lua copying done");
    
    copyFile(
      `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init.vim`,
      "/home/runner/.config/nvim/init.vim",
      (err: any) => {
        if (err) {
          console.error(err);
        }
      },
    );
    console.log("init.vim copying done");

    readdirSync("/home/runner/.config/nvim/").forEach((file) => {
      console.log(file);
    });
    console.log("listing /home/runner/.config/nvim/ dir done");
    
    readdirSync("/home/runner/.config/nvim/lua/").forEach((file) => {
      console.log(file);
    });
    console.log("listing /home/runner/.config/nvim/lua/ dir done");

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

    // testing normal nvim startup
    //https://stackoverflow.com/questions/3025615/is-there-a-vim-runtime-log
    /*
    const { status, signal, error } = cp.spawnSync(cli, [`-V9`], {
      encoding: "utf-8",
      stdio: "inherit",
    });
    console.log(`status: ${status}`);
    console.log(`signal: ${signal}`);
    console.log(`error: ${error}`);

    console.log(`Exiting early`);
    process.exit(0);
*/
    
    const nvim_process = cp.spawn(cli, [], {
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

    readdirSync(`${getCursorlessRepoRoot()}/packages/cursorless-neovim/out/`).forEach((file) => {
      console.log(file);
    });
    console.log("listing out/ dir done");

    // read log file live and print to console
    // https://stackoverflow.com/questions/26788504/using-node-js-to-read-a-live-file-line-by-line
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

    tail.on("line", function (data: string) {
      console.log(data);
    });
    tail.on("error", function (error) {
      console.log("ERROR: ", error);
    });
    console.log("tail started done");

    await delay(200000);

    nvim_process.kill("SIGTERM");
    console.log(`killed: ${nvim_process.killed}`);

    await delay(10000);

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
