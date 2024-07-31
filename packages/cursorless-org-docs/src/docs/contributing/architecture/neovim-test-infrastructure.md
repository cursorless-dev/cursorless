# Neovim test infrastructure

We'll start with a high-level overview of the architecture of the Cursorless tests for neovim, and then we'll dive into the details.

## Neovim tests

Here is the call path when running Neovim tests locally. Note that `->` indicates one file calling another file:

```
launch.json -> .vscode/tasks.json -> nvim -u init.lua

init.lua
  -> CursorlessLoadExtension()
  -> TestHarnessRun() -> run() -> runAllTests() -> Mocha -> packages/cursorless-neovim-e2e/src/suite/recorded.neovim.test.ts
```

And here is the call path when running Neovim tests on CI:

```
.github/workflows/test.yml -> packages/test-harness/package.json -> my-ts-node src/scripts/runNeovimTestsCI.ts -> packages/test-harness/src/launchNeovimAndRunTests.ts

launchNeovimAndRunTests.ts
  -> copies packages/test-harness/src/config/init.lua to default nvim config folder
  -> nvim --headless
  -> read Cursorless logs to determine success or failure

packages/test-harness/src/config/init.lua
  -> CursorlessLoadExtension()
  -> TestHarnessRun() -> run() -> runAllTests() -> Mocha + packages/cursorless-neovim-e2e/src/suite/recorded.neovim.test.ts
```

### Running Neovim tests locally

This is supported on Windows, Linux and OSX.

It starts by running the `Neovim: Test` launch config from `.vscode/launch.json`. This dictates VSCode to attach to the `node` process that is spawned by `nvim` (more on this later). Note that it will only attach when the dependencies have been solved, which is indicated by the `"Neovim: Build extension and tests"` task:

```json
    {
      "name": "Neovim: Test",
      "request": "attach",
      "continueOnAttach": true,
      "skipFiles": ["<node_internals>/**"],
      "preLaunchTask": "Neovim: Build extension and tests",
      "type": "node"
    },
```

This effectively runs a series of dependency tasks from `.vscode/tasks.json`:

```json
    {
      "label": "Neovim: Build extension and tests",
      "dependsOn": [
        "Neovim: Launch neovim (test)",
        "Neovim: ESBuild",
        "Neovim: Populate dist",
        "TSBuild",
        "Build test harness",
        "Neovim: Show logs"
      ],
      "group": "build"
    },
```

Most of the tasks deal with building the Cursorless code except `"Neovim: Launch neovim (test)"` and `"Neovim: Show logs"` which are self explanatory.

The `Neovim: Launch neovim (test)` task effectively starts `nvim` as a detached process. It is important because it means VSCode won't wait for `nvim` to exit before considering the task as finished. For example, for Windows it executes the `debug-neovim.bat` script :

```json
    {
      "label": "Neovim: Launch neovim (test)",
      "type": "process",
      "windows": {
        "command": "powershell",
        "args": [
          "(New-Object -ComObject WScript.Shell).Run(\"\"\"${workspaceFolder}/packages/cursorless-neovim/scripts/debug-neovim.bat\"\"\", 1, $false)"
        ]
      },
      ...
      "options": {
        "env": {
          "CURSORLESS_REPO_ROOT": "${workspaceFolder}",
          "NVIM_NODE_HOST_DEBUG": "1",
          "NVIM_NODE_LOG_FILE": "${workspaceFolder}/packages/cursorless-neovim/out/nvim_node.log",
          "NVIM_NODE_LOG_LEVEL": "info",
          "CURSORLESS_MODE": "test"
        }
      }
```

This ends up passing the `init.lua` script as the default config file (`-u`):

```bat
nvim -u %CURSORLESS_REPO_ROOT%/init.lua
```

This `init.lua` adds the local `cursorless.nvim` relative path to the runtime path and initializes Cursorless:

```lua
local repo_root = os.getenv("CURSORLESS_REPO_ROOT")
if not repo_root then
  error("CURSORLESS_REPO_ROOT is not set. Run via debug-neovim.sh script.")
end
vim.opt.runtimepath:append(repo_root .. "/cursorless.nvim")
...
require("cursorless").setup()
```

NOTE: this relies on having symlinks inside `cursorless.nvim/node/` to point to the development paths `packages/cursorless-neovim` and `packages/test-harness`. This is required in order to have all the symbols loaded for debugging.

This ends up calling `setup()` from `cursorless.nvim/lua/cursorless/init.lua`:

