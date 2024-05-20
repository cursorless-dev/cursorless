print('CED: loading BufOnly.vim')
vim.cmd('source /home/runner/BufOnly.vim/plugin/BufOnly.vim')

print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. '/home/runner/work/cursorless/cursorless/dist/cursorless.nvim'

print('CED: loading talon.vim')
require('talon').setup()

print('CED: loading cursorless.vim')
require('cursorless').setup()
