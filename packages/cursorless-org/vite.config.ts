import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",

    //   rolldownOptions: {
    //     onLog(level, log, defaultHandler) {
    //         console.log(log.code);
    //       if (
    //         level === "warn" &&
    //         log.code === "COMMONJS_VARIABLE_IN_ESM" &&
    //         typeof log.message === "string" &&
    //         log.message.includes("dash.all.min.js")
    //       ) {
    //         return;
    //       }
    //       defaultHandler(level, log);
    //     },
    //   },
    },

    resolve: {
      conditions: ["cursorless:bundler"],
    },

    plugins: [react(), svgr()],
  };
});
