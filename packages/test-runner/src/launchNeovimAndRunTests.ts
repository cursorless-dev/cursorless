import * as cp from "node:child_process";
import { copyFile, mkdirSync, readdirSync } from "node:fs";
import process, { exit } from "node:process";
import { Tail } from "tail";
import { getEnvironmentVariableStrict, sleep } from "@cursorless/lib-common";
import { getCursorlessRepoRoot, isWindows } from "@cursorless/lib-node-common";

/**
 * Launches neovim, instructing it to run the test runner
 * specified in {@link extensionTestsPath}.
 * @param extensionTestsPath The path to test runner, passed to
 * `--extensionTestsPath`
 *
 * Current working & workspace directory:
 *  - Windows: D:\a\cursorless\cursorless
 *  - Linux: /home/runner/work/cursorless/cursorless
 *  - OS X: /Users/runner/work/cursorless/cursorless
 */
export async function launchNeovimAndRunTests() {
  // failure
  let code = 1;
  try {
    const cli = getEnvironmentVariableStrict("NEOVIM_PATH");

    let nvimFolder = "";
    const initLuaFile = `${getCursorlessRepoRoot()}/packages/test-runner/src/config/init.lua`;
    if (process.platform === "win32") {
      nvimFolder = "C:/Users/runneradmin/AppData/Local/nvim/";
    } else if (process.platform === "linux") {
      nvimFolder = "/home/runner/.config/nvim/";
    } else if (process.platform === "darwin") {
      nvimFolder = "/Users/runner/.config/nvim/";
    } else {
      console.error(`Unsupported platform: ${process.platform}`);
      exit(1);
    }

    console.log(`cli: ${cli}`);

    mkdirSync(nvimFolder, { recursive: true });

    copyFile(initLuaFile, `${nvimFolder}/init.lua`, (err: any) => {
      if (err) {
        console.error(err);
      }
    });
    console.log("init.lua copying done");

    console.log("listing nvim/:");
    for (const file of readdirSync(nvimFolder)) {
      console.log(`\t${file}`);
    }

    const logName = `${getCursorlessRepoRoot()}/packages/app-neovim/out/nvim_node.log`;

    // testing normal nvim startup
    //https://stackoverflow.com/questions/3025615/is-there-a-vim-runtime-log
    // if (process.platform === "darwin" || process.platform === "win32") {
    if (isWindows()) {
      // const { status, signal, error } = cp.spawnSync(cli, [`-V9`], {
      const { status, signal, error } = cp.spawnSync(cli, [`-V25`], {
        encoding: "utf8",
        stdio: "inherit",
        env: {
          ...process.env,
          // ["NVIM_NODE_HOST_DEBUG"]: "1",
          NVIM_NODE_LOG_FILE: logName,
          NVIM_NODE_LOG_LEVEL: "debug",
          CURSORLESS_MODE: "test",
        },
      });
      console.log(`status: ${status}`);
      console.log(`signal: ${signal}`);
      console.log(`error: ${error}`);

      console.log(`Exiting early`);
      exit(0);
    }

    // https://neovim.io/doc/user/starting.html#--headless
    const subprocess = cp.spawn(cli, [`--headless`], {
      env: {
        ...process.env,
        NVIM_NODE_LOG_FILE: logName,
        // default for testingu
        NVIM_NODE_LOG_LEVEL: "info",
        CURSORLESS_MODE: "test",
      },
    });
    console.log("nvim started done");

    // do not wait for nvim to exit to avoid any blocking
    subprocess.unref();

    console.log(`pid: ${subprocess.pid}`);

    // Make sure the node log file exists
    await sleep(5000);

    console.log("listing cursorless-neovim/out/:");
    const files = readdirSync(
      `${getCursorlessRepoRoot()}/packages/app-neovim/out/`,
    );
    for (const file of files) {
      console.log(`\t${file}`);
    }

    await sleep(10_000);

    // read log file live and print to console
    // https://stackoverflow.com/questions/26788504/using-node-js-to-read-a-live-file-line-by-line
    let done = false;
    let tailTest;
    try {
      tailTest = new Tail(logName, {
        fromBeginning: true,
      });
    } catch (error) {
      console.log(
        "Warning: A missing log file at nvim startup is typically the result of an invalid nvim config file",
      );
      console.log(error);
      code = 3;
      exit(code);
    }
    tailTest.on("line", (data: string) => {
      console.log(`neovim test: ${data}`);
      if (data.includes("==== TESTS FINISHED:")) {
        done = true;
        console.log(`done: ${done}`);
        const found = data.match(/.*==== TESTS FINISHED: code: (\d+).*/u);
        console.log(`found: ${found}`);
        if (found != null) {
          code = Number.parseInt(found[1], 10);
          console.log(`code: ${code}`);
        }
      }
    });
    tailTest.on("error", (error) => {
      console.log("neovim test: ERROR:", error);
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
      await sleep(stepSeconds * 1000);
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
    subprocess.kill("SIGTERM");
    console.log(`killed: ${subprocess.killed}`);

    // XXX - code to replace above code, needs more testing
    // code from packages/app-vscode/src/scripts/initLaunchSandbox.ts
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

    tailTest.unwatch();
  } catch (error) {
    console.error("Test run threw exception:");
    console.error(error);
    code = 2;
  }
  console.log(`Returned code: ${code}`);
  exit(code);
}
