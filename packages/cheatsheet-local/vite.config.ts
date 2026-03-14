import { fakeCheatsheetInfo } from "@cursorless/cheatsheet";
import { viteHtmlParams } from "@cursorless/common";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(() => {
  return {
    build: {
      outDir: "dist",
    },

    plugins: [
      react(),
      viteSingleFile(),
      viteHtmlParams({
        FAKE_CHEATSHEET_INFO: JSON.stringify(fakeCheatsheetInfo),
      }),
    ],
  };
});
