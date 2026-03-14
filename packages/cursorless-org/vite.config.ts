import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",
    },

    resolve: {
      conditions: ["cursorless:bundler"],
    },

    plugins: [react(), svgr()],

    server: {
      fs: {
        allow: [__dirname, ...references],
      },
    },
  };
});

const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map(({ path }: { path: string }) => join(__dirname, path));
