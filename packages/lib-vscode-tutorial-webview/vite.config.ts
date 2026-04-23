import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";
import { vitePreactAlias } from "@cursorless/lib-common/vite";

// oxlint-disable-next-line import/no-default-export
export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",
      sourcemap: true,

      lib: {
        entry: "./src/index.tsx",
        cssFileName: "index",
        formats: ["cjs"],
      },

      rollupOptions: {
        output: {
          entryFileNames: "index.js",
        },
      },
    },

    resolve: {
      alias: vitePreactAlias,
    },

    plugins: [purgeCss({})],
  };
});
