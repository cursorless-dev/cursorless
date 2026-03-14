import { fakeCheatsheetInfo } from "@cursorless/cheatsheet";
import { viteHtmlParams } from "@cursorless/common";
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(() => {
  return {
    build: {
      outDir: "dist",
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
