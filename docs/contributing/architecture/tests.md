# Tests

Tests are critical to Cursorless. Our tests fall broadly into a three categories:

- **Recorded tests** are end-to-end / subcutaneous tests that run a full Cursorless command and check that the ide ends up in the correct state. These represent the bulk of our tests, and are generated automatically using the [test case recorder](../test-case-recorder.md)
- **Scope tests** check that cursorless scopes are defined correctly for all languages that support the given scope. They consist of a small test document followed by `---`, and then a snapshot of the expected scopes in the given document. They are generated automatically using our scope test recorder, as described in [scope test recorder](../adding-a-new-scope.md#4-add-tests-for-the-given-scope)
- **Other tests** include unit tests, handwritten subcutaneous / end-to-end tests, etc

We run the above tests in various contexts, both locally and in CI. The contexts are:

- **VSCode**: Today, many of our tests must run within a VSCode context. For some of our tests, this is desirable, because they are designed to test that our code works in VSCode. However, many of our tests (such as scope tests and recorded tests) are not really VSCode-specific, but we haven't yet built the machinery to run them in a more isolated context, which would be much faster.
- **Unit tests**: Many of our tests can run in a neutral context, without requiring an actual ide with editors, etc. Most of these are unit tests in the traditional sense of the word, testing the logic of a small unit of code, such as a function.
- **Talon**: For each of our recorded tests, we test that saying the spoken form of the command in Talon results in the command payload that we expect. Note that these tests can only be run locally today.
- **Neovim**: We run a subset of our recorded tests within Neovim to ensure that the given subset of Cursorless works within Neovim. We also have a few lua unit tests that must be run in Neovim. These test the lua functions that Cursorless needs in order to interact with Neovim.

You can get an overview of the available tests by looking at our VSCode launch configs, which include not only our VSCode tests, but all of our tests.

This document focuses on the infrastructure that allows us to run our tests in the above contexts, both locally and in CI.

## VSCode

XXX

## Unit tests

XXX

## Talon

XXX

## Neovim

We'll start with a high-level overview of the architecture of the Cursorless tests for neovim, and then we'll dive into the details. Here is the call path when running Neovim tests locally. Note that `->` indicates one file calling another file:

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

### Lua unit tests

XXX
