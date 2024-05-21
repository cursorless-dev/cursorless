-- vim.o.cmdheight = 1000

-- print('CED: loading BufOnly.vim')
vim.cmd('source C:\\Users\\Cedric\\Desktop\\test\\BufOnly.vim\\plugin\\BufOnly.vim')

-- print('CED: modifying runtimepath')
vim.o.runtimepath = vim.o.runtimepath .. ',' .. 'C:\\Users\\Cedric\\Desktop\\test\\talon.nvim'
vim.o.runtimepath = vim.o.runtimepath
  .. ','
  .. 'C:\\work\\tools\\voicecoding\\cursorless_fork\\dist\\cursorless.nvim'

vim.o.runtimepath = vim.o.runtimepath .. ',' .. 'C:\\Users\\Cedric\\Desktop\\test\\nui.nvim'
vim.o.runtimepath = vim.o.runtimepath .. ',' .. 'C:\\Users\\Cedric\\Desktop\\test\\noice.nvim'

-- print('CED: loading talon.vim')
require('talon').setup()

print('CED: loading cursorless.vim')
require('cursorless').setup()

require('noice').setup({
  lsp = {
    -- override markdown rendering so that **cmp** and other plugins use **Treesitter**
    override = {
      ['vim.lsp.util.convert_input_to_markdown_lines'] = true,
      ['vim.lsp.util.stylize_markdown'] = true,
      ['cmp.entry.get_documentation'] = true, -- requires hrsh7th/nvim-cmp
    },
  },
  -- you can enable a preset for easier configuration
  presets = {
    bottom_search = true, -- use a classic bottom cmdline for search
    command_palette = true, -- position the cmdline and popupmenu together
    long_message_to_split = true, -- long messages will be sent to a split
    inc_rename = false, -- enables an input dialog for inc-rename.nvim
    lsp_doc_border = false, -- add a border to hover docs and signature help
  },
})

-- this crashes nvim, when noice is loaded
-- print('CED: test print after loading noice')
