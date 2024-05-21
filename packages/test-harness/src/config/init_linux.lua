-- print('CED: loading BufOnly.vim')
vim.cmd('source /home/runner/BufOnly.vim/plugin/BufOnly.vim')

-- print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. '/home/runner/work/cursorless/cursorless/dist/cursorless.nvim'

-- vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/nui.nvim'
-- vim.o.runtimepath = vim.o.runtimepath .. ',' .. '/home/runner/noice.nvim'

-- print('CED: loading talon.vim')
require('talon').setup()

-- print('CED: loading cursorless.vim')
require('cursorless').setup()

-- attempt to avoid the "Press ENTER or type command to continue" prompt
-- local key = vim.api.nvim_replace_termcodes('\\<CR>', true, false, true)
-- vim.api.nvim_feedkeys(key, 'n', false)
-- local enter = vim.api.nvim_replace_termcodes('<CR>', true, true, true)
-- vim.fn.feedkeys(enter)

-- require('noice').setup({
--   lsp = {
--     -- override markdown rendering so that **cmp** and other plugins use **Treesitter**
--     override = {
--       ['vim.lsp.util.convert_input_to_markdown_lines'] = true,
--       ['vim.lsp.util.stylize_markdown'] = true,
--       ['cmp.entry.get_documentation'] = true, -- requires hrsh7th/nvim-cmp
--     },
--   },
--   -- you can enable a preset for easier configuration
--   presets = {
--     bottom_search = true, -- use a classic bottom cmdline for search
--     command_palette = true, -- position the cmdline and popupmenu together
--     long_message_to_split = true, -- long messages will be sent to a split
--     inc_rename = false, -- enables an input dialog for inc-rename.nvim
--     lsp_doc_border = false, -- add a border to hover docs and signature help
--   },
-- })
