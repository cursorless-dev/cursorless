import { defaultCheatsheetInfo } from "@cursorless/cheatsheet";
import { viteHtmlParams, vitePreactAlias } from "@cursorless/common";
import { defineConfig, type UserConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "dist",
    },

    resolve: {
      conditions: ["cursorless:bundler"],
      alias: vitePreactAlias,
    },

    plugins: [
      purgeCss({}),
      viteSingleFile(),
      viteHtmlParams({
        FAKE_CHEATSHEET_INFO: JSON.stringify(defaultCheatsheetInfo),
      }),
    ],
  };
});
