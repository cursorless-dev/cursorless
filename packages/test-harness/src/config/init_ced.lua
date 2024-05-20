-- print('CED: loading BufOnly.vim')
vim.cmd('source C:\\Users\\Cedric\\Desktop\\test\\BufOnly.vim\\plugin\\BufOnly.vim')

-- print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. 'C:\\Users\\Cedric\\Desktop\\test\\talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. 'C:\\work\\tools\\voicecoding\\cursorless_fork\\dist\\cursorless.nvim'

-- print('CED: loading talon.vim')
require('talon').setup()

-- print('CED: loading cursorless.vim')
require('cursorless').setup()
