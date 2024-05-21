-- print('CED: loading BufOnly.vim')
vim.cmd('source C:\\Users\\runneradmin\\BufOnly.vim\\plugin\\BufOnly.vim')

-- print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. 'C:\\Users\\runneradmin\\talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. 'D:\\a\\cursorless\\cursorless\\dist\\cursorless.nvim'

-- print('CED: loading talon.vim')
require('talon').setup()

-- print('CED: loading cursorless.vim')
require('cursorless').setup()
