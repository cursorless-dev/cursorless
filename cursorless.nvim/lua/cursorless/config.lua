local M = {}

function M.get_default_config()
  return {
    settings = {},
  }
end

-- Maybe better way to do this eventually, just taken from harpoon for now
function M.merge_config(partial_config, latest_config)
  partial_config = partial_config or {}
  local config = latest_config or M.get_default_config()
  for k, v in pairs(partial_config) do
    if k == 'settings' then
      config.settings = vim.tbl_extend('force', config.settings, v)
    else
      config[k] = vim.tbl_extend('force', config[k] or {}, v)
    end
  end
  return config
end

return M
