// import {
//   cursorlessCommandIds,
// } from "./common";
// const common = require("./common");

module.exports = (plugin) => {
  // Set your plugin to dev mode, which will cause the module to be reloaded on each invocation
  // plugin.setOptions({ dev: false });
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "TALON",
    () => {
      console.warn("BBBBB");
      return plugin.nvim.setLine("BBBBB");
    },
    { sync: false },
  );
};
