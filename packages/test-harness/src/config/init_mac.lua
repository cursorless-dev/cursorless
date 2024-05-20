print('CED: loading BufOnly.vim')
vim.cmd('source /Users/runner/BufOnly.vim/plugin/BufOnly.vim')

print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/Users/runner/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. '/Users/runner/work/cursorless/cursorless/dist/cursorless.nvim'

print('CED: loading talon.vim')
require('talon').setup()

print('CED: loading cursorless.vim')
require('cursorless').setup()
