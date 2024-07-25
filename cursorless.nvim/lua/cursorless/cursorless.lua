local M = {}

-- Get the first and last visible line of the current window/buffer
-- @see https://vi.stackexchange.com/questions/28471/get-first-and-last-visible-line-from-other-buffer-than-current
-- w0/w$ are indexed from 1, similarly to what is shown in neovim
-- e.g. :lua print(vim.inspect(require('cursorless').window_get_visible_lines()))"
--   window_get_visible_lines
--  { [1] = 28, [2] = 74 }
function M.window_get_visible_lines()
  -- print('window_get_visible_lines()')
  return { vim.fn.line("w0"), vim.fn.line("w$") }
end

-- Get the coordinates of the current selection
-- To manually test follow these steps:
-- 1. In command mode :vmap <c-a> <Cmd>lua print(vim.inspect(require('cursorless').buffer_get_selection()))<Cr>
-- 2. type "hello" on the first line and "world" on the second line
-- 3. Enter visual mode and select "hello" on the first line and continue selection with "world"
--    on the second line.
-- 4. Hit ctrl+a to show the selection: {1, 1, 2, 5, false}
-- 5. Hit 'o' to swap the cursor position and hit ctrl+a again: {1, 1, 2, 5, true}
--
-- If you want to directly see how it is parsed in the node extension:
-- 1. run in command mode :vmap <c-a> <Cmd>:call CursorlessLoadExtension()<Cr>
-- 2. Select some text and hit ctrl+a
function M.buffer_get_selection()
  local start_pos = vim.fn.getpos("v") -- start of visual selection
  local start_line, start_col = start_pos[2], start_pos[3]
  local end_pos = vim.fn.getpos(".") -- end of visual selection (cursor position)
  local end_line, end_col = end_pos[2], end_pos[3]
  local reverse = false
  local mode = vim.api.nvim_get_mode().mode

  -- Invert the values depending on if the cursor is before the start
  if end_line < start_line or end_col < start_col then
    start_line, start_col, end_line, end_col =
      end_line, end_col, start_line, start_col
    reverse = true
  end

  -- See https://github.com/cursorless-dev/cursorless/issues/2537 if you want to add more modes
  if mode == "V" then
    -- Line and block-based visual modes are line-based, so we don't need to track the columns
    start_col = 1
    end_col = nil
  end

  return { start_line, start_col, end_line, end_col, reverse }
end

-- https://github.com/nvim-treesitter/nvim-treesitter/blob/master/lua/nvim-treesitter/ts_utils.lua#L278
-- If you have a buffer with the line: "hello world"
-- :lua require("cursorless.cursorless").select_range(1, 2, 1, 4)
-- will highlight "llo"
-- NOTE: works for any mode (n,i,v,nt) except in t mode
function M.select_range(start_line, start_col, end_line, end_col)
  vim.cmd([[silent! normal! :noh]])
  vim.api.nvim_win_set_cursor(0, { start_line, start_col })
  vim.cmd([[silent! normal v]])
  vim.api.nvim_win_set_cursor(0, { end_line, end_col })
end

return M
