local M = {}

-- Get the first and last visible line of the current window/buffer
-- @see https://vi.stackexchange.com/questions/28471/get-first-and-last-visible-line-from-other-buffer-than-current
-- w0/w$ are indexed from 1, similarly to what is shown in neovim
-- e.g. :lua print(dump_table(require('talon.cursorless').window_get_visible_lines()))"
--   window_get_visible_lines
--  { [1] = 28, [2] = 74 }
function M.window_get_visible_lines()
  -- print('window_get_visible_lines()')
  return { vim.fn.line('w0'), vim.fn.line('w$') }
end

-- https://www.reddit.com/r/neovim/comments/p4u4zy/how_to_pass_visual_selection_range_to_lua_function/
-- https://neovim.io/doc/user/api.html#nvim_win_get_cursor()
--
-- luacheck:ignore 631
-- e.g. run in command mode :vmap <c-a> <Cmd>lua print(vim.inspect(require('talon.cursorless').buffer_get_selection()))<Cr>
-- then go in visual mode with "v" and select "hello" on the first line and continue selection with "air"
-- on the second line.
-- Then hit ctrl+b and it will show the selection
-- cline=2, ccol=2, vline=1, vcol=1
-- sline=1, scol=1, eline=2, ecol=3, reverse=false
-- { 1, 1, 2, 3, false }
--
-- if instead you select from the end of the "air" word on the second line
-- and select up to the beginning of "hello" on the first line
-- cline=1, ccol=0, vline=3, vcol=3
-- sline=1, scol=1, eline=2, ecol=3, reverse=true
-- { 1, 1, 2, 3, true }
--
-- if you want to directly see how it is parsed in the node extension, you can use the below:
-- e.g. run in command mode :vmap <c-a> <Cmd>:call CursorlessLoadExtension()<Cr>
-- and again use ctrl+a after selecting the text
function M.buffer_get_selection()
  -- print('buffer_get_selection()')
  local modeInfo = vim.api.nvim_get_mode()
  local mode = modeInfo.mode

  local cursor = vim.api.nvim_win_get_cursor(0)
  local cline, ccol = cursor[1], cursor[2]
  local vline, vcol = vim.fn.line('v'), vim.fn.col('v')
  -- print(('cline=%d, ccol=%d, vline=%d, vcol=%d'):format(cline, ccol, vcol, vcol))

  local sline, scol
  local eline, ecol
  local reverse
  if cline == vline then
    --   if ccol <= vcol then
    if ccol < vcol then
      sline, scol = cline, ccol
      eline, ecol = vline, vcol
      scol = scol + 1
      reverse = true
    else
      sline, scol = vline, vcol
      eline, ecol = cline, ccol
      ecol = ecol + 1
      reverse = false
    end
  elseif cline < vline then
    sline, scol = cline, ccol
    eline, ecol = vline, vcol
    scol = scol + 1
    reverse = true
  else
    sline, scol = vline, vcol
    eline, ecol = cline, ccol
    ecol = ecol + 1
    reverse = false
  end

  if mode == 'V' or mode == 'CTRL-V' or mode == '\22' then
    scol = 1
    ecol = nil
  end

  -- print(
  --   ('sline=%d, scol=%d, eline=%d, ecol=%d, reverse=%s'):format(
  --     sline,
  --     scol,
  --     eline,
  --     ecol,
  --     tostring(reverse)
  --   )
  -- )
  return { sline, scol, eline, ecol, reverse }
end

-- https://www.reddit.com/r/neovim/comments/p4u4zy/how_to_pass_visual_selection_range_to_lua_function/
-- luacheck:ignore 631
-- e.g. run in command mode :vmap <c-b> <Cmd>lua print(vim.inspect(require('talon.cursorless').buffer_get_selection_text()))<Cr>
-- then go in visual mode with "v" and select "hello" on the first line and continue selection with "air"
-- on the second line.
-- Then hit ctrl+b and it will show the selection
-- { "hello", "air" }
function M.buffer_get_selection_text()
  -- print('buffer_get_selection_text()')
  local sline, scol, eline, ecol, _ = unpack(require('talon.cursorless').buffer_get_selection())

  local lines = vim.api.nvim_buf_get_lines(0, sline - 1, eline, 0)
  if #lines == 0 then
    return
  end

  local startText, endText
  if #lines == 1 then
    startText = string.sub(lines[1], scol, ecol)
  else
    startText = string.sub(lines[1], scol)
    endText = string.sub(lines[#lines], 1, ecol)
  end

  local selection = { startText }
  if #lines > 2 then
    vim.list_extend(selection, vim.list_slice(lines, 2, #lines - 1))
  end
  table.insert(selection, endText)

  return selection
end

-- https://github.com/nvim-treesitter/nvim-treesitter/blob/master/lua/nvim-treesitter/ts_utils.lua#L278
-- luacheck:ignore 631
-- https://github.com/nvim-treesitter/nvim-treesitter-textobjects/blob/master/lua/nvim-treesitter/textobjects/select.lua#L114
-- as an example if you put that in a vim buffer and do the following you can do a selection:
-- :w c:\work\tmp\test.lua
-- :so %
-- :lua select_range(5, 12, 5, 30)
-- for example it will highlight the last function name (nvim_win_set_cursor).
-- another example is :tmap <c-b> <Cmd>lua require("talon.cursorless").select_range(4, 0, 4, 38)<Cr>
-- NOTE: works for any mode (n,i,v,nt) except in t mode
function M.select_range(start_x, start_y, end_x, end_y)
  vim.cmd([[normal! :noh]])
  vim.api.nvim_win_set_cursor(0, { start_x, start_y })
  vim.cmd([[normal v]])
  vim.api.nvim_win_set_cursor(0, { end_x, end_y })
end

return M
