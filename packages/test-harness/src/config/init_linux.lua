vim.cmd('source /home/runner/BufOnly.vim/plugin/BufOnly.vim')

vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. '/home/runner/work/cursorless/cursorless/dist/cursorless.nvim'

require('talon').setup()
require('cursorless').setup()
