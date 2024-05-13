<!-- vim-markdown-toc GFM -->

- [cursorless.nvim](#cursorlessnvim)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Lazy installation](#lazy-installation)
    - [Manual installation](#manual-installation)
  - [Configuration](#configuration)
    - [neovim configuration](#neovim-configuration)
    - [Talon configuration](#talon-configuration)
  - [Frequently asked questions](#frequently-asked-questions)
    - [nvim does not support Lazy?](#nvim-does-not-support-lazy)
    - [nvim does not find the `neovim` globally installed package?](#nvim-does-not-find-the-neovim-globally-installed-package)

<!-- vim-markdown-toc -->

# cursorless.nvim

Neovim plugin to support Cursorless

## Prerequisites

- neovim: https://neovim.io/
- Talon voice: https://talonvoice.com/
- neovim-talon: https://github.com/hands-free-vim/neovim-talon
- node: https://nodejs.org/en
- npm (generally part of node installation)
- neovim node package: https://github.com/neovim/node-client (globally installed with `npm`)
- (Optional) talon.nvim: https://github.com/hands-free-vim/talon.nvim

## Installation

Ideally, you want to use a neovim plugin manager like [lazy.nvim](https://github.com/folke/lazy.nvim).

### Lazy installation

After the typical [lazy setup](https://github.com/folke/lazy.nvim?tab=readme-ov-file#-installation), you'll have to add the `talon.nvim` plugin to your `init.lua`. We also recommend the following other plugins for the best experience.

```lua
require('lazy').setup({
  -- Git related plugins
  'tpope/vim-fugitive',

  -- Optional: talon.nvim for best experience with neovim-talon
  'hands-free-vim/talon.nvim',

  'hands-free-vim/cursorless.nvim',

  -- dependencies useful for neovim-talon
  'dhruvasagar/vim-zoom',
  'gcmt/taboo.vim',
  'vim-scripts/BufOnly.vim'
})
```

### Manual installation

This method is not recommended but you can try directly cloning the plugin into your nvim data folder:

```
git clone  https://github.com/hands-free-vim/cursorless.nvim
cd cursorless.nvim
```

## Configuration

### neovim configuration

If you aren't using a plugin manager that automatically calls setup for you (e.g. it is needed for lazy), you will need this somewhere in your neovim config, e.g. in [init.lua](https://neovim.io/doc/user/lua-guide.html#lua-guide-config):

```lua
  -- Optional: if you are also using talon.nvim
require("talon").setup()
-- The actual Cursorless initialization
require("cursorless").setup()
```

### Talon configuration

Add a `.talon` file like the following anywhere in your Talon user directory (e.g. named `cursorless_neovim.talon`):

```talon
app: neovim
-
tag(): user.cursorless
```

## Frequently asked questions

### nvim does not support Lazy?

Some Linux package managers ship with a version of `nvim` too old for Lazy. If this is the case, [install nvim](https://github.com/neovim/neovim/blob/master/INSTALL.md) via another method.

### nvim does not find the `neovim` globally installed package?

If you are on Linux, avoid using the snap package for `npm` as it may not be able to globally expose the neovim npm package due to sandboxing. If this is the case, install node via another method (nvm, brew, etc).
