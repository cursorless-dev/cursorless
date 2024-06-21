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
local function configure_command_server_shortcut()
  -- these mappings don't change the current mode
  -- https://neovim.io/doc/user/api.html#nvim_set_keymap()
  -- https://www.reddit.com/r/neovim/comments/pt92qn/mapping_cd_in_terminal_mode/
  vim.api.nvim_set_keymap(
    "i",
    "<C-S-F12>",
    "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    "n",
    "<C-S-F12>",
    "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    "c",
    "<C-S-F12>",
    "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    "v",
    "<C-S-F12>",
    "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
    { noremap = true }
  )
  vim.api.nvim_set_keymap(
    "t",
    "<C-S-F12>",
    "<cmd>lua vim.fn.CommandServerRunCommand()<CR>",
    { noremap = true }
  )
end

local function setup()
  register_functions()
  load_extensions()
  configure_command_server_shortcut()
end

local M = {
  setup = setup,
}

return M