```lua
local function setup(user_config)
  ...
  register_functions()
  load_extensions()
```

First, it calls `register_functions()` to expose the node functions `CursorlessLoadExtension()` and `TestHarnessRun()` into the vim namespace. A side effect is that the `nvim` process loads the `node` process:

```lua
local function register_functions()
  ...
  vim.fn["remote#host#RegisterPlugin"](
    "node",
    path .. "/node/cursorless-neovim/",
    {
      {
        type = "function",
        name = "CursorlessLoadExtension",
        sync = false,
        opts = vim.empty_dict(),
      },
    }
  )
  vim.fn["remote#host#RegisterPlugin"]("node", path .. "/node/test-harness/", {
    {
      type = "function",
      name = "TestHarnessRun",
      sync = false,
      opts = vim.empty_dict(),
    },
  })
```

Then, it calls `load_extensions()`. This calls the vim functions in order to load the Cursorless neovim plugin (`CursorlessLoadExtension()`) and start the tests (`TestHarnessRun()`) which ends up calling the previously registered node functions.

```lua
local function load_extensions()
  vim.fn.CursorlessLoadExtension()

  if os.getenv("CURSORLESS_MODE") == "test" then
    -- make sure cursorless is loaded before starting the tests
    vim.uv.sleep(1000)
    vim.fn.TestHarnessRun()
```

However, because `nvim` was started with `"NVIM_NODE_HOST_DEBUG": "1"`, when `node` is spawned, `node` will hang and wait for a debugger to attach (`--inspect-brk`). Consequently, `nvim` won't finish loading yet (i.e. it won't finish loading `init.lua`).

This is handy because it allows VSCode to finish all the tasks required for building the Cursorless neovim plugin (`cursorless-neovim`) and the Tests neovim plugin (`test-harness`), which will finally trigger VSCode to attach to the `node` process.

When VSCode attaches to the `node` process, `CursorlessLoadExtension()` is called to load the Cursorles neovim plugin and `TestHarnessRun()` is called to start the tests.

This ends up calling `TestHarnessRun()` from `packages/test-harness/src/index.ts` which calls `run()`:

```ts
export default function entry(plugin: NvimPlugin) {
  plugin.registerFunction("TestHarnessRun", () => run(plugin), {
    sync: false,
  });
}

export async function run(plugin: NvimPlugin): Promise<void> {
  ...
    await runAllTests(TestType.neovim, TestType.unit);
    console.log(`==== TESTS FINISHED: code: ${code}`);
```

This ends up calling `runAllTests()` which calls `runTestsInDir()` from `packages/test-harness/src/runAllTests.ts`.

