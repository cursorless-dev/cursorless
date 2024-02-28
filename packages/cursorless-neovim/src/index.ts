// import {
//   cursorlessCommandIds,
// } from "./common";
// import { temp } from "./lib/temp";

import { cursorlessCommandIds } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { activate } from "./extension";

export default function entry(plugin: any) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "TALON",
    () => {
      console.warn("TALON");
      console.warn(cursorlessCommandIds[1]);
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

      console.warn("A");
      console.warn(currentDateStr);
      plugin.nvim.setLine(currentDateStr);
      activate();
    },
    { sync: false },
  );
}
