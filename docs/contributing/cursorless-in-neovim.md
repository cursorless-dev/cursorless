# Cursorless in Neovim

This document describes how to get set up to work on the Cursorless neovim plugin.

## Initial setup

### 1. Follow the initial contributor setup guide

Follow the steps in [CONTRIBUTING.md](./CONTRIBUTING.md#initial-setup).

### 2. Get production Cursorless neovim working

Follow the installation steps in [cursorless.nvim](https://github.com/hands-free-vim/cursorless.nvim/tree/main#prerequisites).

Confirm that production cursorless.nvim is working in neovim, eg say `"take first paint"` in a nonempty document.

### 3. Switch to local debug version of cursorless.nvim

You'll need to point your neovim configuration to use manually built plugin instead. You might have to locate where your neovim configuration is.

Disable the production cursorless.nvim by commenting out the line containing `'hands-free-vim/cursorless.nvim'`. Enable the debug cursorless.nvim by adding it to the runtimepath. eg:

```lua
require('lazy').setup({
  ...
  'hands-free-vim/talon.nvim',
  -- production cursorless.nvim
  -- 'hands-free-vim/cursorless.nvim',
  ...
})

-- debug cursorless.nvim
vim.opt.runtimepath:append("C:\\path\\to\\cursorless\\dist\\cursorless.nvim")
```

Note that the above path should point to the `dist/cursorless.nvim` directory in your cloned cursorless repository. It may not already exist, but will be created automatically when you first launch the extension in debug mode.

Note also that the above line must appear before the `require('cursorless').setup()` line in your neovim configuration.

### 4. Add nvim executable path to your PATH

On Mac and Linux, this should be done automatically.

On Windows, open the Control Panel, navigate to `User Accounts > User Accounts`. Click on `Change my environment variables`. In the `User variables`, e.g. add the entry `C:\Program Files\Neovim\bin` to your `Path`.

### 5. (Windows only) Create symlinks for the built plugins

This step is only required on Windows if you don't run VSCode with Administrator privileges.

Open a `cmd.exe` with Administrator privileges and create the symbolic links between the source folders and the built folder:

```bat
mkdir C:\path\to\cursorless\dist\cursorless.nvim\node
mklink /D C:\path\to\cursorless\dist\cursorless.nvim\node\cursorless-neovim C:\path\to\cursorless\packages\cursorless-neovim
mklink /D C:\path\to\cursorless\dist\cursorless.nvim\node\test-harness C:\path\to\cursorless\packages\test-harness
```

Note that the `C:\path\to\cursorless` path above should match your cloned cursorless repository.

## Running / testing extension locally

You will need to add the [BufOnly.vim](https://github.com/vim-scripts/BufOnly.vim) neovim plugin if you want to be able to run the tests locally. For instance, with lazy:

```lua
require('lazy').setup({
  'vim-scripts/BufOnly.vim'
})
```

In order to test out your local version of the extension or to run unit tests locally, you need to run the extension in debug mode. To do so you need to run the `workbench.action.debug.selectandstart` command in VSCode and then select either "Run neovim extension" or "Run neovim extension tests".

The debug logs are written in `C:\path\to\cursorless\packages\cursorless-neovim\out\nvim_node.log`.

NOTE: This will spawn a standalone nvim instance that is independent of VSCode. Consequently after you're done debugging, you need to close nvim.

## Sending pull requests

The [cursorless.nvim](https://github.com/hands-free-vim/cursorless.nvim) repo is part of the larger cursorless monorepo, and is currently part of a pending PR to that monorepo only. If you'd like to send a PR to `cursorless.nvim`, please send a PR against the `nvim-talon` branch of this [repo](https://github.com/saidelike/cursorless).

## Frequently asked questions

### init.lua: module 'cursorless' not found

The first time you build Cursorless for neovim for debugging, you might encounter this error in `nvim` when it starts:

```
Error detected while processing C:\Users\User\AppData\Local\nvim\init.lua:
E5113: Error while calling lua chunk: C:\Users\User\AppData\Local\nvim\init.lua:50: module 'cursorless' not found:
```

This is expected because `nvim` is started before Cursorless is built and the `dist/cursorless.nvim` folder does not exist yet. Consequently, close `nvim` and restart your debugging session for it to work.

If it still does not work, check that your `vim.opt.runtimepath` path point to the right folder as described in the installation instructions above.
