local M
local function register_functions()
  local utils = require("cursorless.utils")
  local path = utils.cursorless_nvim_path()
  -- revert to using forward slashes as it works when passed to remote#host#RegisterPlugin()
  if utils.is_platform_windows() then
    path = path:gsub("\\", "/")
  end
  vim.fn["remote#host#RegisterPlugin"](
    "node",
    path .. "/node/command-server/",
    {
      {
        type = "function",
        name = "CommandServerLoadExtension",
        sync = false,
        opts = vim.empty_dict(),
      },
      {
        type = "function",
        name = "CommandServerRunCommand",
        sync = false,
        opts = vim.empty_dict(),
      },
    }
  )
  vim.fn["remote#host#RegisterPlugin"](
    "node",
    path .. "/node/cursorless-neovim/",
    {
      {
        type = "function",
        name = "CursorlessLoadExtension",
        sync = false,
        opts = vim.empty_dict(),
      },
    }
  )
  vim.fn["remote#host#RegisterPlugin"]("node", path .. "/node/test-harness/", {
    {
      type = "function",
      name = "TestHarnessRun",
      sync = false,
      opts = vim.empty_dict(),
    },
  })
end

-- this triggers loading the node process as well as calling one function
-- in the cursorless-neovim, command-server and neovim-registry extensions
-- in order to initialize them
local function load_extensions()
  vim.fn.CursorlessLoadExtension()

  if os.getenv("CURSORLESS_MODE") == "test" then
    -- make sure cursorless is loaded before starting the tests
    vim.uv.sleep(1000)
    vim.fn.TestHarnessRun()
  else
    vim.fn.CommandServerLoadExtension()
  end
end

-- Cursorless command-server shortcut: CTRL+q
-- https://stackoverflow.com/questions/40504408/can-i-map-a-key-binding-to-a-function-in-vimrc
-- https://stackoverflow.com/questions/7642746/is-there-any-way-to-view-the-currently-mapped-keys-in-vim
-- luacheck:ignore 631
-- https://stackoverflow.com/questions/3776117/what-is-the-difference-between-the-remap-noremap-nnoremap-and-vnoremap-mapping
local function configure_command_server_shortcut(shortcut)
  -- these mappings don't change the current mode
  -- https://neovim.io/doc/user/api.html#nvim_set_keymap()
  -- https://www.reddit.com/r/neovim/comments/pt92qn/mapping_cd_in_terminal_mode/
  local modes = { "i", "n", "c", "v", "t" }
  for _, mode in ipairs(modes) do
    vim.api.nvim_set_keymap(
      mode,
      shortcut,
      "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
      { noremap = true }
    )
  end
end

local function setup(user_config)
  local config = require("cursorless.config").set_config(user_config)
  register_functions()
  load_extensions()
  configure_command_server_shortcut(config.shortcut)
end

M = {
  setup = setup,
  config = require("cursorless.config").get_config,
}

return M