This ends up using the [Mocha API](https://mochajs.org/) to execute tests which names end with `neovim.test.cjs` (Cursorless tests for neovim) and `test.cjs` (Cursorless unit tests):

```ts
async function runTestsInDir(
  testRoot: string,
  filterFiles: (files: string[]) => string[],
): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ...
  });
  ...
  try {
    // Run the mocha test
    await new Promise<void>((c, e) => {
      mocha.run((failures) => {
  ...
```

Consequently, the recorded tests from `data/fixtures/recorded/` are executed when `packages/cursorless-neovim-e2e/src/suite/recorded.neovim.test.ts` is invoked.

### Running Neovim tests on CI

This is supported on Linux only.

It starts from `.github/workflows/test.yml` which currently only tests the latest stable neovim version on Linux:

```yml
run: xvfb-run -a pnpm -F @cursorless/test-harness test:neovim
if: runner.os == 'Linux' && matrix.app_version == 'stable'
```

This triggers the script in `packages/test-harness/package.json`:

```json
"test:neovim": "env CURSORLESS_MODE=test my-ts-node src/scripts/runNeovimTestsCI.ts",
```

This ends up calling the default function from `package/test-harness/src/scripts/runNeovimTestsCI.ts` which calls `launchNeovimAndRunTests()` from `packages/test-harness/src/launchNeovimAndRunTests.ts`:

```ts
(async () => {
  // Note that we run all extension tests, including unit tests, in neovim, even though
  // unit tests could be run separately.
  await launchNeovimAndRunTests();
})();
```

This ends up copying the `packages/test-harness/src/config/init.lua` file into the default nvim config folder `(A)`, starting neovim without a GUI (`--headless`) `(B)` and reading Cursorless logs in order to determine success or failure `(C)`:

```ts
export async function launchNeovimAndRunTests() {
  ...
    copyFile(initLuaFile, `${nvimFolder}/init.lua`, (err: any) => { // (A)
      if (err) {
        console.error(err);
      }
    });
    ...
    const subprocess = cp.spawn(cli, [`--headless`], { // (B)
      env: {
        ...process.env,
        ["NVIM_NODE_LOG_FILE"]: logName,
        ["NVIM_NODE_LOG_LEVEL"]: "info", // default for testing
        ["CURSORLESS_MODE"]: "test",
      },
    });
    ...
      tailTest = new Tail(logName, { // (C)
        fromBeginning: true,
      });
    ...
    tailTest.on("line", function (data: string) {
      console.log(`neovim test: ${data}`);
      if (data.includes("==== TESTS FINISHED:")) {
        done = true;
        console.log(`done: ${done}`);
```

At this stage, we are in a similar situation to the "Cursorless tests for neovim locally" case where `nvim` is started with the `packages/test-harness/src/config/init.lua` config file. Similarly, this `init.lua` adds the local `cursorless.nvim` relative path to the runtime path and initializes Cursorless:

```lua
local repo_root = os.getenv("CURSORLESS_REPO_ROOT")
...
vim.opt.runtimepath:append(repo_root .. "/dist/cursorless.nvim")
...
require("cursorless").setup()
```

This ends up calling `setup()` from `dist/cursorless.nvim/lua/cursorless/init.lua`, which ends up triggering `TestHarnessRun()` and finally the recorded tests from `recorded.neovim.test.ts` using the Mocha API.

NOTE: Because `NVIM_NODE_HOST_DEBUG` is not set on CI, `nvim` loads entirely right away and tests are executed.

NOTE: CI uses `dist/cursorless.nvim/` (and not `cursorless.nvim/`), since the symlinks in `cursorless.nvim/` are only created locally in order to get symbols loaded, which we don't need on CI.

## Lua unit tests

This is supported on Linux only, both locally and on CI.

Here is the call path when running lua unit tests locally. Note that `->` indicates one file calling another file:

```
launch.json -> .vscode/tasks.json -> cd cursorless.nvim && busted --run unit
cursorless.nvim/.busted
  -> lua interpreter: cursorless.nvim/test/nvim-shim.sh -> nvim -l <spec_script>
  -> test specification files: cursorless.nvim/test/unit/*_spec.lua
```

And here is the call path when running lua unit tests on CI:

```
.github/workflows/test.yml -> .github/actions/test-neovim-lua/action.yml -> cd cursorless.nvim && busted --run unit
cursorless.nvim/.busted
  -> lua interpreter: cursorless.nvim/test/nvim-shim.sh -> nvim -l <spec_script>
  -> test specification files: cursorless.nvim/test/unit/*_spec.lua
```

### Running lua unit tests

Many of the cursorless.nvim lua functions are run in order to complete Cursorless actions and so are already
indirectly tested by the tests described in the [previous section](#3-cursorless-tests-for-neovim). Nevertheless, we run
more specific unit tests in order to give better visibility into exactly which functions are failing.
The [busted](https://github.com/lunarmodules/busted) framework is used to test lua functions defined in cursorless.nvim.
This relies on a `cursorless.nvim/.busted` file which directs busted to use a lua interpreter and test specifications files:

```bash
return {
    _all = {
        lua = './test/nvim-shim.sh'
    },
    unit = {
        ROOT = {'./test/unit/'},
    },
}
```

The `.busted` file declares the `cursorless.nvim/test/nvim-shim.sh` shell wrapper as its lua interpreter. This script sets up an enclosed neovim environment by using [XDG Base
Directory](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html) environment variables (Linux
only) pointing to a temp directory. This allows loading cursorless.nvim, any helpers and (optional) plugins needed to run
the tests. Consequently, the cursorless.nvim lua functions are exposed to the tests. Afterwards, the shim will use `nvim -l <spec_script>` for each of the [lua test specifications scripts](https://neovim.io/doc/user/starting.html#-l).
The `.busted` file declares that test specifications files are in
`cursorless.nvim/test/unit/`. Any file in that folder ending with `_spec.lua` contains tests and will be executed
by neovim's lua interpreter.
NOTE: Different tests rely on
the same custom test helper functions. These functions are exposed as globals in a file called `helpers.lua` placed in `nvim/plugin/` inside the isolated XDG environment. These helpers themselves also have their own unit tests that will be run by busted.
This busted setup was inspired by this [blog
post](https://hiphish.github.io/blog/2024/01/29/testing-neovim-plugins-with-busted/), which goes into greater detail.
