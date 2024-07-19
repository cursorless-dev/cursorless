-- This config file is used for local development and testing.
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)
require("lazy").setup({
  "hands-free-vim/talon.nvim",
  "vim-scripts/BufOnly.vim",
})

local repo_root = os.getenv("CURSORLESS_REPO_ROOT")
if not repo_root then
  error("CURSORLESS_REPO_ROOT is not set. Run via debug-neovim.sh script.")
end
vim.opt.runtimepath:append(repo_root .. "/cursorless.nvim")

require("talon").setup()
require("cursorless").setup()
