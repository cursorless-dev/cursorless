<!-- vim-markdown-toc GFM -->

- [cursorless.nvim](#cursorlessnvim)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [1. Install Cursorless neovim plugin](#1-install-cursorless-neovim-plugin)
      - [Option A: Lazy installation](#option-a-lazy-installation)
      - [Option B: Manual installation](#option-b-manual-installation)
    - [2. Tell neovim to run the plugin](#2-tell-neovim-to-run-the-plugin)
    - [3. Activate Cursorless commands in Talon](#3-activate-cursorless-commands-in-talon)
  - [Configuration](#configuration)
    - [Keyboard shortcut](#keyboard-shortcut)
    - [Absolute row numbers](#absolute-row-numbers)
  - [Frequently asked questions](#frequently-asked-questions)
    - [nvim does not support Lazy?](#nvim-does-not-support-lazy)
    - [nvim does not find the `neovim` globally installed package?](#nvim-does-not-find-the-neovim-globally-installed-package)
  - [Contributors](#contributors)

<!-- vim-markdown-toc -->

# cursorless.nvim

Very experimental Neovim plugin providing partial Cursorless support. We support much of the core functionality, but many features are not yet implemented, in particular hats ([#2567](https://github.com/cursorless-dev/cursorless/issues/2567)) and language-specific scopes ([#2568](https://github.com/cursorless-dev/cursorless/issues/2568)). Expect some rough edges, but please give it a try, and if you like it, consider [contributing](https://www.cursorless.org/docs/contributing/cursorless-in-neovim/)!

## Prerequisites

- [neovim](https://neovim.io/) (>= v0.10.0)
- [Talon voice](https://talonvoice.com/)
- [neovim-talon](https://github.com/hands-free-vim/neovim-talon)
- [node/npm](https://nodejs.org/en)
- [neovim node package](https://github.com/neovim/node-client) (>= 5.1.0 installed globally)
- [talon.nvim](https://github.com/hands-free-vim/talon.nvim) (likely required, unless standalone neovim
  GUI (nvim-qt.exe, neovide, etc)

## Installation

### 1. Install Cursorless neovim plugin

Ideally, you want to use a neovim plugin manager like [lazy.nvim](https://github.com/folke/lazy.nvim).

#### Option A: Lazy installation

After the typical [lazy setup](https://github.com/folke/lazy.nvim?tab=readme-ov-file#-installation), you'll have to add the `cursorless.nvim` plugin to your `init.lua`.

```lua
require('lazy').setup({
  'hands-free-vim/cursorless.nvim',
})
```

#### Option B: Manual installation

This method is not recommended but you can try directly cloning the plugin into your nvim data folder:

```
git clone https://github.com/hands-free-vim/cursorless.nvim
```

### 2. Tell neovim to run the plugin

If you aren't using a plugin manager that automatically calls setup for you (e.g. it is needed for lazy), you will need this somewhere in your neovim config, e.g. in [init.lua](https://neovim.io/doc/user/lua-guide.html#lua-guide-config):

```lua
require("cursorless").setup()
```

### 3. Activate Cursorless commands in Talon

Add a `.talon` file like the following anywhere in your Talon user directory (e.g. named `cursorless_neovim.talon`):

```talon
app: neovim
-
tag(): user.cursorless
```

## Configuration

### Keyboard shortcut

By default the keyboard shortcut used to communicate with cursorless is `<C-S-f12>`, but this might not work for
everybody and is configurable. You can change it by passing a different value in the configuration options passed to
`setup()`:

```lua
require("cursorless").setup({ shortcut = `<C-Q>`})
```

_IMPORTANT_: If you change this shortcut, be sure to set the corresponding neovim-talon setting. This can be done by
having a `.talon` file somewhere in your talon user directory that contains the following:

```talon
settings():
    user.neovim_command_server_shortcut = "ctrl-q"
```

### Absolute row numbers

You MUST currently use absolute row numbers in order to target rows using cursorless. The `talon.nvim` plugin will
configure this automatically, but your own config may be overriding it. Be sure to disable relative numbers.

## Frequently asked questions

### nvim does not support Lazy?

Some Linux package managers ship with a version of `nvim` too old for Lazy. If this is the case, [install nvim](https://github.com/neovim/neovim/blob/master/INSTALL.md) via another method.

### nvim does not find the `neovim` globally installed package?

If you are on Linux, avoid using the snap package for `npm` as it may not be able to globally expose the neovim npm package due to sandboxing. If this is the case, install node via another method (nvm, brew, etc).

## Contributing

Welcome! So glad you've decided to help make Cursorless in Neovim better.

Note that Cursorless is maintained as a monorepo, hosted at [`cursorless`](https://github.com/cursorless-dev/cursorless), and the source of truth for all of the files here lives there, so that's where you'll want to file a PR. We automatically deploy from our monorepo to the [cursorless.nvim repo](https://github.com/hands-free-vim/cursorless.nvim) in CI.

See [the Cursorless neovim contributor docs](https://www.cursorless.org/docs/contributing/cursorless-in-neovim/) to get started.
