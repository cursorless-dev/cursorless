import defaultCheatsheetInfo from "@cursorless/lib-cheatsheet/defaultSpokenForms";
import { viteHtmlParams, vitePreactAlias } from "@cursorless/lib-common/vite";
import { defineConfig, type UserConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",
    },

    resolve: {
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
