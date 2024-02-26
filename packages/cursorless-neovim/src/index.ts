// import {
//   cursorlessCommandIds,
// } from "./common";
// import { temp } from "./lib/temp";

import { cursorlessCommandIds } from "@cursorless/common";

export default function entry(plugin: any) {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "TALON",
    () => {
      console.warn("TALON");
      console.warn(cursorlessCommandIds[1]);
      plugin.nvim.setLine(cursorlessCommandIds[1]);
      // return plugin.nvim.setLine("TALON");
      // return plugin.nvim.setLine(temp[2]);
    },
    { sync: false },
  );
}
