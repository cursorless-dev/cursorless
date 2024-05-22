import * as cp from "child_process";
import process from "node:process";
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
 *
 * Current working directory:
 *  - Windows: D:\a\cursorless\cursorless
 *  - Linux: /home/runner/work/cursorless/cursorless
 *  - OS X: /Users/runner/work/cursorless/cursorless
 */
export async function launchNeovimAndRunTests() {
  let code = 1; // failure
  try {
    const crashDir = getEnvironmentVariableStrict("VSCODE_CRASH_DIR");
    const logsDir = getEnvironmentVariableStrict("VSCODE_LOGS_DIR");
    const useLegacyVscode =
      getEnvironmentVariableStrict("APP_VERSION") === "legacy";

    // NB: We include the exact version here instead of in `test.yml` so that
    // we don't have to update the branch protection rules every time we bump
    // the legacy VSCode version.
    //const neovimVersion = useLegacyVscode ? "v0.9.5" : "stable";
    // const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
    // const [cli, ...args] =
    //   resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
    const cli = getEnvironmentVariableStrict("APP_PATH");
    // Installed executable: C:\Users\runneradmin\nvim-stable\bin\nvim.exe
    // nvim-qt.exe does not allow logging into file using -V
    // XXX - try using nvim-qt.exe on Windows but --headless may not work then?
    //cli = cli.replace("nvim.exe", "nvim-qt.exe");

    let nvimFolder = "";
    const initLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/init.lua`;
    if (process.platform === "win32") {
      nvimFolder = "C:/Users/runneradmin/AppData/Local/nvim/";
    } else if (process.platform === "linux") {
      nvimFolder = "/home/runner/.config/nvim/";
    } else if (process.platform === "darwin") {
      nvimFolder = "/Users/runner/.config/nvim/";
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

    // if (process.platform === "darwin" || process.platform === "win32") {
    if (process.platform === "win32") {
      // const { status, signal, error } = cp.spawnSync(cli, [`-V9`], {
      const { status, signal, error } = cp.spawnSync(cli, [`-V25`], {
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
    }

    const waitLuaFile = `${getCursorlessRepoRoot()}/packages/test-harness/src/config/wait.lua`;
    // const subprocess = cp.spawn(cli, [`-V25${vimLogName}`], {
    // https://neovim.io/doc/user/starting.html#--headless
    // XXX - this works and avoids hanging on CI but we can't see the nvim logs
    const subprocess = cp.spawn(cli, [`--headless`], {
      // xxx on CI, this does not work and does not show any of the vim logs
      // stdio: "inherit",
      // shell: true,
      // XXX = testing -Es locally seems to exit nvim after running the script and it exits too fast so won't work on CI either
      // "C:\Program Files\Neovim\bin\nvim.exe" -Es -u C:\path\to\cursorless\packages\test-harness\src\config\init_ced.lua
      // const subprocess = cp.spawn(cli, [`-Es`], {
      env: {
        ...process.env,
        // "NVIM_NODE_HOST_DEBUG": "1",
        NVIM_NODE_LOG_FILE: logName,
        // NVIM_NODE_LOG_LEVEL: "debug", // for debugging
        NVIM_NODE_LOG_LEVEL: "info", // default for testing
        //NVIM_NODE_LOG_LEVEL: "error", // print less hoping it won't hang but not working yet
        CURSORLESS_MODE: "test",
      },
    });
    console.log("nvim started done");

    // do not wait for nvim to exit to avoid any blocking
    subprocess.unref();

    console.log(`pid: ${subprocess.pid}`);

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
    let done = false;
    const tailTest = new Tail(logName, {
      // separator: "\n",
      fromBeginning: true,
    });
    tailTest.on("line", function (data: string) {
      console.log(`neovim test: ${data}`);
      if (data.includes("==== TESTS FINISHED:")) {
        done = true;
        console.log(`done: ${done}`);
        const found = data.match(/.*==== TESTS FINISHED: code: (\d+).*/);
        console.log(`found: ${found}`);
        if (found !== null) {
          code = parseInt(found[1]);
          console.log(`code: ${code}`);
        }
      }
    });
    tailTest.on("error", function (error) {
      console.log("neovim test: ERROR: ", error);
      if (error.includes("==== TESTS FINISHED:")) {
        done = true;
        console.log(`done: ${done}`);
      }
    });
    console.log("tail neovim test started");

    console.log("waiting for tests to finish ...");
    let count = 0;
    const stepSeconds = 10;
    while (true) {
      count += stepSeconds;
      await delay(stepSeconds * 1000);
      if (done) {
        console.log("done here, exiting loop");
        break;
      }
      // exit if tests take more than 5 minutes
      if (count > 5 * 60) {
        console.log("timeout, exiting loop");
        break;
      }
    }

    // XXX - code to replace above code, needs more testing
    // code from packages\cursorless-vscode\src\scripts\initLaunchSandbox.ts
    // await new Promise<void>((resolve, reject) => {
    //   subprocess.on("error", reject);
    //   subprocess.on("exit", (code) => {
    //     console.log(`exit: Process returned code ${code}`);
    //     if (code === 0) {
    //       resolve();
    //     } else {
    //       reject(new Error(`Process returned code ${code}`));
    //     }
    //   });
    // });
    console.log("tests finished");

    subprocess.kill("SIGTERM");
    console.log(`killed: ${subprocess.killed}`);

    tailTest.unwatch();

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
    //code = 0; // success
  } catch (err) {
    console.error("Test run threw exception:");
    console.error(err);
    code = 2;
  }
  console.log(`Returned code: ${code}`);
  process.exit(code);
}
