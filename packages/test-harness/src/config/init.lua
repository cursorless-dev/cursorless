local home_root = os.getenv('HOME_ROOT')
local repo_root = os.getenv('CURSORLESS_REPO_ROOT')

vim.cmd('source ' .. home_root .. '/BufOnly.vim/plugin/BufOnly.vim')

vim.o.runtimepath = vim.o.runtimepath .. ',' .. home_root .. '/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath .. ',' .. repo_root .. '/dist/cursorless.nvim'

require('talon').setup()
require('cursorless').setup()
