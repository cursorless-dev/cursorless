# Cursorless in Neovim

This document describes how to get set up to work on the Cursorless neovim plugin. You may also find the [Neovim API docs](https://neovim.io/doc/user/api.html) helpful to learn about Neovim extension development.

Note that Cursorless is maintained as a monorepo, hosted at [`cursorless`](https://github.com/cursorless-dev/cursorless), and the source of truth for all of the files in cursorless.nvim lives there. We automatically deploy from our monorepo to the [cursorless.nvim repo](https://github.com/hands-free-vim/cursorless.nvim) in CI.

## Initial setup

### 1. Follow the initial contributor setup guide

Follow the steps in [CONTRIBUTING.md](./CONTRIBUTING.md#initial-setup).

### 2. Get production Cursorless neovim working

Follow the installation steps in [cursorless.nvim](https://github.com/hands-free-vim/cursorless.nvim/tree/main#prerequisites).

Confirm that production cursorless.nvim is working in neovim, eg say `"take first paint"` in a non-empty document.

### 3. Add nvim executable path to your PATH

On Mac and Linux, this should be done automatically.

On Windows, open the Control Panel, navigate to `User Accounts > User Accounts`. Click on `Change my environment variables`. In the `User variables`, e.g. add the entry `C:\Program Files\Neovim\bin` to your `Path`.

### 4. (Windows only) Create symlinks for the built plugins

This step is only required on Windows if you don't run VSCode with Administrator privileges.

Open a `cmd.exe` with Administrator privileges and create the symbolic links between the source folders and the `cursorless.nvim` destination folder:

```bat
mklink /D C:\path\to\cursorless\cursorless.nvim\node\cursorless-neovim C:\path\to\cursorless\packages\cursorless-neovim
mklink /D C:\path\to\cursorless\cursorless.nvim\node\test-harness C:\path\to\cursorless\packages\test-harness
```

Note that the `C:\path\to\cursorless` path above should match your cloned cursorless repository.

## Running / testing extension locally

In order to test out your local version of the extension or to run unit tests locally, you need to run the extension in debug mode. To do so you need to do the following:

1. Open the Cursorless repository in VSCode (with your regular default profile, _**not**_ with the `cursorlessDevelopment` profile)
2. Say `"neovim log"` to open the neovim log.
3. Say `"debug neovim"` to run the extension. If you want to run the tests instead, say `"debug test neovim"`.

NOTE: This will spawn a standalone nvim instance that is independent of VSCode. Consequently after you're done debugging, you need to close nvim.

If you don't have the `cursorless-talon-dev` files in your Talon user directory as described in step 6 of [CONTRIBUTING.md](./CONTRIBUTING.md#initial-setup), then you instead need to run the `workbench.action.debug.selectandstart` command in VSCode and then select either "Neovim: Run" or "Neovim: Test".

### Running lua tests

Their are separate cursorless and lua tests. You can run the lua tests by entering the `cursorless.nvim` folder and
running: `busted --run unit`. These tests currently only work on Linux.

## Sending pull requests

The source of truth for `cursorless.nvim` lives in the [Cursorless monorepo](https://github.com/cursorless-dev/cursorless/). We automatically push to the [cursorless.nvim](https://github.com/hands-free-vim/cursorless.nvim) repo in CI. If you'd like to contribute to `cursorless.nvim`, please open a PR in the [Cursorless monorepo](https://github.com/cursorless-dev/cursorless/).

## Frequently asked questions

### init.lua: module 'cursorless' not found

The first time you build Cursorless for neovim for debugging, you might encounter this error in `nvim` when it starts:

```
Error detected while processing C:\Users\User\AppData\Local\nvim\init.lua:
E5113: Error while calling lua chunk: C:\Users\User\AppData\Local\nvim\init.lua:50: module 'cursorless' not found:
```

This is expected because `nvim` is started before Cursorless is built and the `dist/cursorless.nvim` folder does not exist yet. Consequently, close `nvim` and restart your debugging session for it to work.

If it still does not work, check that your `vim.opt.runtimepath` path point to the right folder as described in the installation instructions above.
