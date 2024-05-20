vim.cmd('source /Users/runner/BufOnly.vim/plugin/BufOnly.vim')

vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/Users/runner/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. '/Users/runner/work/cursorless/cursorless/dist/cursorless.nvim'

require('talon').setup()
require('cursorless').setup()
