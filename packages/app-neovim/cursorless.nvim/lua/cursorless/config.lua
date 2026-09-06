local M = {}

local function default_shortcut()
  if require("cursorless.utils").is_platform_macos() then
    return "<C-M-\\>"
  end

  if require("cursorless.utils").is_platform_windows() then
    return "<C-S-F12>"
  end

  return "<C-`>"
end

local config = {
  shortcut = default_shortcut(),
}

function M.set_config(user_config)
  return vim.tbl_deep_extend("force", config, user_config or {})
end

function M.get_config()
  return config
end

return M
