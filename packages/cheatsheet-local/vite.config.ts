import { fakeCheatsheetInfo } from "@cursorless/cheatsheet";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(() => {
  return {
    build: {
      outDir: "dist",
    },

    plugins: [react(), viteSingleFile(), injectCheatsheetTemplateData()],
  };
});

function injectCheatsheetTemplateData(): PluginOption {
  return {
    name: "inject-cheatsheet-template-data",
    transformIndexHtml(html) {
      return html.replace(
        "__FAKE_CHEATSHEET_INFO__",
        JSON.stringify(fakeCheatsheetInfo),
      );
    },
  };
}
