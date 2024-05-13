-- local Config = require('cursorless.config')

-- We can't use that yet as then when we use load_extensions() we get an error.
-- So instead atm we rely on registering the functions from vim script
-- local function register_functions1()
--   local path = require('cursorless.utils').cursorless_nvim_path()
--   vim.api.nvim_call_function('remote#host#RegisterPlugin', {
--     'node',
--     path .. '/rplugin/node/command-server',
--     {
--       { sync = false, name = 'CommandServerLoadExtension', type = 'function', opts = {} },
--       { sync = false, name = 'CommandServerRunCommand', type = 'function', opts = {} },
--     },
--   })
--   vim.api.nvim_call_function('remote#host#RegisterPlugin', {
--     'node',
--     path .. '/rplugin/node/cursorless-neovim',
--     {
--       { sync = false, name = 'CursorlessLoadExtension', type = 'function', opts = {} },
--     },
--   })
--   vim.api.nvim_call_function('remote#host#RegisterPlugin', {
--     'node',
--     path .. '/rplugin/node/neovim-registry',
--     {},
--   })
-- end

local function register_functions()
  local path = require('cursorless.utils').cursorless_nvim_path()
  -- revert to using forward slashes as works when passed to remote#host#RegisterPlugin()
  if require('cursorless.utils').is_win() then
    path = path:gsub('\\', '/')
  end
  vim.api.nvim_call_function('RegisterFunctions', { path })
end

-- this triggers loading the node process as well as calling one function
-- in the cursorless-neovim, command-server and neovim-registry extensions
-- in order to initialize them
local function load_extensions()
  vim.api.nvim_call_function('CursorlessLoadExtension', {})
  vim.api.nvim_call_function('CommandServerLoadExtension', {})

  if os.getenv('CURSORLESS_MODE') == 'test' then
    -- make sure cursorless is loaded before starting the tests
    -- see https://neovim.io/doc/user/various.html#%3Asleep
    vim.cmd([[sleep 5]])
    vim.api.nvim_call_function('TestHarnessRun', {})
  end
end

-- Cursorless command-server shortcut: CTRL+q
-- https://stackoverflow.com/questions/40504408/can-i-map-a-key-binding-to-a-function-in-vimrc
-- https://stackoverflow.com/questions/7642746/is-there-any-way-to-view-the-currently-mapped-keys-in-vim
-- luacheck:ignore 631
-- https://stackoverflow.com/questions/3776117/what-is-the-difference-between-the-remap-noremap-nnoremap-and-vnoremap-mapping
local function configure_command_server_shortcut()
  -- these mappings don't change the current mode
  -- https://neovim.io/doc/user/api.html#nvim_set_keymap()
  -- https://www.reddit.com/r/neovim/comments/pt92qn/mapping_cd_in_terminal_mode/
  vim.api.nvim_set_keymap(
    'i',
    '<C-S-F12>',
    '<cmd>lua vim.fn.CommandServerRunCommand()<CR>',
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    'n',
    '<C-S-F12>',
    '<cmd>lua vim.fn.CommandServerRunCommand()<CR>',
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    'c',
    '<C-S-F12>',
    '<cmd>lua vim.fn.CommandServerRunCommand()<CR>',
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    'v',
    '<C-S-F12>',
    '<cmd>lua vim.fn.CommandServerRunCommand()<CR>',
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    't',
    '<C-S-F12>',
    '<cmd>lua vim.fn.CommandServerRunCommand()<CR>',
    { noremap = true }
  )
  -- we do change the mode when in terminal mode before running anything though.
  -- This is to ease doing stuff
  -- like calling select_range() as otherwise it would fail for now
  -- vim.api.nvim_set_keymap(
  --   't',
  --   '<C-S-F12>',
  --   [[<c-\><c-n><cmd>lua vim.fn.CommandServerRunCommand()<CR>]],
  --   { noremap = true }
  -- )
  -- from insert mode, go into normal mode before executing the command
  -- https://stackoverflow.com/questions/4416512/why-use-esc-in-vim
  -- https://vim.fandom.com/wiki/Use_Ctrl-O_instead_of_Esc_in_insert_mode_mappings
  -- vim.cmd([[
  --   inoremap <C-S-F12> <c-o>:call CommandServerRunCommand("i")<CR>
  -- ]])
  -- vim.cmd([[
  -- nnoremap <C-S-F12> :call CommandServerRunCommand("n")<CR>
  -- cnoremap <C-S-F12> :call CommandServerRunCommand("c")<CR>
  -- vnoremap <C-S-F12> :call CommandServerRunCommand("v")<CR>
  -- ]])
  -- -- https://vi.stackexchange.com/questions/4919/exit-from-terminal-mode-in-neovim-vim-8
  -- vim.cmd([[
  --   tnoremap <C-S-F12> <c-\><c-n>:call CommandServerRunCommand("t")<CR><CR>
  -- ]])
end

local function setup() -- setup(user_config)
  -- local config = Config.merge_config(user_config)

  vim.cmd('source ' .. require('cursorless.utils').cursorless_nvim_path() .. '/vim/cursorless.vim')
  register_functions()
  load_extensions()
  configure_command_server_shortcut()
end

local M = {
  setup = setup,
}

return M
