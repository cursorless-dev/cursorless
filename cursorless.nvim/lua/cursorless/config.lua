local M = {}

local function default_shortcut()
  local windows_shortcut = "<C-S-F12>"
  local unix_shortcut = "<C-`>"
  return require("cursorless.utils").is_platform_windows() and windows_shortcut
    or unix_shortcut
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
