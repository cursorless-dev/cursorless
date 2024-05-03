local M = {}

-- :lua print(require('cursorless.utils').is_win())
function M.is_win()
  return package.config:sub(1, 1) == '\\'
end

-- :lua print(require('cursorless.utils').get_path_separator())
function M.get_path_separator()
  if require('cursorless.utils').is_win() then
    return '\\'
  end
  return '/'
end

-- https://www.reddit.com/r/neovim/comments/tk1hby/get_the_path_to_the_current_lua_script_in_neovim/
-- https://pgl.yoyo.org/luai/i/debug.getinfo
-- https://www.gammon.com.au/scripts/doc.php?lua=debug.getinfo
-- e.g. :lua print(require('cursorless.utils').cursorless_nvim_path())
-- outputs: C:\Users\User\AppData\Local\nvim-data\lazy\talon.nvim
-- NOTE: Development cursorless-neovim is installed in: C:\Users\User\AppData\Local\nvim\rplugin\node\cursorless-neovim
function M.cursorless_nvim_path()
  --source_file=@C:/Users/User/AppData/Local/nvim-data/lazy/talon.nvim/lua/talon/utils.lua
  local str = debug.getinfo(1, 'S').source
  -- print(('source_file=%s'):format(str))
  -- skip as the file name is prefixed by "@"
  str = str:sub(2)
  -- print(('source_file2=%s'):format(str))
  if require('cursorless.utils').is_win() then
    str = str:gsub('/', '\\')
    -- print('is_win')
  end
  -- print(('source_file3=%s'):format(str))
  -- remove where our current file is located to get talon.nvim base path
  str = str:sub(0, -1 - #'lua/cursorless/utils.lua')
  -- print(('talon.nvim=%s'):format(str))
  return str
end

-- assumes we are in terminal mode and switch to normal terminal mode
-- https://www.reddit.com/r/neovim/comments/uk3xmq/change_mode_in_lua/
-- https://neovim.io/doc/user/api.html#nvim_feedkeys()
-- https://neovim.io/doc/user/builtin.html#feedkeys()
-- https://neovim.io/doc/user/api.html#nvim_replace_termcodes()
-- e.g. run in command mode :tmap <c-a> <Cmd>lua mode_switch_nt()<Cr>
function M.mode_switch_nt()
  local key = vim.api.nvim_replace_termcodes('<c-\\><c-n>', true, false, true)
  vim.api.nvim_feedkeys(key, 'n', false)
end

-- assumes we are in normal terminal mode and switch to terminal mode
-- e.g. run in command mode :nmap <c-b> <Cmd>lua mode_switch_t()<Cr>
function M.mode_switch_t()
  vim.api.nvim_feedkeys('i', 'n', true)
end

-- paste what is in the clipboard
-- https://www.baeldung.com/linux/vim-paste-text
-- e.g. run in command mode :imap <c-b> <Cmd>lua require('cursorless.utils').paste()<Cr>
function M.paste()
  vim.cmd([[normal! "+p]])
end

return M
