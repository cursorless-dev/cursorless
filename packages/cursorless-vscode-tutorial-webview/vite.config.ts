import preact from "@preact/preset-vite";
import { defineConfig, type UserConfig } from "vite";

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

    plugins: [preact()],
  };
});
