-- print('CED: loading BufOnly.vim')
-- read paths from the environment variable?
-- XXX - so I only have one config file for all platforms
-- HOME and append the relative paths

local home_root = os.getenv('HOME_ROOT')
local repo_root = os.getenv('CURSORLESS_REPO_ROOT')

-- vim.cmd('source /home/runner/BufOnly.vim/plugin/BufOnly.vim')
vim.cmd('source ' .. home_root .. '/BufOnly.vim/plugin/BufOnly.vim')

-- print('CED: modifying runtimepath')
-- vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/talon.nvim'
-- vim.o.runtimepath = vim.o.runtimepath
--   .. ','
--   .. '/home/runner/work/cursorless/cursorless/dist/cursorless.nvim'
vim.o.runtimepath = vim.o.runtimepath .. ',' .. home_root .. '/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath .. ',' .. repo_root .. '/dist/cursorless.nvim'

require('talon').setup()
require('cursorless').setup()
