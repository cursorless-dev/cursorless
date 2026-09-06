-- This file gets linked into plugin/helpers.lua of busted nvim config
-- Functions that are exposed to all tests

function _G.get_selected_text()
  local _, ls, cs = unpack(vim.fn.getpos("v"))
  local _, le, ce = unpack(vim.fn.getpos("."))
  return vim.api.nvim_buf_get_text(0, ls - 1, cs - 1, le - 1, ce, {})
end

function _G.convert_table_entries(tbl, func)
  local mapped = {}
  for k, v in pairs(tbl) do
    mapped[k] = func(v)
  end
  return mapped
end
