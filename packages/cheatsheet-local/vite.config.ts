import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { cheatsheetBodyClasses } from "../cheatsheet/src/lib/cheatsheetBodyClasses";
import { fakeCheatsheetInfo } from "../cheatsheet/src/lib/fakeCheatsheetInfo";

export default defineConfig(() => {
  return {
    build: {
      outDir: "dist",

      rollupOptions: {
        input: {
          index: "./index.html",
        },
      },
    },

    plugins: [react(), viteSingleFile(), injectCheatsheetTemplateData()],
  };
});

function injectCheatsheetTemplateData(): PluginOption {
  return {
    name: "inject-cheatsheet-template-data",
    transformIndexHtml(html) {
      return html
        .replaceAll("__BODY_CLASSES__", cheatsheetBodyClasses)
        .replaceAll(
          "__FAKE_CHEATSHEET_INFO__",
          JSON.stringify(fakeCheatsheetInfo),
        );
    },
  };
}
