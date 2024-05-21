import * as cp from "child_process";
import process from "node:process";
import { userInfo } from "os";
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
  console.error(
    "CED: launchNeovimAndRunTests() (error to simulate always logging even if logging level is set to error)",
  );
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
    // nvim-qt.exe does not allow logging into file using -V
    //cli = cli.replace("nvim.exe", "nvim-qt.exe");

    let nvimFolder = "";
    let initLuaFile = "";
    if (process.platform === "win32") {
      if (userInfo().username === "Cedric") {
        nvimFolder = "C:/Users/Cedric/AppData/Local/nvim/";
        initLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init_ced.lua`;
      } else {
        nvimFolder = "C:/Users/runneradmin/AppData/Local/nvim/";
        initLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init_win.lua`;
      }
    } else if (process.platform === "linux") {
      //XXX: ~/.config/nvim/ does not work?
      nvimFolder = "/home/runner/.config/nvim/";
      initLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init_linux.lua`;
    } else if (process.platform === "darwin") {
      nvimFolder = "/Users/runner/.config/nvim/";
      initLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init_mac.lua`;
    } else {
      console.error(`Unsupported platform: ${process.platform}`);
      process.exit(1);
    }

    console.log(`cli: ${cli}`);

    mkdirSync(`${nvimFolder}/lua`, { recursive: true });

    //xxx On Windows: commenting for now to avoid loading any config since nvim hangs anyway atm
    copyFile(
      //`${getCursorlessRepoRoot()}\\packages\\test-harness\\src\\config\\init.lua`,
      // `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init.lua`,
      initLuaFile,
      //"C:\\Users\\runneradmin\\AppData\\Local\\nvim\\init.lua",
      // "/home/runner/.config/nvim/lua/init.lua",
      `${nvimFolder}/lua/init.lua`,
      (err: any) => {
        if (err) {
          console.error(err);
        }
      },
    );
    console.log("init.lua copying done");

    copyFile(
      `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init.vim`,
      `${nvimFolder}/init.vim`,
      (err: any) => {
        if (err) {
          console.error(err);
        }
      },
    );
    console.log("init.vim copying done");

    console.log("listing nvim/:");
    readdirSync(nvimFolder).forEach((file) => {
      console.log(`\t${file}`);
    });

    console.log("listing nvim/lua:");
    readdirSync(`${nvimFolder}/lua/`).forEach((file) => {
      console.log(`\t${file}`);
    });

    const logName = `${getCursorlessRepoRoot()}/packages/cursorless-neovim/out/nvim_node.log`;
    const vimLogName = `vim.log`;

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
      env: {
        ...process.env,
        // "NVIM_NODE_HOST_DEBUG": "1",
        NVIM_NODE_LOG_FILE: logName,
        NVIM_NODE_LOG_LEVEL: "debug",
        CURSORLESS_MODE: "test",
      },
    });
    console.log(`status: ${status}`);
    console.log(`signal: ${signal}`);
    console.log(`error: ${error}`);

    console.log(`Exiting early`);
    process.exit(0);
*/

    const waitLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/wait.lua`;
    // const nvim_process = cp.spawn(cli, [`-V25${vimLogName}`], {
    // XXX - this works and avoids hanging on CI but we can't see the nvim logs
    const nvim_process = cp.spawn(cli, [`--headless`], {
      // XXX = testing -Es locally seems to exit nvim after running the script and it exits too fast so won't work on CI either
      // "C:\Program Files\Neovim\bin\nvim.exe" -Es -u C:\path\to\cursorless\packages\test-harness\src\config\init_ced.lua
      // const nvim_process = cp.spawn(cli, [`-Es`], {
      env: {
        ...process.env,
        // "NVIM_NODE_HOST_DEBUG": "1",
        NVIM_NODE_LOG_FILE: logName,
        NVIM_NODE_LOG_LEVEL: "debug", // print max
        // NVIM_NODE_LOG_LEVEL: "info", // print average
        //NVIM_NODE_LOG_LEVEL: "error", // print less hoping it won't hang but not working yet
        CURSORLESS_MODE: "test",
      },
    });
    console.log("nvim started done");

    // do not wait for nvim to exit to avoid any blocking
    //nvim_process.unref();

    console.log(`pid: ${nvim_process.pid}`);

    await delay(5000);

    console.log("listing cursorless-neovim/out/:");
    readdirSync(
      `${getCursorlessRepoRoot()}/packages/cursorless-neovim/out/`,
    ).forEach((file) => {
      console.log(`\t${file}`);
    });

    /*
    // XXX - we can't use that if we use --headless above
    const tailVim = new Tail(vimLogName, {
      // separator: "\n",
      fromBeginning: true,
    });
    tailVim.on("line", function (data: string) {
      console.log(`vim startup: ${data}`);
    });
    tailVim.on("error", function (error) {
      console.log("vim startup: ERROR: ", error);
    });
    console.log("tail vim startup started");
    */

    await delay(10000);

    // read log file live and print to console
    // https://stackoverflow.com/questions/26788504/using-node-js-to-read-a-live-file-line-by-line
    const tailTest = new Tail(logName, {
      // separator: "\n",
      fromBeginning: true,
    });
    tailTest.on("line", function (data: string) {
      console.log(`neovim test: ${data}`);
    });
    tailTest.on("error", function (error) {
      console.log("neovim test: ERROR: ", error);
    });
    console.log("tail neovim test started");

    await delay(60000);

    nvim_process.kill("SIGTERM");
    console.log(`killed: ${nvim_process.killed}`);

    //await delay(10000);

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
