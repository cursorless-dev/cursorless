import { fakeCheatsheetInfo } from "@cursorless/cheatsheet";
import { viteHtmlParams } from "@cursorless/common";
import preact from "@preact/preset-vite";
import { defineConfig, type UserConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "dist",
    },

    resolve: {
      conditions: ["cursorless:bundler"],
    },

    plugins: [
      preact(),
      viteSingleFile(),
      viteHtmlParams({
        FAKE_CHEATSHEET_INFO: JSON.stringify(fakeCheatsheetInfo),
      }),
    ],
  };
});
