describe("cursorless.nvim tests", function()
  local cursorless = require("cursorless.cursorless")

  describe("window_get_visible_lines()", function()
    it("Can read one visible line", function()
      local pos = vim.api.nvim_win_get_cursor(0)[2]
      local line = vim.api.nvim_get_current_line()
      local nline = line:sub(0, pos) .. "hello" .. line:sub(pos + 1)
      vim.api.nvim_set_current_line(nline)

      local visible = cursorless.window_get_visible_lines()
      assert(table.concat(visible) == table.concat({ 1, 1 }))
    end)

    it("Can read all lines visible on the window", function()
      local maxlines = vim.api.nvim_win_get_height(0)
      local lines = {}
      for _ = 1, (maxlines + 1) do
        table.insert(lines, "hello ")
      end
      vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
      local visible = cursorless.window_get_visible_lines()
      assert(table.concat(visible) == table.concat({ 1, maxlines }))
    end)
  end)
  describe("select_range()", function()
    it("Selects the specified range", function()
      local lines = "hello world"
      vim.api.nvim_buf_set_lines(0, 0, -1, false, vim.split(lines, "\n"))
      cursorless.select_range(1, 2, 1, 4)

      assert(table.concat(_G.get_selected_text()) == "llo")
    end)
  end)
  describe("buffer_get_selection()", function()
    it(
      "Can get the forward selection in a format expected by cursorless",
      function()
        local lines = "hello world"
        vim.api.nvim_buf_set_lines(0, 0, -1, false, vim.split(lines, "\n"))
        cursorless.select_range(1, 2, 1, 4)
        assert(
          table.concat(
            _G.convert_table_entries(
              cursorless.buffer_get_selection(),
              tostring
            ),
            ", "
          )
            == table.concat(
              _G.convert_table_entries({ 1, 3, 1, 5, false }, tostring),
              ", "
            )
        )
      end
    )
    it(
      "Can get the backward selection in a format expected by cursorless",
      function()
        local lines = "hello world"
        vim.api.nvim_buf_set_lines(0, 0, -1, false, vim.split(lines, "\n"))
        cursorless.select_range(1, 4, 1, 2)
        print(
          table.concat(
            _G.convert_table_entries(
              cursorless.buffer_get_selection(),
              tostring
            ),
            ", "
          )
        )
        assert(
          table.concat(
            _G.convert_table_entries(
              cursorless.buffer_get_selection(),
              tostring
            ),
            ", "
          )
            == table.concat(
              _G.convert_table_entries({ 1, 3, 1, 5, true }, tostring),
              ", "
            )
        )
      end
    )
  end)
end)
