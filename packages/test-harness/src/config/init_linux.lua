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

-- attempt to avoid the "Press ENTER or type command to continue" prompt
local key = vim.api.nvim_replace_termcodes('<cr>', true, false, true)
vim.api.nvim_feedkeys(key, 'n', false)
