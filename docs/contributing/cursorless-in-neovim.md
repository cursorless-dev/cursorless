# Initial setup

Install all the common prerequisites. See [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Build the VSCode Cursorless extension
2. Run the VSCode Cursorless extension tests

Install all the neovim prerequisites. See [cursorless.nvim](https://github.com/hands-free-vim/cursorless.nvim/tree/main#prerequisites).

3. Install the production cursorless.nvim and its dependencies
4. Confirm production cursorless.nvim is working in neovim

Point your neovim configuration to use manually built plugin instead. You might have to locate where your neovim configuration are.

5. Change the cursorless.nvim being used by your neovim configuration

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
vim.o.runtimepath = vim.o.runtimepath .. "," .. "C:\\path\\to\\cursorless\\cursorless.nvim"
```

6. Create symlinks for the node generated plugins:

On Windows:

```
mklink /D C:\path\to\cursorless\cursorless.nvim\node\cursorless-neovim C:\path\to\cursorless\packages\cursorless-neovim
mklink /D C:\path\to\cursorless\cursorless.nvim\node\test-harness C:\path\to\cursorless\packages\test-harness
```

7. Add nvim executable path to your PATH

On Windows, open the Control Panel, navigate to `User Accounts > User Accounts`. Click on `Change my environment variables`. In the `User variables`, e.g. add the entry `C:\Program Files\Neovim\bin` to your `Path`.

# Running / testing extension locally

In order to test out your local version of the extension or to run unit tests locally, you need to run the extension in debug mode. To do so you need to run the `workbench.action.debug.selectandstart` command in VSCode and then select either "Run neovim extension" or "Run neovim extension tests".

The debug logs are written in `C:\path\to\cursorless\packages\cursorless-neovim\out\nvim_node.log`.

NOTE: This will spawn a standalone nvim instance that is independent of VSCode. Consequently after you're done debugging, you need to close nvim.
