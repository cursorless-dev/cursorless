-- [[ Install `lazy.nvim` plugin manager ]]
--    https://github.com/folke/lazy.nvim
--    `:help lazy.nvim.txt` for more info
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    'git',
    'clone',
    '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable', -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require('lazy').setup({
  -- production cursorless.nvim
  'hands-free-vim/cursorless.nvim',

  'vim-scripts/BufOnly.vim',
})

-- vim.o.runtimepath = vim.o.runtimepath .. "," .. "C:\\path\\cursorless\\dist\\cursorless.nvim"

require('talon').setup()
require('cursorless').setup()
