// import {
//   cursorlessCommandIds,
// } from "./common";
// import { temp } from "./lib/temp";

import { cursorlessCommandIds } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { NeovimExtensionContext } from "./ide/neovim/NeovimExtensionContext";
import { NeovimClient, NvimPlugin } from "neovim";
import { activate } from "./extension";

export default function entry(plugin: any) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "TALON",
    () => {
      const currentDate: Date = new Date();
      const currentDateStr: string = currentDate.toLocaleString();

      console.warn(
        "TALON(): " + cursorlessCommandIds[1] + " " + currentDateStr,
      );
      // plugin.nvim.setLine(cursorlessCommandIds[2]);
      plugin.nvim.setLine(createCursorlessEngine.toString().split("\n")[0]);
      // return plugin.nvim.setLine("TALON");
      // return plugin.nvim.setLine(temp[2]);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "A",
    () => {
      const currentDate: Date = new Date();
      const currentDateStr: string = currentDate.toLocaleString();

      console.warn("A(): " + currentDateStr);
      plugin.nvim.setLine(currentDateStr);

      const extensionContext = new NeovimExtensionContext(plugin);
      activate(extensionContext);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "B",
    (args: any) => {
      const currentDate: Date = new Date();
      const currentDateStr: string = currentDate.toLocaleString();

      console.warn("B(): " + currentDateStr);
      console.warn("B(): " + args); // B(): lines,1,18,9,9,10,0
      // console.warn("B(): " + args[0]); // B(): lines,1,18,9,9,10,0
      // console.warn("B(): " + args[0][0]); // "lines"
      // console.warn("B(): " + typeof args); // object
      // console.warn("B(): " + typeof args[0]); // object
      // console.warn("B(): " + typeof args[0][0]); // string

      // https://neovim.io/doc/user/api.html#nvim_buf_attach()
      // https://neovim.io/doc/user/api.html#api-buffer-updates
      // https://vi.stackexchange.com/questions/26971/most-efficient-way-to-call-a-vim-script-function-with-lua-neovim
      const [
        headerStr,
        bufferHandle,
        changedTick,
        firstLineChanged,
        lastLineChanged,
        lastLineInUpdatedRange,
        byteCountPreviousContents,
        // ] = args[0]; // assumes vim.api.nvim_call_function("B", {...})
      ] = args; // assumes  vim.fn.B(...)
      console.warn(
        `B(): headerStr=${headerStr}, bufferHandle=${bufferHandle}, changedTick=${changedTick}, firstLineChanged=${firstLineChanged}, lastLineChanged-1=${
          lastLineChanged - 1
        }, lastLineInUpdatedRange=${lastLineInUpdatedRange}, byteCountPreviousContents=${byteCountPreviousContents}`,
      );

      // activate();
    },
    { sync: false },
  );

  plugin.registerFunction(
    "C",
    (args: any) => {
      const currentDate: Date = new Date();
      const currentDateStr: string = currentDate.toLocaleString();

      console.warn("C(): " + currentDateStr);
      console.warn("C(): " + args);
    },
    { sync: false },
  );
}
