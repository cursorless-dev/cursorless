import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";
import { viteSingleFile } from "vite-plugin-singlefile";
import { getDefaultCheatsheetInfo } from "@cursorless/lib-common";
import {
  purgeCssOptions,
  viteHtmlParams,
  vitePreactAlias,
} from "@cursorless/lib-common/vite";

// oxlint-disable-next-line import/no-default-export
export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",
    },

    resolve: {
      alias: vitePreactAlias,
    },

    plugins: [
      purgeCss(purgeCssOptions),
      viteSingleFile(),
      viteHtmlParams({
        FAKE_CHEATSHEET_INFO: JSON.stringify(getDefaultCheatsheetInfo()),
      }),
    ],
  };
});
