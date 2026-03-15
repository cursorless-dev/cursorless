import { defineConfig, type UserConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";

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
      conditions: ["cursorless:bundler"],
    },

    plugins: [purgeCss({})],
  };
});
